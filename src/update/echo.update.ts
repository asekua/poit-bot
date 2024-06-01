import { Command, Ctx, Hears, InjectBot, Next, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { EchoService } from '../echo/echo.service';

@Update()
export class EchoUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly echoService: EchoService,
    ) {}

    @Start()
    public async onStart(@Ctx() ctx: Context) {
        await ctx.replyWithSticker(
            'CAACAgIAAxkBAAEEudZmHNmrJMD2YJWWn3OVrbvbuGDsEQACRwADVrbpF9PXvhB28WAiNAQ',
        );
    }

    @Command('all')
    public async mentionAll(@Ctx() ctx: Context) {
        const members = await this.echoService.getChatMembers(ctx.chat.id);
        let message = '';
        for (let i = 0; i < members.length; i++) {
            message += `<a href='tg://user?id=${members[i].userId}'>@${members[i].username}</a>`;
        }
        await ctx.reply(message, { parse_mode: 'HTML' });
    }

    @Hears(/легенда/i)
    public async sendLegend(@Ctx() ctx: Context, @Next() next) {
        const source = await this.echoService.getLegend();
        await ctx.replyWithPhoto(
            {
                source: source,
            },
            {
                caption: 'Легенда, спасибо за детство!',
            },
        );
        next();
    }

    @On('message')
    public async formGroup(@Ctx() ctx: Context) {
        const chatId = ctx.chat.id;
        const userId = ctx.message.from.id;
        const username = ctx.message.from.username;
        await this.echoService.addMember(chatId, userId, username);
    }
}
