import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { EchoModule } from './echo/echo.module';
import { AppController } from './app.controller';
import { Environment } from './environment.enum';
import { MongooseModule } from '@nestjs/mongoose';
import { session } from 'telegraf';
import { TasksModule } from './tasks/tasks.module';
import { UpdateModule } from './update/update.module';
import { QueueModule } from './queue/queue.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.getOrThrow<string>('MONGO_URI'),
            }),
            inject: [ConfigService],
        }),
        TelegrafModule.forRootAsync({
            imports: [ConfigModule, UpdateModule],
            useFactory: async (configService: ConfigService) => ({
                token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
                middlewares: [session()],
                launchOptions:
                    configService.get<string>('NODE_ENV') === Environment.PRODUCTION
                        ? {
                              webhook: {
                                  domain: configService.getOrThrow<string>('DOMAIN'),
                                  path: configService.getOrThrow<string>('SECRET_PATH'),
                              },
                          }
                        : {},
            }),
            inject: [ConfigService],
        }),
        EchoModule,
        TasksModule,
        UpdateModule,
        QueueModule,
        CalendarModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
