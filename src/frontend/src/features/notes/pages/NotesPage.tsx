import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';
import { useNotesList, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useNotesQueries';
import { useCreateEvent } from '@/features/calendar/hooks/useCalendarQueries';
import { formatError } from '@/core/errors/formatError';
import type { NoteId } from '@/backend';

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<NoteId | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: notes = [], isLoading } = useNotesList();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createEvent = useCreateEvent();

  const selectedNote = selectedNoteId ? notes.find(n => n.id.toString() === selectedNoteId.toString()) : null;

  const handleSave = async (data: { id: NoteId | null; title: string; content: string; isPrivate: boolean }) => {
    try {
      if (data.id) {
        await updateNote.mutateAsync({ id: data.id, title: data.title, content: data.content });
        toast.success('Note updated successfully');
      } else {
        const id = await createNote.mutateAsync({
          title: data.title,
          content: data.content,
          isPrivate: data.isPrivate,
        });
        toast.success('Note created successfully');
        setSelectedNoteId(id);
        setIsCreating(false);
      }
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const handleDelete = async (id: NoteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote.mutateAsync(id);
      toast.success('Note deleted successfully');
      if (selectedNoteId?.toString() === id.toString()) {
        setSelectedNoteId(null);
        setIsCreating(false);
      }
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const handleCreateEvent = async (data: { title: string; date: string; time: string }) => {
    try {
      const [hours, minutes] = data.time.split(':').map(Number);
      const dateObj = new Date(data.date);
      dateObj.setHours(hours, minutes, 0, 0);
      
      const startTime = hours * 60 + minutes;
      const endTime = startTime + 60;

      await createEvent.mutateAsync({
        title: data.title,
        description: '',
        date: BigInt(dateObj.getTime() * 1000000),
        startTime: BigInt(startTime),
        endTime: BigInt(endTime),
        location: null,
      });
      
      toast.success('Event created from note');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setIsCreating(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground mt-1">Create and manage your notes with end-to-end encryption</p>
        </div>
        <Button onClick={handleNewNote}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <NotesList
            notes={notes}
            isLoading={isLoading}
            onSelectNote={(id) => {
              setSelectedNoteId(id);
              setIsCreating(false);
            }}
            onDeleteNote={handleDelete}
            selectedNoteId={selectedNoteId}
          />
        </div>

        <div>
          {(selectedNote || isCreating) && (
            <NoteEditor
              note={isCreating ? null : selectedNote || null}
              isLoading={false}
              isSaving={createNote.isPending || updateNote.isPending}
              onSave={handleSave}
              onCreateEvent={handleCreateEvent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
