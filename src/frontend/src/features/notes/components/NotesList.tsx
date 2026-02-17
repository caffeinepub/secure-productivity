import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, FileText, Trash2, AlertCircle } from 'lucide-react';
import type { NoteViewModel } from '../types';
import type { NoteId } from '@/backend';

interface NotesListProps {
  notes: NoteViewModel[];
  isLoading: boolean;
  onSelectNote: (id: NoteId) => void;
  onDeleteNote: (id: NoteId) => void;
  selectedNoteId: NoteId | null;
}

export default function NotesList({ notes, isLoading, onSelectNote, onDeleteNote, selectedNoteId }: NotesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notes yet. Create your first note to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {notes.map(note => (
        <Card
          key={note.id.toString()}
          className={`cursor-pointer transition-colors hover:bg-accent/50 ${
            selectedNoteId?.toString() === note.id.toString() ? 'border-primary' : ''
          }`}
          onClick={() => onSelectNote(note.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base flex items-center gap-2">
                  {note.isPrivate && <Lock className="h-4 w-4 text-primary shrink-0" />}
                  <span className="truncate">{note.title || 'Untitled Note'}</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  {formatDate(note.lastModified || note.created)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {note.decryptError && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {note.decryptError === 'MISSING_KEY'
                    ? 'Encryption key missing'
                    : 'Failed to decrypt'}
                </span>
              </div>
            )}
            {!note.decryptError && note.content && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {note.content}
              </p>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
