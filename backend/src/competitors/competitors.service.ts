import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competitor, CompetitorDocument } from './schemas/competitor.schema';
import { CreateCompetitorDto } from './dto/create-competitor.dto';
import { UpdateCompetitorDto } from './dto/update-competitor.dto';

@Injectable()
export class CompetitorsService {
  constructor(
    @InjectModel(Competitor.name) private competitorModel: Model<CompetitorDocument>,
  ) {}

  async create(createCompetitorDto: CreateCompetitorDto): Promise<CompetitorDocument> {
    try {
      const newCompetitor = new this.competitorModel(createCompetitorDto);
      return await newCompetitor.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Tên đối thủ này đã tồn tại!');
      }
      throw error;
    }
  }

  // LÝ DO: Khi populate('scrapingUrls.categoryId', 'name'), ta sẽ kéo tên danh mục (name) 
  // từ collection Categories sang bảng Đối thủ để Frontend dễ hiển thị.
  async findAll(): Promise<CompetitorDocument[]> {
    return this.competitorModel
      .find()
      .populate('scrapingUrls.categoryId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<CompetitorDocument> {
    const competitor = await this.competitorModel
      .findById(id)
      .populate('scrapingUrls.categoryId', 'name')
      .exec();
    
    if (!competitor) {
      throw new NotFoundException(`Không tìm thấy đối thủ với ID: ${id}`);
    }
    return competitor;
  }

  async update(id: string, updateCompetitorDto: UpdateCompetitorDto): Promise<CompetitorDocument> {
    try {
      const updatedCompetitor = await this.competitorModel.findByIdAndUpdate(
        id,
        updateCompetitorDto,
        { new: true }
      ).exec();

      if (!updatedCompetitor) {
        throw new NotFoundException(`Không tìm thấy đối thủ với ID: ${id}`);
      }
      return updatedCompetitor;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Tên đối thủ này đã tồn tại!');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedCompetitor = await this.competitorModel.findByIdAndDelete(id).exec();
    if (!deletedCompetitor) {
      throw new NotFoundException(`Không tìm thấy đối thủ với ID: ${id}`);
    }
    return { message: 'Đã xóa đối thủ thành công' };
  }
}
