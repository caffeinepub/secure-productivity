import type { Note as BackendNote, NoteId } from '@/backend';

export interface NoteViewModel extends BackendNote {
  decryptError?: 'MISSING_KEY' | 'DECRYPT_FAILED';
}

export interface CreateNoteInput {
  title: string;
  content: string;
  isPrivate: boolean;
}

export interface UpdateNoteInput {
  id: NoteId;
  title: string;
  content: string;
}
