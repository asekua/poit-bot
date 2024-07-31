import { Group } from './group.entity';
import * as process from 'process';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { readdir } from 'node:fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EchoService {
    constructor(
        @InjectModel(Group.name)
        private readonly groupModel: Model<Group>,
    ) {}

    public async getLegend(): Promise<string> {
        const imagesDir = join(process.cwd(), 'public', 'images');
        const images = await readdir(imagesDir);
        const randomImageIndex = Math.floor(Math.random() * images.length);
        return join(imagesDir, images[randomImageIndex]);
    }

    public async addMember(chatId: number, userId: number, username: string): Promise<void> {
        const member = await this.groupModel.findOne({ chatId, userId });
        if (!member) {
            const newMember = await new this.groupModel({ chatId, userId, username: username });
            await newMember.save();
        }
    }

    public async getChatMembers(chatId: number): Promise<Group[]> {
        return this.groupModel.find({ chatId });
    }
}
