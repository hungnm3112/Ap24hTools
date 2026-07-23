import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  /*
   * LÝ DO (WHY): Sử dụng Dependency Injection (@InjectModel)
   * NestJS quản lý các model qua container. Ta inject model để thao tác trực tiếp với Database.
   */
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  // 1. Tạo mới danh mục
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    try {
      const newCategory = new this.categoryModel(createCategoryDto);
      return await newCategory.save();
    } catch (error) {
      // 11000 là mã lỗi duplicate key của MongoDB (trùng unique field - ở đây là name)
      if (error.code === 11000) {
        throw new BadRequestException('Tên danh mục này đã tồn tại!');
      }
      throw error;
    }
  }

  // 2. Lấy danh sách toàn bộ danh mục (Trả về dạng Cây - Hierarchy cho Antd Table)
  async findAll(): Promise<any[]> {
    // Lấy toàn bộ danh mục dưới dạng plain object (.lean()) để dễ can thiệp thêm thuộc tính
    const categories = await this.categoryModel.find().sort({ createdAt: -1 }).lean().exec();
    
    // Gọi hàm biến đổi danh sách phẳng thành cấu trúc cây
    return this.buildTree(categories);
  }

  /*
   * LÝ DO (WHY): Tại sao lại phải build tree ở Backend thay vì Frontend?
   * - Giúp Frontend (và các nền tảng khác như Mobile) không phải xử lý logic phức tạp lặp lại.
   * - Giảm bớt tải tính toán cho trình duyệt client.
   * Thuật toán: Tạo một map để nhóm các danh mục lại bằng _id. Sau đó lặp qua và đẩy danh mục con
   * vào mảng `children` của danh mục cha.
   */
  private buildTree(items: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // Bước 1: Ánh xạ tất cả items vào Map và khởi tạo mảng children
    for (const item of items) {
      // Ép kiểu _id thành string để so sánh
      map.set(item._id.toString(), { ...item, key: item._id.toString(), children: [] });
    }

    // Bước 2: Ghép con vào cha
    for (const item of items) {
      const node = map.get(item._id.toString());
      if (node.parentId) {
        // Nếu có cha, tìm cha trong map và push vào children của cha
        const parent = map.get(node.parentId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else {
        // Nếu không có cha (parentId = null), nó là phần tử gốc (Root)
        roots.push(node);
      }
    }

    // Xóa các mảng children rỗng để Antd Table không hiển thị nút [+] thừa
    const cleanEmptyChildren = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.children.length === 0) {
          delete node.children;
        } else {
          cleanEmptyChildren(node.children);
        }
      }
    };
    cleanEmptyChildren(roots);

    return roots;
  }

  // 3. Lấy 1 danh mục theo ID
  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }
    return category;
  }

  // 4. Cập nhật danh mục
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    try {
      /*
       * LÝ DO: Dùng findByIdAndUpdate
       * Tham số { returnDocument: 'after' } để Mongoose trả về object SAU KHI update (mặc định trả về object cũ).
       */
      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { returnDocument: 'after' }
      ).exec();

      if (!updatedCategory) {
        throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
      }
      return updatedCategory;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Tên danh mục này đã tồn tại!');
      }
      throw error;
    }
  }

  // 5. Xóa danh mục
  async remove(id: string): Promise<{ message: string }> {
    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deletedCategory) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }
    return { message: 'Đã xóa danh mục thành công' };
  }
}
