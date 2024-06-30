import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { EchoModule } from './echo/echo.module';
import { AppController } from './app.controller';
import { Environment } from './environment.enum';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Group } from './echo/group.entity';
import { session } from 'telegraf';
import { TasksModule } from './tasks/tasks.module';
import { UpdateModule } from './update/update.module';
import { LoggerModule } from './logger/logger.module';
import { QueueModule } from './queue/queue.module';
import { Student } from './queue/queue.entity';
import { CalendarModule } from './calendar/calendar.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'db/sqlite.db',
            synchronize: true,
            entities: [Group, Student],
        }),
        TelegrafModule.forRootAsync({
            imports: [ConfigModule, UpdateModule],
            useFactory: async (configService: ConfigService) => ({
                token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
                middlewares: [session()],
                launchOptions:
                    configService.get<string>('NODE_ENV') === Environment.PRODUCTION
                        ? {
                              webhook: {
                                  domain: configService.get<string>('DOMAIN'),
                                  path: configService.get<string>('SECRET_PATH'),
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
        LoggerModule,
        CalendarModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
