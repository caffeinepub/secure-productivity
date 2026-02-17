import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Calendar, Sparkles } from 'lucide-react';
import { useDateTimeSuggestion } from '../hooks/useDateTimeSuggestion';
import type { NoteViewModel } from '../types';
import type { NoteId } from '@/backend';

interface NoteEditorProps {
  note: NoteViewModel | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (data: { id: NoteId | null; title: string; content: string; isPrivate: boolean }) => void;
  onCreateEvent?: (data: { title: string; date: string; time: string }) => void;
}

export default function NoteEditor({ note, isLoading, isSaving, onSave, onCreateEvent }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const suggestion = useDateTimeSuggestion(content);
  const hasSuggestion = suggestion.confidence > 0.6 && (suggestion.date || suggestion.time);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.decryptError ? '' : note.content);
      setIsPrivate(note.isPrivate);
    } else {
      setTitle('');
      setContent('');
      setIsPrivate(false);
    }
  }, [note]);

  const handleSave = () => {
    onSave({
      id: note?.id || null,
      title,
      content,
      isPrivate,
    });
  };

  const handleCreateEvent = () => {
    if (onCreateEvent && suggestion.date) {
      onCreateEvent({
        title: title || 'Event from note',
        date: suggestion.date,
        time: suggestion.time || '09:00',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note ? 'Edit Note' : 'New Note'}</CardTitle>
        <CardDescription>
          {isPrivate
            ? 'This note will be encrypted before saving. Only you can decrypt it.'
            : 'This note will be stored in plaintext.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {note?.decryptError && (
          <Alert variant="destructive">
            <AlertDescription>
              {note.decryptError === 'MISSING_KEY'
                ? 'Cannot decrypt this note. Your encryption key is missing. Go to Settings to manage your encryption key.'
                : 'Failed to decrypt this note. The content may be corrupted or encrypted with a different key.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!!note?.decryptError}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your note here... Try mentioning dates like 'tomorrow at 2pm' or 'Feb 20, 2026 at 14:00'"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            disabled={!!note?.decryptError}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="private"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
            disabled={!!note}
          />
          <Label htmlFor="private" className="cursor-pointer">
            Private note (encrypted)
          </Label>
        </div>

        {hasSuggestion && onCreateEvent && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Event detected:</strong>{' '}
                {suggestion.date && new Date(suggestion.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                {suggestion.time && `at ${suggestion.time}`}
                <span className="text-xs text-muted-foreground ml-2">
                  ({Math.round(suggestion.confidence * 100)}% confidence)
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={handleCreateEvent}>
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !!note?.decryptError}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
