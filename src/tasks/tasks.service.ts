import { Injectable } from '@nestjs/common';
import { readFile, truncate } from 'node:fs/promises';

@Injectable()
export class TasksService {
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
