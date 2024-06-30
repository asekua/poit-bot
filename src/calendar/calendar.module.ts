import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarHelperService } from './calendar-helper.service';

@Module({
    providers: [CalendarService, CalendarHelperService],
    exports: [CalendarService],
})
export class CalendarModule {}
