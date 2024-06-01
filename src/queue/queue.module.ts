import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './queue.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Student]), HttpModule],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule {}
