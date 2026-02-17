import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Settings {
    darkMode: boolean;
}
export type NoteId = bigint;
export type Time = bigint;
export type EventId = bigint;
export interface Event {
    id: EventId;
    startTime: bigint;
    title: string;
    endTime: bigint;
    date: Time;
    description: string;
    location?: string;
}
export interface Note {
    id: NoteId;
    title: string;
    created: Time;
    content: string;
    lastModified?: Time;
    isPrivate: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / EVENTS
     */
    createEvent(title: string, description: string, date: Time, startTime: bigint, endTime: bigint, location: string | null): Promise<Event>;
    /**
     * / NOTES
     */
    createNote(title: string, content: string, isPrivate: boolean): Promise<NoteId>;
    deleteEvent(eventId: EventId): Promise<void>;
    deleteNote(id: NoteId): Promise<void>;
    editNote(id: NoteId, title: string, content: string): Promise<Note>;
    getAllNotes(): Promise<Array<Note>>;
    /**
     * / TYPES
     */
    getCallerUserRole(): Promise<UserRole>;
    getEvent(eventId: EventId): Promise<Event>;
    getEventsForDay(date: Time): Promise<Array<Event>>;
    getNote(noteId: NoteId): Promise<Note>;
    /**
     * / SETTINGS
     */
    getUserSettings(): Promise<Settings>;
    isCallerAdmin(): Promise<boolean>;
    saveUserSettings(settings: Settings): Promise<void>;
}
