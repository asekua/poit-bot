import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Environment } from './environment.enum';

config();

const configService = new ConfigService();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    if (configService.get('NODE_ENV') === Environment.PRODUCTION) {
        const bot = app.get(getBotToken());
        app.use(bot.webhookCallback(configService.get<string>('SECRET_PATH')));
    }
    await app.listen(3000);
}

bootstrap();
