import { Controller, Get, Post, Body, Query, Res, UseGuards } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import type { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
// Chú ý: Ở endpoint proxy này, ta có thể tạm bỏ JWT Guard nếu Iframe không truyền được Header Authorization,
// Tuy nhiên ở Next.js ta đã truyền Cookie nên vẫn có thể thiết lập bảo mật nếu cần.
// Để đơn giản lúc render iframe trong admin, ta có thể mở route này hoặc truyền cookie.

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) { }

  @Get('proxy')
  async getProxy(
    @Query('url') url: string, 
    @Query('customCookies') customCookies: string,
    @Res() res: Response
  ) {
    try {
      const html = await this.scrapingService.getProxyHtml(url, customCookies);

      // Quan trọng: Trả về với Content-Type là text/html để trình duyệt hiểu đây là một trang web
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  @Post('run-manual')
  async runManualScraping(@Body() body: { competitorId?: string }) {
    try {
      // Để nó chạy ngầm không block request lâu, hoặc có thể await
      // Ở đây ta cứ await luôn để frontend chờ lấy kết quả, nhưng thực tế nên ném qua queue
      const result = await this.scrapingService.runAutoScraping(body.competitorId);
      return { success: true, ...result };
    } catch (error) {
      throw new BadRequestException('Lỗi khi chạy cào thủ công: ' + error.message);
    }
  }

  @Post('ai-selector')
  async generateAiSelector(@Body() body: { htmlSnippet: string; fieldName: string }) {
    if (!body.htmlSnippet || !body.fieldName) {
      throw new BadRequestException('Vui lòng truyền đủ htmlSnippet và fieldName');
    }
    return this.scrapingService.generateAiSelector(body.htmlSnippet, body.fieldName);
  }
}
