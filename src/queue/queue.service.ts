import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {HttpService} from '@nestjs/axios';
import {firstValueFrom} from 'rxjs';
import {unlink, writeFile} from 'node:fs/promises';
import {join} from 'path';
import {getRandomValues} from 'crypto';
import {cwd} from 'process';
import {Workbook} from 'exceljs';
import {InjectRepository} from '@nestjs/typeorm';
import {Student} from './queue.entity';
import {Repository} from 'typeorm';

@Injectable()
export class QueueService {
    private readonly BOT_TOKEN: string;
    private readonly QUEUE_ADMINS: string[];

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) {
        this.BOT_TOKEN = configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
        this.QUEUE_ADMINS = configService.getOrThrow<string>('QUEUE_ADMINS').split(',');
    }

    public async formQueueList(userId: number): Promise<Student[] | null> {
        if (!this.QUEUE_ADMINS.includes(userId.toString())) {
            return null;
        }
        const students = await this.studentRepository.find({
            select: {
                lastName: true,
            },
        });
        const randomIndexes = this.randomIndexes(students.length);
        return randomIndexes.map((index) => students[index]);
    }

    public async formQueueExcel(fileName: string, fileUrl: string): Promise<Buffer | null> {
        const excelName = join(cwd(), 'public', 'excel', `excel${Date.now()}.xlsx`);
        try {
            const response = await firstValueFrom(
                this.httpService.get(fileUrl, {responseType: 'stream'}),
            );
            await writeFile(excelName, response.data);
            const workbook = new Workbook();

            await workbook.xlsx.readFile(excelName);
            const worksheet = workbook.getWorksheet(1);
            const rows = [];
            worksheet.eachRow({includeEmpty: false}, (row) => {
                rows.push(row.getCell(1).value);
            });

            const randomIndexes = this.randomIndexes(rows.length);
            const sortedRows = randomIndexes.map((index) => rows[index]);

            const newWorkbook = new Workbook();
            const newWorksheet = newWorkbook.addWorksheet(fileName);
            const font = {
                name: 'Times New Roman',
                size: 14,
            };

            for (let i = 1; i <= 2; i++) {
                newWorksheet.getColumn(i).style.font = font;
                newWorksheet.getColumn(i).width = 17;
            }

            sortedRows.forEach((value, index) => {
                newWorksheet.addRow([value, index + 1]);
            });
            await unlink(excelName);
            return (await newWorkbook.xlsx.writeBuffer()) as Buffer;
        } catch (err) {
            await unlink(excelName);
            return null;
        }
    }

    private randomIndexes(max): number[] {
        const set = new Set<number>();
        while (set.size < max) {
            set.add(this.getRandomIntInclusive(0, max - 1));
        }
        return Array.from(set);
    }

    public getRandomIntInclusive(min, max) {
        const randomBuffer = new Uint32Array(1);
        getRandomValues(randomBuffer);
        const randomNumber = randomBuffer[0] / (0xffffffff + 1);
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(randomNumber * (max - min + 1)) + min;
    }
}
