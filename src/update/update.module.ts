import { Module } from '@nestjs/common';
import { EchoModule } from '../echo/echo.module';
import { TasksModule } from '../tasks/tasks.module';
import { EchoUpdate } from './echo.update';
import { TasksUpdate } from './tasks.update';
import { QueueModule } from '../queue/queue.module';
import { QueueUpdate } from './queue.update';

@Module({
    imports: [EchoModule, TasksModule, QueueModule],
    providers: [TasksUpdate, QueueUpdate, EchoUpdate],
})
export class UpdateModule {}
