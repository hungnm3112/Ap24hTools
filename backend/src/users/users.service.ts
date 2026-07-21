import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
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

  // 2b. Hàm tìm User theo số điện thoại (Sử dụng để đăng nhập)
  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone });
  }

  // 3. Hàm tìm User theo ID
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  // 4. Cập nhật mã OTP và thời gian hết hạn
  async updateCodeId(email: string, codeId: string, codeExpired: Date) {
    return this.userModel.updateOne({ email }, { codeId, codeExpired });
  }

  // 5. Kích hoạt user và xóa OTP
  async activateUser(email: string) {
    return this.userModel.updateOne({ email }, { isActive: true, codeId: null, codeExpired: null });
  }

  // 6. Đổi mật khẩu mới và xóa OTP
  async updatePassword(email: string, newPasswordHash: string) {
    return this.userModel.updateOne({ email }, { password: newPasswordHash, codeId: null, codeExpired: null });
  }
}
