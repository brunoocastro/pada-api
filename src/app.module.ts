import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { MailModule } from './app/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    {
      ...JwtModule.register({
        privateKey: process.env.JWT_PRIVATE_KEY,
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '60s' },
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
})
export class AppModule {}
