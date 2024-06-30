import { Module } from '@nestjs/common';
import { EchoModule } from '../echo/echo.module';
import { TasksModule } from '../tasks/tasks.module';
import { EchoUpdate } from './echo.update';
import { TasksUpdate } from './tasks.update';
import { QueueModule } from '../queue/queue.module';
import { QueueUpdate } from './queue.update';
import { CalendarModule } from '../calendar/calendar.module';
import { CalendarScene } from './scenes/calendar.scene';

@Module({
    imports: [EchoModule, TasksModule, QueueModule, CalendarModule],
    providers: [CalendarScene, TasksUpdate, QueueUpdate, EchoUpdate],
})
export class UpdateModule {}
