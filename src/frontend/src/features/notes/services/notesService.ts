import type { backendInterface, Note, NoteId } from '@/backend';
import { encryptionService } from '@/core/crypto/encryptionService';
import type { CreateNoteInput, UpdateNoteInput, NoteViewModel } from '../types';

export class NotesService {
  constructor(private actor: backendInterface) {}

  async createNote(input: CreateNoteInput): Promise<NoteId> {
    let content = input.content;
    
    if (input.isPrivate) {
      content = await encryptionService.encrypt(input.content);
    }
    
    return this.actor.createNote(input.title, content, input.isPrivate);
  }

  async updateNote(input: UpdateNoteInput): Promise<Note> {
    const existingNote = await this.actor.getNote(input.id);
    let content = input.content;
    
    if (existingNote.isPrivate) {
      content = await encryptionService.encrypt(input.content);
    }
    
    return this.actor.editNote(input.id, input.title, content);
  }

  async deleteNote(id: NoteId): Promise<void> {
    return this.actor.deleteNote(id);
  }

  async getNote(id: NoteId): Promise<NoteViewModel> {
    const note = await this.actor.getNote(id);
    return this.decryptNote(note);
  }

  async getAllNotes(): Promise<NoteViewModel[]> {
    const notes = await this.actor.getAllNotes();
    return Promise.all(notes.map(note => this.decryptNote(note)));
  }

  private async decryptNote(note: Note): Promise<NoteViewModel> {
    if (!note.isPrivate) {
      return note;
    }

    try {
      const decryptedContent = await encryptionService.decrypt(note.content);
      return {
        ...note,
        content: decryptedContent,
      };
    } catch (error: any) {
      if (error.message === 'DECRYPT_KEY_MISSING') {
        return {
          ...note,
          content: '',
          decryptError: 'MISSING_KEY',
        };
      }
      return {
        ...note,
        content: '',
        decryptError: 'DECRYPT_FAILED',
      };
    }
  }
}
