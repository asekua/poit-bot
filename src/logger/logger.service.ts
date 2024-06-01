import { Injectable } from '@nestjs/common';
import { appendFile } from 'node:fs/promises';

@Injectable()
export class LoggerService {
    public async log(message: string): Promise<void> {
        try {
            const logPath = './database.log';
            await appendFile(logPath, message + '\n');
        } catch (err) {
            console.error(err);
        }
    }

    mapQueryWithParameters(query, parameters): string {
        let index = 0;
        return query.replace(/\?/g, () => {
            const parameter = parameters[index++];
            if (parameter === undefined) {
                throw new Error('Not enough parameters provided for the query');
            }
            if (typeof parameter === 'string') {
                return `'${parameter}'`;
            } else if (typeof parameter === 'number') {
                return parameter;
            } else if (parameter instanceof Date) {
                return `'${parameter.toISOString()}'`;
            } else {
                return parameter.toString();
            }
        });
    }
}
