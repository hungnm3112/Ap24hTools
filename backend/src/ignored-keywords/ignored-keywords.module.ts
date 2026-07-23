import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IgnoredKeywordsService } from './ignored-keywords.service';
import { IgnoredKeywordsController } from './ignored-keywords.controller';
import { IgnoredKeyword, IgnoredKeywordSchema } from './schemas/ignored-keyword.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: IgnoredKeyword.name, schema: IgnoredKeywordSchema }])
  ],
  controllers: [IgnoredKeywordsController],
  providers: [IgnoredKeywordsService],
  exports: [IgnoredKeywordsService], // Export để các service khác gọi hàm normalize
})
export class IgnoredKeywordsModule {}
