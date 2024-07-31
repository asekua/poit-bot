import { Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Update()
export class TasksUpdate {
    ADMIN_ID: number;

    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly configService: ConfigService,
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
}
