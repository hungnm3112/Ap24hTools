import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import type { Response } from 'express';
// Chú ý: Ở endpoint proxy này, ta có thể tạm bỏ JWT Guard nếu Iframe không truyền được Header Authorization,
// Tuy nhiên ở Next.js ta đã truyền Cookie nên vẫn có thể thiết lập bảo mật nếu cần.
// Để đơn giản lúc render iframe trong admin, ta có thể mở route này hoặc truyền cookie.

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('proxy')
  async getProxy(@Query('url') url: string, @Res() res: Response) {
    try {
      const html = await this.scrapingService.getProxyHtml(url);
      
      // Quan trọng: Trả về với Content-Type là text/html để trình duyệt hiểu đây là một trang web
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
