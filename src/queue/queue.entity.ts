import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Student {
    @Prop()
    public lastName: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
