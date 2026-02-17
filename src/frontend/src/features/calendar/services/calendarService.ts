import type { backendInterface, Event, EventId } from '@/backend';

export interface CreateEventInput {
  title: string;
  description: string;
  date: bigint;
  startTime: bigint;
  endTime: bigint;
  location: string | null;
}

export class CalendarService {
  constructor(private actor: backendInterface) {}

  async createEvent(input: CreateEventInput): Promise<Event> {
    return this.actor.createEvent(
      input.title,
      input.description,
      input.date,
      input.startTime,
      input.endTime,
      input.location
    );
  }

  async deleteEvent(id: EventId): Promise<void> {
    return this.actor.deleteEvent(id);
  }

  async getEventsForDay(date: bigint): Promise<Event[]> {
    return this.actor.getEventsForDay(date);
  }
}
