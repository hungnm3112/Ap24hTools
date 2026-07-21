import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompetitorsService } from './competitors.service';
import { CompetitorsController } from './competitors.controller';
import { Competitor, CompetitorSchema } from './schemas/competitor.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Competitor.name, schema: CompetitorSchema }])],
  controllers: [CompetitorsController],
  providers: [CompetitorsService],
})
export class CompetitorsModule {}
