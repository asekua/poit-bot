import { Context } from 'telegraf';

interface SessionData {
    scheduleDialogMessageId?: number;
    scheduleDialogDate?: string;
}

export interface ScheduleDialogContext extends Context {
    session?: SessionData;
}
