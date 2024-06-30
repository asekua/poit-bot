import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { readFile, truncate } from 'node:fs/promises';
import { CronJob } from 'cron';

@Injectable()
export class TasksService {
    constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

    public addCronJob(name: string, onTick, expression: string) {
        const job = new CronJob(expression, onTick, null, false, 'Europe/Minsk');
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
    }

    public dateToCron(date: Date): string {
        const minutes = date.getMinutes();
        const hours = date.getHours();
        const days = date.getDate();
        const months = date.getMonth() + 1;
        const dayOfWeek = date.getDay();

        return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
    }

    public async getLog(): Promise<Buffer> {
        try {
            const logPath = './database.txt';
            const data = await readFile(logPath);
            await truncate(logPath, 0);
            return data;
        } catch (err) {
            console.error(err);
        }
    }
}
