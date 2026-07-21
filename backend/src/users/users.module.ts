import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    /*
     * MongooseModule.forFeature(): Đăng ký User schema với module này.
     * Nhờ bước này, ta mới có thể inject Model<User> vào trong UsersService.
     */
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  /* 
   * Export UsersService ra ngoài để các module khác (ví dụ AuthModule sau này)
   * có thể import UsersModule và sử dụng lại các hàm trong UsersService.
   */
  exports: [UsersService]
})
export class UsersModule {}
