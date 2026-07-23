import { PartialType } from '@nestjs/mapped-types';
import { CreateIgnoredKeywordDto } from './create-ignored-keyword.dto';

export class UpdateIgnoredKeywordDto extends PartialType(CreateIgnoredKeywordDto) {}
