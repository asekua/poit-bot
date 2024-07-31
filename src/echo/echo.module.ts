import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './group.entity';
import { EchoService } from './echo.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }])],
    providers: [EchoService],
    exports: [EchoService],
})
export class EchoModule {}
