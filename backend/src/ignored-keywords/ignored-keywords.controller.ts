import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IgnoredKeywordsService } from './ignored-keywords.service';
import { CreateIgnoredKeywordDto } from './dto/create-ignored-keyword.dto';
import { UpdateIgnoredKeywordDto } from './dto/update-ignored-keyword.dto';

@Controller('ignored-keywords')
export class IgnoredKeywordsController {
  constructor(private readonly ignoredKeywordsService: IgnoredKeywordsService) {}

  @Post()
  create(@Body() createIgnoredKeywordDto: CreateIgnoredKeywordDto) {
    return this.ignoredKeywordsService.create(createIgnoredKeywordDto);
  }

  @Get()
  findAll() {
    return this.ignoredKeywordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ignoredKeywordsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIgnoredKeywordDto: UpdateIgnoredKeywordDto) {
    return this.ignoredKeywordsService.update(id, updateIgnoredKeywordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ignoredKeywordsService.remove(id);
  }
}
