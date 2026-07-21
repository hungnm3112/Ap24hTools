import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  /*
   * Dùng @InjectModel(User.name) để NestJS tiêm (inject) class Model của Mongoose vào đây.
   */
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 1. Hàm tạo mới User
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, phone, password } = createUserDto;

    // Kiểm tra xem email hoặc sđt đã tồn tại trong DB chưa
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new BadRequestException('Email hoặc Số điện thoại đã được sử dụng!');
    }

    /*
     * Mã hoá (Hash) mật khẩu bằng bcrypt.
     * Số 10 (salt rounds) là mức độ an toàn phổ biến, băm càng nhiều vòng càng an toàn nhưng tốn CPU.
     */
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Lưu vào DB
    const createdUser = new this.userModel({
      email,
      phone,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  // 2. Hàm tìm User theo email (Sẽ dùng nhiều bên AuthModule)
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  // 3. Hàm tìm User theo ID
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
}
