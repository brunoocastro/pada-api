import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    {
      ...JwtModule.register({
        privateKey: process.env.JWT_PRIVATE_KEY,
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
        verifyOptions: { ignoreExpiration: true },
      }),
      global: true,
    },
    UsersModule,
    AuthModule,
    MailModule,
    DatabaseModule,
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule {}
