import { Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { TasksService } from '../tasks/tasks.service';

@Update()
export class TasksUpdate {
    ADMIN_ID: number;

    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly configService: ConfigService,
        private readonly tasksService: TasksService,
    ) {
        this.ADMIN_ID = configService.getOrThrow<number>('ADMIN');
    }

    @Hears(/^calendar(?:\s(.+))?$/)
    public async calendarScene(@Ctx() ctx) {
        const message = ctx.match[1];
        let messageId: number = 0;
        if (!message) {
            if (!ctx.update.message.reply_to_message) {
                await ctx.reply('Please specify a message');
            } else {
                messageId = ctx.update.message.reply_to_message.message_id;
            }
        } else {
            messageId = ctx.update.message.message_id;
        }
        ctx.session.scheduleDialogMessageId = messageId;
        await ctx.scene.enter('calendarScene');
    }

    @Cron('0 12 * * *', { timeZone: 'Europe/Minsk' })
    public async sendLogs() {
        const data = await this.tasksService.getLog();
        if (data.length === 0) {
            await this.bot.telegram.sendMessage(this.ADMIN_ID, 'No logs for today');
        } else {
            await this.bot.telegram.sendDocument(this.ADMIN_ID, {
                source: data,
                filename: 'log.log',
            });
        }
    }
}
