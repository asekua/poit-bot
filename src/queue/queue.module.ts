import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './queue.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
        HttpModule,
    ],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule {}
