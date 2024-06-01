import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group')
export class Group {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ name: 'chat_id' })
    public chatId: number;

    @Column({ name: 'user_id' })
    public userId: number;

    @Column()
    public username: string;
}
