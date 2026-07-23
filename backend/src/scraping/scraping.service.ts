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
  ) { }
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

  async runAutoScraping(targetCompetitorId?: string, targetUrl?: string) {
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

    this.logger.log(`Bắt đầu khởi chạy trình duyệt Playwright (headless: false) để quan sát...`);
    const browser = await chromium.launch({ headless: false });
    
    for (const competitor of competitors) {
      this.logger.log(`Đang cào dữ liệu cho đối thủ: ${competitor.name}`);
      const selectors = competitor.selectors || {};
      const productItemSelector = selectors.productItem;
      const nextPageSelector = selectors.nextPageButton;

      if (!productItemSelector) {
        this.logger.warn(`Đối thủ ${competitor.name} chưa cấu hình selector productItem, bỏ qua.`);
        continue;
      }

      const urlsToRun = competitor.scrapingUrls
        .filter(u => !targetUrl || u.url === targetUrl)
        .map(u => u.url);

      const chunkSize = 3;
      for (let i = 0; i < urlsToRun.length; i += chunkSize) {
        const chunkUrls = urlsToRun.slice(i, i + chunkSize);
        this.logger.log(`>> Chạy song song Batch [${i + 1} - ${i + chunkUrls.length}] / ${urlsToRun.length} URLs...`);
        
        await Promise.all(chunkUrls.map(url => 
          this.scrapeSingleUrl(browser, url, competitor, selectors)
        ));
      }
    }

    await browser.close();
    this.logger.log('Hoàn thành quá trình cào dữ liệu.');
    return { status: 'success' };
  }

  private async scrapeSingleUrl(browser: any, url: string, competitor: any, selectors: any) {
    const productItemSelector = selectors.productItem;
    const nextPageSelector = selectors.nextPageButton;

    this.logger.log(`- Đang xử lý URL: ${url}`);
    try {
      const page = await browser.newPage();
      await page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          route.continue(); // Có thể tối ưu thành route.abort() nhưng để tránh lỗi layout ta cứ continue hoặc abort
          // Đã tối ưu bằng route.abort() ở dưới
        } else {
          route.continue();
        }
      });
      // Tối ưu chặn tài nguyên tĩnh thực sự
      await page.route('**/*.{png,jpg,jpeg,webp,gif,woff,woff2,ttf,css}', route => route.abort());

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      let hasNextPage = true;
      let totalExtracted = 0;
      const seenUrls = new Set<string>();

      while (hasNextPage) {
        const plainSelectors = JSON.parse(JSON.stringify(selectors));
        const products = await page.evaluate((sel) => {
          const combinedSelector = sel.productListContainer
            ? `${sel.productListContainer} ${sel.productItem}`
            : sel.productItem;
          const items = document.querySelectorAll(combinedSelector);
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
            const aEl = item.tagName === 'A' ? item : item.querySelector('a');
            if (aEl) productUrl = aEl.getAttribute('href') || '';
            const origin = new URL(location.href).origin;
            if (productUrl && productUrl.startsWith('/')) {
              productUrl = origin + productUrl;
            }
            if (name && productUrl) {
              result.push({ name, price, image, productUrl });
            }
          });
          return result;
        }, plainSelectors);

        this.logger.log(`>> Parse được ${products.length} sản phẩm trên trang hiện tại (URL: ${page.url()})`);
        
        let newProductsCount = 0;
        for (const p of products) {
          if (!seenUrls.has(p.productUrl)) {
            seenUrls.add(p.productUrl);
            newProductsCount++;
            
            await this.scrapedProductsService.upsertProduct({
              siteId: competitor._id,
              productUrl: p.productUrl,
              productName: p.name,
              productPrice: p.price,
              productImage: p.image
            });
          }
        }
        totalExtracted += newProductsCount;
        this.logger.log(`<< Hoàn thành lưu thô ${newProductsCount} SP vào DB (URL: ${url}).`);

        if (nextPageSelector) {
          const currentProductCount = await page.locator(productItemSelector).count();
          const nextBtn = page.locator(nextPageSelector).first();

          if (await nextBtn.isVisible()) {
            const currentUrl = page.url();
            this.logger.log(`Clicking next page... (đang có ${currentProductCount} SP)`);

            let clickTarget = nextBtn;
            const tagName = await nextBtn.evaluate(el => el.tagName);
            if (tagName !== 'A') {
              const childA = nextBtn.locator('a').first();
              if (await childA.count() > 0) {
                clickTarget = childA;
              }
            }

            await clickTarget.evaluate(el => (el as HTMLElement).click());

            try {
              let waitCount = 0;
              let isPageChanged = false;

              while (waitCount < 15) { // Đợi tối đa 3s (15 * 200ms)
                await page.waitForTimeout(200);

                if (page.url() !== currentUrl) {
                  isPageChanged = true;
                  await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => { });
                  break;
                }

                const newCount = await page.locator(productItemSelector).count();
                if (newCount > currentProductCount) {
                  isPageChanged = true;
                  break;
                }
                waitCount++;
              }
            } catch (e) {
              this.logger.warn('Lỗi khi chờ phân trang: ' + e.message);
            }

            const newProductCount = await page.locator(productItemSelector).count();
            if (page.url() === currentUrl && newProductCount <= currentProductCount) {
              this.logger.log('Đã tới trang cuối cùng hoặc không thể sang trang mới.');
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
