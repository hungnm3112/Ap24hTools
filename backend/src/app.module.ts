import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    /* 
     * 1. Cấu hình ConfigModule
     * Mục đích: Load các biến môi trường từ file .env vào process.env và cung cấp ConfigService
     * isGlobal: true -> Giúp ConfigModule trở thành global module. 
     *                   Bạn có thể dùng ConfigService ở bất kỳ module nào khác mà không cần phải import lại ConfigModule.
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /*
     * 2. Cấu hình MongooseModule kết nối Database
     * Kiến trúc: Dependency Injection (DI) trong NestJS
     * Thay vì hard-code chuỗi kết nối (MongooseModule.forRoot('mongodb://...')),
     * chúng ta dùng MongooseModule.forRootAsync() kết hợp với ConfigService.
     * 
     * Luồng hoạt động:
     * - 'imports': Inject ConfigModule vào đây để lấy ra ConfigService.
     * - 'inject': Khai báo ConfigService là dependency cần được tiêm vào useFactory.
     * - 'useFactory': Hàm này sẽ chạy khi module khởi tạo. Nó nhận ConfigService làm tham số,
     *                 đọc biến MONGODB_URI từ file .env một cách an toàn và trả về object cấu hình cho Mongoose.
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    UsersModule,

    AuthModule,

    MailModule,

    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
