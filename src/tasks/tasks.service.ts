import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pulse } from '@pulsecron/pulse';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
    private pulse: Pulse;
    private connectionString: string;

    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        this.connectionString = this.configService.get<string>('MONGO_PULSE_URI');

        this.pulse = new Pulse({
            db: { address: this.connectionString },
            resumeOnRestart: true,
        });

        await this.pulse.start();
        await this.restartJobs();
    }

    private async restartJobs() {
        const jobs = await this.pulse.jobs();
        jobs.forEach((job) => {
            const name = job.attrs.name;
            this.pulse.define(name, this.jobCallback.bind(this));
        });
    }

    public async addJob(when: Date, chatId: number, messageId: string) {
        const name = `Job-${new Date().toISOString()}`;
        const job = this.pulse.create(name, { chatId, messageId });
        this.pulse.define(name, this.jobCallback.bind(this));
        await job.schedule(when).save();
    }

    private async jobCallback(job: any, done: any): Promise<void> {
        const { chatId, messageId } = job.attrs.data;
        await this.bot.telegram.sendMessage(chatId, 'Напоминание!', {
            reply_parameters: {
                message_id: messageId,
            },
        });
        await job.remove();
        done();
    }

    async onModuleDestroy() {
        await this.pulse.stop();
    }
}
