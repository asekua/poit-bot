import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    public getHome(): string {
        return 'Hello!';
    }
}
