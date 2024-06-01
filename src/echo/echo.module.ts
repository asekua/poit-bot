import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { EchoService } from './echo.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [TypeOrmModule.forFeature([Group]), LoggerModule],
    providers: [EchoService],
    exports: [EchoService],
})
export class EchoModule {}
