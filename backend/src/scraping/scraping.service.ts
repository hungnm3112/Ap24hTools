import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CompetitorsService } from '../competitors/competitors.service';
import { ScrapedProductsService } from '../scraped-products/scraped-products.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private readonly competitorsService: CompetitorsService,
    private readonly scrapedProductsService: ScrapedProductsService,
  ) {}
  async getProxyHtml(url: string, customCookies?: string): Promise<string> {
    if (!url) {
      throw new BadRequestException('Bắt buộc phải cung cấp URL để cào dữ liệu');
    }

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      
      if (customCookies) {
        await page.setExtraHTTPHeaders({ 'Cookie': customCookies });
      }

      // Chặn tải các tài nguyên không cần thiết để tăng tốc độ load trang (Ảnh, Font)
      await page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          route.continue();
        } else {
          route.continue();
        }
      });

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const originUrl = new URL(url).origin;
      
      await page.evaluate((origin) => {
        // 1. XÓA TOÀN BỘ SCRIPT CỦA ĐỐI THỦ
        // LÝ DO (WHY): 
        // - Nếu để nguyên, khi Iframe ở Next.js render mã HTML này, các script của đối thủ (Vue/React) sẽ chạy lại.
        // - Chúng sẽ đọc URL hiện tại (là /api/scraping/proxy) và tưởng là lỗi 404 trang không tồn tại -> Gây ra lỗi chuyển trang như bạn vừa gặp.
        // - Chúng cũng sẽ gọi API (CORS lỗi) và gây rác console.
        // - Do đó, ta phải xóa sạch não (JS) của trang web, chỉ giữ lại xác (HTML/CSS).
        document.querySelectorAll('script, noscript').forEach(el => el.remove());

        // 2. SỬA ĐƯỜNG DẪN TƯƠNG ĐỐI
        const baseTag = document.createElement('base');
        baseTag.href = origin;
        document.head.prepend(baseTag);

        // 3. BƠM SCRIPT GIÁN ĐIỆP CỦA CHÚNG TA VÀO TRANG
        const injectedScript = document.createElement('script');
        injectedScript.textContent = `
          window.isDeleteMode = false; // Trạng thái chế độ xóa rác

          // [CSS] Nhúng style highlight để mô phỏng Chrome DevTools
          const style = document.createElement('style');
          style.textContent = \`
            .ap24h-highlight-hover {
              outline: 2px solid #1677ff !important;
              background-color: rgba(22, 119, 255, 0.3) !important;
              cursor: pointer !important;
              transition: all 0.1s ease;
            }
            .ap24h-highlight-delete-hover {
              outline: 2px dashed #ff4d4f !important;
              background-color: rgba(255, 77, 79, 0.3) !important;
              cursor: crosshair !important;
              transition: all 0.1s ease;
            }
          \`;
          document.head.appendChild(style);

          // Lắng nghe lệnh từ Next.js Parent
          window.addEventListener('message', function(event) {
            if (event.data === 'TOGGLE_DELETE_MODE_ON') {
              window.isDeleteMode = true;
            } else if (event.data === 'TOGGLE_DELETE_MODE_OFF') {
              window.isDeleteMode = false;
            }
          });

          // [SỰ KIỆN HOVER] Làm nổi bật phần tử
          document.addEventListener('mouseover', function(e) {
            e.stopPropagation();
            if (window.isDeleteMode) {
              e.target.classList.add('ap24h-highlight-delete-hover');
            } else {
              e.target.classList.add('ap24h-highlight-hover');
            }
          }, true);

          // [SỰ KIỆN MẤT HOVER] Xóa nổi bật
          document.addEventListener('mouseout', function(e) {
            e.stopPropagation();
            e.target.classList.remove('ap24h-highlight-hover', 'ap24h-highlight-delete-hover');
          }, true);

          // Chặn mọi hành vi click mặc định
          document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target;
            
            // Phải xóa class highlight trước khi copy HTML (tránh copy nhầm class rác của tool)
            target.classList.remove('ap24h-highlight-hover', 'ap24h-highlight-delete-hover');

            // Nếu đang bật chế độ xóa rác -> Tiêu diệt phần tử bị click
            if (window.isDeleteMode) {
              target.remove();
              return;
            }

            const clonedElement = target.cloneNode(true);
            
            // Xóa nội dung thừa bên trong để mã HTML gọn gàng hơn nếu cần
            // Gửi thông điệp ra ngoài Iframe (Về Next.js)
            window.parent.postMessage({
              type: 'SELECT_ELEMENT',
              html: clonedElement.outerHTML,
              tagName: target.tagName,
              className: target.className
            }, '*');
          }, true);

          // Vô hiệu hóa mọi thẻ <a> để click không bị nhảy trang
          document.querySelectorAll('a').forEach(a => {
            a.onclick = function(e) { e.preventDefault(); };
          });
        `;
        document.body.appendChild(injectedScript);
      }, originUrl);

      // Trích xuất toàn bộ mã HTML (Lúc này đã sạch bóng JS đối thủ, chỉ còn JS của ta)
      const finalHtml = await page.content();
      return finalHtml;

    } catch (error) {
      console.error('Lỗi Playwright:', error);
      throw new BadRequestException('Không thể tải trang web đối thủ: ' + error.message);
    } finally {
      await browser.close();
    }
  }

  /*
   * Tích hợp AI (Google Gemini) để phân tích HTML và sinh CSS Selector
   */
  async generateAiSelector(htmlSnippet: string, fieldName: string): Promise<{ selector: string }> {
    if (!htmlSnippet) {
      throw new BadRequestException('Không có mã HTML để phân tích');
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new BadRequestException('Chưa cấu hình GEMINI_API_KEY trong file .env');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng model được cấu hình trong .env (mặc định là gemini-1.5-flash)
      const aiModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: aiModelName });

      const prompt = `
        Bạn là một chuyên gia lập trình Web Scraping (bóc tách dữ liệu web).
        Dưới đây là một đoạn mã HTML tĩnh mà tôi vừa lấy được từ một trang web thương mại điện tử.
        Tôi muốn bóc tách dữ liệu cho trường (field): "${fieldName}".

        Nhiệm vụ của bạn là:
        1. Phân tích cấu trúc HTML này.
        2. Đề xuất một đoạn CSS Selector NGẮN GỌN, CHÍNH XÁC NHẤT và CÓ TÍNH ỔN ĐỊNH CAO để có thể chọn được phần tử tương ứng với trường "${fieldName}" (Ví dụ: ".product-price", ".title h3", "img.thumbnail").
        3. Tuyệt đối không dùng những class có dạng mã băm ngẫu nhiên sinh ra bởi React/Vue (ví dụ: class="name_xyz123"). Hãy ưu tiên các class có ý nghĩa hoặc cấu trúc cây (VD: div.info > h1).

        Yêu cầu Output: 
        Chỉ trả về DUY NHẤT một chuỗi JSON chuẩn theo định dạng sau, không giải thích gì thêm, không bọc trong thẻ markdown (không dùng \`\`\`json):
        {"selector": "css_selector_cua_ban"}

        Đây là mã HTML:
        ${htmlSnippet.substring(0, 5000)} // Cắt bớt nếu quá dài để tránh vượt giới hạn token
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      try {
        // Cố gắng parse JSON trực tiếp
        // Đôi khi AI vẫn cố chấp trả về ```json ... ```, ta cần tiền xử lý
        const cleanedText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        const json = JSON.parse(cleanedText);
        return { selector: json.selector };
      } catch (parseError) {
        console.error('Lỗi Parse JSON từ AI:', responseText);
        throw new BadRequestException('AI trả về kết quả không đúng định dạng JSON.');
      }
    } catch (error) {
      console.error('Lỗi gọi Gemini AI:', error);
      throw new BadRequestException('Lỗi khi phân tích AI: ' + error.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Bắt đầu tiến trình cào dữ liệu tự động định kỳ...');
    await this.runAutoScraping();
  }

  async runAutoScraping(targetCompetitorId?: string) {
    let competitors: any[] = [];
    if (targetCompetitorId) {
      const comp = await this.competitorsService.findOne(targetCompetitorId);
      if (comp) competitors.push(comp);
    } else {
      competitors = await this.competitorsService.findActive();
    }

    if (competitors.length === 0) {
      this.logger.warn('Không có đối thủ nào đang active để cào.');
      return { status: 'No active competitors' };
    }

    const browser = await chromium.launch({ headless: true });
    
    for (const competitor of competitors) {
      this.logger.log(`Đang cào dữ liệu cho đối thủ: ${competitor.name}`);
      const selectors = competitor.selectors || {};
      const productItemSelector = selectors.productItem;
      const nextPageSelector = selectors.nextPageButton;

      if (!productItemSelector) {
        this.logger.warn(`Đối thủ ${competitor.name} chưa cấu hình selector productItem, bỏ qua.`);
        continue;
      }

      for (const urlObj of competitor.scrapingUrls) {
        const url = urlObj.url;
        this.logger.log(`- Đang xử lý URL: ${url}`);
        
        try {
          const page = await browser.newPage();
          // Chặn tài nguyên tĩnh
          await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'media', 'font'].includes(type)) {
              route.continue();
            } else {
              route.continue();
            }
          });

          await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          
          let hasNextPage = true;
          let totalExtracted = 0;
          const seenUrls = new Set<string>();

          while (hasNextPage) {
            const plainSelectors = JSON.parse(JSON.stringify(selectors));
            // Lấy danh sách sản phẩm hiện tại trên trang
            const products = await page.evaluate((sel) => {
              const items = document.querySelectorAll(sel.productItem);
              const result: { name: string; price: number; image: string; productUrl: string; }[] = [];
              items.forEach(item => {
                let name = '', price = 0, image = '', productUrl = '';
                
                if (sel.productName) {
                  const el = item.querySelector(sel.productName);
                  if (el) name = el.textContent?.trim() || '';
                }
                if (sel.productPrice) {
                  const el = item.querySelector(sel.productPrice);
                  if (el) {
                    const priceText = el.textContent?.replace(/[^0-9]/g, '');
                    if (priceText) price = parseInt(priceText, 10);
                  }
                }
                if (sel.productImage) {
                  const el = item.querySelector(sel.productImage);
                  if (el) {
                    if (el.tagName === 'IMG') image = el.getAttribute('src') || '';
                    else image = el.getAttribute('data-src') || el.style.backgroundImage || '';
                  }
                }
                
                // Cố gắng tìm thẻ a để lấy URL sản phẩm (nếu user cấu hình thẻ a thì lấy href)
                const aEl = item.tagName === 'A' ? item : item.querySelector('a');
                if (aEl) productUrl = aEl.getAttribute('href') || '';
                // Chuẩn hóa URL nếu bị thiếu gốc
                if (productUrl && productUrl.startsWith('/')) {
                  const urlObj = new URL(location.href);
                  productUrl = urlObj.origin + productUrl;
                }

                if (name && productUrl) {
                  result.push({ name, price, image, productUrl });
                }
              });
              return result;
            }, plainSelectors);

            // Lưu sản phẩm vào Database (Upsert)
            for (const p of products) {
              if (!seenUrls.has(p.productUrl)) {
                seenUrls.add(p.productUrl);
                await this.scrapedProductsService.upsertProduct({
                  siteId: competitor._id,
                  productUrl: p.productUrl,
                  productName: p.name,
                  productPrice: p.price,
                  productImage: p.image
                });
                totalExtracted++;
              }
            }

            // Xử lý Phân trang (Hybrid)
            if (nextPageSelector) {
              const currentProductCount = await page.locator(productItemSelector).count();
              const nextBtn = page.locator(nextPageSelector).first();
              
              if (await nextBtn.isVisible()) {
                this.logger.log(`Clicking next page... (đang có ${currentProductCount} SP)`);
                await nextBtn.click({ force: true });
                
                // Chờ cho đến khi số lượng SP tăng lên (Ajax Load More) hoặc URL thay đổi (Next Page)
                try {
                  const currentUrl = page.url();
                  let waitCount = 0;
                  let added = false;
                  while (waitCount < 20) { // Đợi tối đa 10s (20 * 500ms)
                    await page.waitForTimeout(500);
                    // Nếu URL thay đổi -> đã sang trang mới
                    if (page.url() !== currentUrl) {
                      added = true;
                      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
                      break;
                    }
                    // Nếu số lượng sản phẩm tăng lên -> đã Load More thành công
                    const newCount = await page.locator(productItemSelector).count();
                    if (newCount > currentProductCount) {
                      added = true;
                      break;
                    }
                    waitCount++;
                  }
                  
                  if (!added) {
                    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
                  }
                } catch (e) {
                  this.logger.warn('Lỗi khi chờ phân trang: ' + e.message);
                }

                // Kiểm tra xem số lượng phần tử có tăng lên hoặc url có thay đổi không
                const newProductCount = await page.locator(productItemSelector).count();
                if (newProductCount <= currentProductCount) {
                  // Giả định nếu số lượng không đổi và URL không đổi -> Đã hết trang
                  this.logger.log('Đã tới trang cuối cùng.');
                  hasNextPage = false;
                }
              } else {
                hasNextPage = false;
              }
            } else {
              hasNextPage = false;
            }
          }
          
          this.logger.log(`=> Đã trích xuất tổng cộng ${totalExtracted} sản phẩm từ ${url}`);
          await page.close();

        } catch (err) {
          this.logger.error(`Lỗi khi cào URL ${url}:`, err);
        }
      }
    }

    await browser.close();
    this.logger.log('Hoàn thành quá trình cào dữ liệu.');
    return { status: 'success' };
  }
}
