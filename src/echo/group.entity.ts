import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Group {
    @Prop()
    public chatId: number;

    @Prop()
    public userId: number;

    @Prop()
    public username: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
