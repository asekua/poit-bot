import { Action, Ctx, Hears, InjectBot, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { CalendarService } from '../../calendar/calendar.service';
import { TasksService } from '../../tasks/tasks.service';

@Scene('calendarScene')
export class CalendarScene {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly taskService: TasksService,
        private readonly calendarService: CalendarService,
    ) {}

    @SceneEnter()
    public async setCalendar(@Ctx() ctx: Context) {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(today.getMonth() + 6);
        await ctx.reply(
            'Выберите дату',
            this.calendarService.setMinDate(today).setMaxDate(maxDate).getCalendar(),
        );
    }

    @Action(/calendar-telegram-date-[\d-]+/g)
    public async chooseDate(@Ctx() ctx) {
        const date = ctx.match[0].replace('calendar-telegram-date-', '');
        await ctx.answerCbQuery();
        ctx.session.scheduleDialogDate = date;
        await ctx.reply('Введите время в формате HH:MM, например 19:25');
    }

    @Action(/calendar-telegram-prev-[\d-]+/g)
    public async getPreviousMonth(@Ctx() ctx) {
        const dateString: string = ctx.match[0].replace('calendar-telegram-prev-', '');
        const date = new Date(dateString);
        date.setMonth(date.getMonth() - 1);

        const prevText: string = ctx.callbackQuery.message.text;

        const prevEntities = ctx.callbackQuery.message.entities;
        const extras = {
            ...this.calendarService.getCalendar(date),
            entities: prevEntities,
        };

        await ctx.answerCbQuery();
        await ctx.editMessageText(prevText, extras);
    }

    @Action(/calendar-telegram-next-[\d-]+/g)
    public async getNextMonth(@Ctx() ctx) {
        const dateString = ctx.match[0]
            .replace('calendar-telegram-next-', '')
            .replace(/-\d+$/, '-01');

        const date = new Date(dateString);
        date.setMonth(date.getMonth() + 1);

        const prevText = ctx.callbackQuery.message.text;

        const prevEntities = ctx.callbackQuery.message.entities;
        const extras = {
            ...this.calendarService.getCalendar(date),
            entities: prevEntities,
        };

        await ctx.answerCbQuery();
        await ctx.editMessageText(prevText, extras);
    }

    @Action(/calendar-telegram-ignore-[\d\w-]+/g)
    public async ignoreDays(@Ctx() ctx: Context) {
        await ctx.answerCbQuery();
    }

    @Hears(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    public async getTime(@Ctx() ctx) {
        const timeString = ctx.match[0];
        const targetDate = new Date(`${ctx.session.scheduleDialogDate}T${timeString}:00.000+03:00`);
        await this.taskService.addJob(targetDate, ctx.chat.id, ctx.session.scheduleDialogMessageId);

        await ctx.reply('Напоминание создано!');
        await ctx.scene.leave();
    }
}
