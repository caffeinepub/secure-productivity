import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useNotesList } from '@/features/notes';
import { useEventsForDay } from '@/features/calendar';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: notes = [], isLoading: notesLoading } = useNotesList();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = BigInt(today.getTime() * 1000000);
  const { data: todayEvents = [], isLoading: eventsLoading } = useEventsForDay(todayTimestamp);

  const recentNotes = notes.slice(0, 3);

  const formatTime = (minutes: bigint) => {
    const mins = Number(minutes);
    const hours = Math.floor(mins / 60);
    const mins_remainder = mins % 60;
    return `${hours.toString().padStart(2, '0')}:${mins_remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your secure productivity workspace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Notes
                </CardTitle>
                <CardDescription>Your latest notes</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/notes' })}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No notes yet</p>
                <Button variant="link" onClick={() => navigate({ to: '/notes' })}>
                  Create your first note
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map(note => (
                  <Card
                    key={note.id.toString()}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate({ to: '/notes' })}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        {note.isPrivate && <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{note.title || 'Untitled Note'}</h4>
                          {!note.decryptError && note.content && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {note.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Agenda
                </CardTitle>
                <CardDescription>
                  {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/calendar' })}>
                View Calendar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No events today</p>
                <Button variant="link" onClick={() => navigate({ to: '/calendar' })}>
                  Schedule an event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map(event => (
                  <Card key={event.id.toString()}>
                    <CardContent className="pt-4">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate({ to: '/notes' })}
          >
            <FileText className="h-8 w-8" />
            <span>Create Note</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate({ to: '/calendar' })}
          >
            <Calendar className="h-8 w-8" />
            <span>Add Event</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate({ to: '/settings' })}
          >
            <Lock className="h-8 w-8" />
            <span>Manage Encryption</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
