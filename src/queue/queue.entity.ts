import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ name: 'last_name' })
    public lastName: string;
}
