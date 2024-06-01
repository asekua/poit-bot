import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { Repository } from 'typeorm';
import * as process from 'process';
import { readdir } from 'node:fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class EchoService {
    constructor(
        private readonly loggerService: LoggerService,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
    ) {}

    public async getLegend(): Promise<string> {
        const imagesDir = join(process.cwd(), 'public', 'images');
        const images = await readdir(imagesDir);
        const randomImageIndex = Math.floor(Math.random() * images.length);
        return join(imagesDir, images[randomImageIndex]);
    }

    public async addMember(chatId: number, userId: number, username: string): Promise<void> {
        const member = await this.groupRepository.findOne({
            where: { chatId, userId },
        });
        if (!member) {
            const queryBuilder = this.groupRepository.createQueryBuilder('group');
            const queryWithParams = queryBuilder
                .insert()
                .values([{ chatId, userId, username: username }])
                .getQueryAndParameters();
            const query = this.loggerService.mapQueryWithParameters(
                queryWithParams[0],
                queryWithParams[1],
            );
            await this.loggerService.log(query);
            await this.groupRepository.save({ chatId, userId, username });
        }
    }

    public async getChatMembers(chatId: number): Promise<Group[]> {
        return await this.groupRepository.findBy({ chatId });
    }
}
