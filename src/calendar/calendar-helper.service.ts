import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
export class CalendarHelperService {
    private startWeekDay: number = 1;
    private weekDayNames: string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    private monthNames: string[] = [
        'Янв',
        'Фев',
        'Март',
        'Апр',
        'Май',
        'Июнь',
        'Июль',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек',
    ];
    private minDate = null;
    private maxDate = null;
    private ignoreWeekDays = [];
    private shortcutButtons = [];
    private hideIgnoredWeeks = false;

    constructor() {}

    getCalendarMarkup(date: Date) {
        return Markup.inlineKeyboard(this.getPage(date));
    }

    setMinDate(date: Date) {
        if (this.maxDate && date > this.maxDate) {
            throw "Min date can't be greater than max date";
        }
        this.minDate = date;
    }

    setMaxDate(date) {
        if (this.minDate && date < this.minDate) {
            throw "Max date can't be lower than min date";
        }
        this.maxDate = date;
    }

    setWeekDayNames(names) {
        this.weekDayNames = names;
    }

    setMonthNames(names) {
        this.monthNames = names;
    }

    setStartWeekDay(startDay) {
        this.startWeekDay = startDay;
    }

    setIgnoreWeekDays(ignoreWeekDays) {
        this.ignoreWeekDays = ignoreWeekDays;
    }

    setShortcutButtons(shortcutButtons) {
        this.shortcutButtons = shortcutButtons;
    }

    setHideIgnoredWeeks(hideIgnoredWeeks) {
        this.hideIgnoredWeeks = hideIgnoredWeeks;
    }

    addShortcutButtons(page) {
        const menuShortcutButtons = [];

        for (const shortcutButton of this.shortcutButtons) {
            const buttonLabel = shortcutButton.label;
            const buttonAction = shortcutButton.action;

            menuShortcutButtons.push(Markup.button.callback(buttonLabel, buttonAction));
        }

        page.push(menuShortcutButtons);
    }

    addHeader(page, date) {
        const monthName = this.monthNames[date.getMonth()];
        const year = date.getFullYear();

        const header = [];

        if (this.isInMinMonth(date)) {
            header.push(Markup.button.callback(' ', 'calendar-telegram-ignore-minmonth'));
        } else {
            header.push(
                Markup.button.callback(
                    '<',
                    'calendar-telegram-prev-' + CalendarHelperService.toYyyymmdd(date),
                ),
            );
        }

        header.push(
            Markup.button.callback(monthName + ' ' + year, 'calendar-telegram-ignore-monthname'),
        );

        if (this.isInMaxMonth(date)) {
            header.push(Markup.button.callback(' ', 'calendar-telegram-ignore-maxmonth'));
        } else {
            header.push(
                Markup.button.callback(
                    '>',
                    'calendar-telegram-next-' + CalendarHelperService.toYyyymmdd(date),
                ),
            );
        }

        page.push(header);

        page.push(
            this.weekDayNames.map((e, i) =>
                Markup.button.callback(e, 'calendar-telegram-ignore-weekday' + i),
            ),
        );
    }

    addDays(page, date) {
        const maxMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const maxDay = this.getMaxDay(date);
        const minDay = this.getMinDay(date);

        let daysOfWeekProcessed = 0,
            daysOfWeekIgnored = 0;

        let currentRow = CalendarHelperService.buildFillerRow('firstRow-');
        for (let d = 1; d <= maxMonthDay; d++) {
            date.setDate(d);

            const weekDay = this.normalizeWeekDay(date.getDay());
            if (d < minDay || d > maxDay) {
                if (!this.hideIgnoredWeeks) {
                    currentRow[weekDay] = Markup.button.callback(
                        CalendarHelperService.strikethroughText(d.toString()),
                        'calendar-telegram-ignore-' + CalendarHelperService.toYyyymmdd(date),
                    );
                }

                daysOfWeekIgnored++;
            } else if (this.ignoreWeekDays.includes(weekDay)) {
                currentRow[weekDay] = Markup.button.callback(
                    CalendarHelperService.strikethroughText(d.toString()),
                    'calendar-telegram-ignore-' + CalendarHelperService.toYyyymmdd(date),
                );

                daysOfWeekIgnored++;
            } else {
                currentRow[weekDay] = Markup.button.callback(
                    d.toString(),
                    'calendar-telegram-date-' + CalendarHelperService.toYyyymmdd(date),
                );
            }

            daysOfWeekProcessed++;

            if (weekDay == 6 || d == maxMonthDay) {
                if (!this.hideIgnoredWeeks || daysOfWeekProcessed !== daysOfWeekIgnored) {
                    page.push(currentRow);
                }
                currentRow = CalendarHelperService.buildFillerRow('lastRow-');

                daysOfWeekProcessed = 0;
                daysOfWeekIgnored = 0;
            }
        }
    }

    getPage(inputDate) {
        const dateNumber =
            this.minDate || this.maxDate
                ? Math.min(Math.max(inputDate, this.minDate), this.maxDate)
                : null;
        const date = dateNumber ? new Date(dateNumber) : inputDate;

        const page = [];

        const shortcutButtons = this.shortcutButtons;
        if (shortcutButtons && shortcutButtons.length > 0) {
            this.addShortcutButtons(page);
        }
        this.addHeader(page, date);
        this.addDays(page, date);

        return page;
    }

    normalizeWeekDay(weekDay) {
        let result = weekDay - this.startWeekDay;
        if (result < 0) result += 7;
        return result;
    }
    getMinDay(date) {
        let minDay;
        if (this.isInMinMonth(date)) {
            minDay = this.minDate.getDate();
        } else {
            minDay = 1;
        }

        return minDay;
    }

    getMaxDay(date) {
        let maxDay;
        if (this.isInMaxMonth(date)) {
            maxDay = this.maxDate.getDate();
        } else {
            maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        }

        return maxDay;
    }

    static toYyyymmdd(date) {
        const mm = date.getMonth() + 1;
        const dd = date.getDate();

        return [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
    }

    isInMinMonth(date) {
        return CalendarHelperService.isSameMonth(this.minDate, date);
    }

    isInMaxMonth(date) {
        return CalendarHelperService.isSameMonth(this.maxDate, date);
    }

    static isSameMonth(myDate, testDate) {
        if (!myDate) return false;

        testDate = testDate || new Date();

        return (
            myDate.getFullYear() === testDate.getFullYear() &&
            myDate.getMonth() === testDate.getMonth()
        );
    }

    static strikethroughText(text) {
        return text.split('').reduce(function (acc, char) {
            return acc + char + '\u0336';
        }, '');
    }

    static buildFillerRow(prefix) {
        const buttonKey = 'calendar-telegram-ignore-filler-' + prefix;
        return Array.from({ length: 7 }, (v, k) => Markup.button.callback(' ', buttonKey + k));
    }
}
