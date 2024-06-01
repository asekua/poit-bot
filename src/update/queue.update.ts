import { Ctx, Hears, InjectBot, Message, Next, On, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { Document } from './interfaces/document.interface';
import { QueueService } from '../queue/queue.service';
import { NextFunction } from 'express';

@Update()
export class QueueUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly queueService: QueueService,
    ) {}

    @Hears(/exam/i)
    public async formQueueList(@Ctx() ctx) {
        const list = await this.queueService.formQueueList(ctx.message.from.id);
        if (!list) {
            await ctx.reply('Доступ запрещён');
        } else {
            const [, examName] = ctx.match.input.split(' ');
            const title = examName ? `<b>-----${examName}-----</b>\n` : '<b>-----EXAM-----</b>\n';
            const result = list.reduce(
                (prev, student, index) => prev + `${student.lastName} - ${index + 1}\n`,
                title,
            );
            await ctx.replyWithHTML(result);
        }
    }

    @On('document')
    public async formQueueExcel(
        @Ctx() ctx: Context,
        @Next() next: NextFunction,
        @Message('document') document: Document,
        @Message('caption') caption: string,
    ) {
        if (!caption) {
            next();
        }
        const [command, name] = caption.split(' ');
        if (command === 'exam') {
            if (
                document.mime_type !==
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ) {
                await ctx.reply('Документ должен быть в формате excel');
            } else {
                const fileLink = await ctx.telegram.getFileLink(document.file_id);
                const filename = name ? name : 'queue';
                const buf = await this.queueService.formQueueExcel(filename, fileLink.toString());
                if (!buf) {
                    await ctx.reply('Произошла ошибка!');
                } else {
                    await ctx.replyWithDocument({
                        source: buf,
                        filename: `${filename}.xlsx`,
                    });
                }
            }
        }
    }
}
