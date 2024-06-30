import { Injectable } from '@nestjs/common';
import { CalendarHelperService } from './calendar-helper.service';

@Injectable()
export class CalendarService {
    constructor(private readonly helper: CalendarHelperService) {}
    getCalendar(date: Date = undefined) {
        if (!date) {
            date = new Date();
        }
        return this.helper.getCalendarMarkup(date);
    }

    setMinDate(date: Date) {
        this.helper.setMinDate(new Date(date));
        return this;
    }
    setMaxDate(date: Date) {
        this.helper.setMaxDate(new Date(date));
        return this;
    }

    setWeekDayNames(names: string[]) {
        this.helper.setWeekDayNames(names);
        return this;
    }

    setMonthNames(names: string[]) {
        this.helper.setMonthNames(names);
        return this;
    }

    setStartWeekDay(startDay: number) {
        this.helper.setStartWeekDay(startDay);
        return this;
    }
}
