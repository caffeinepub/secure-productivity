import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MapPin, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import type { Event } from '@/backend';

interface DailyAgendaProps {
  date: Date;
  events: Event[];
  isLoading: boolean;
  onDeleteEvent: (id: bigint) => void;
}

export default function DailyAgenda({ date, events, isLoading, onDeleteEvent }: DailyAgendaProps) {
  const formatTime = (minutes: bigint) => {
    const mins = Number(minutes);
    const hours = Math.floor(mins / 60);
    const mins_remainder = mins % 60;
    return `${hours.toString().padStart(2, '0')}:${mins_remainder.toString().padStart(2, '0')}`;
  };

  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Agenda</CardTitle>
          <CardDescription>{dateStr}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Agenda</CardTitle>
        <CardDescription>{dateStr}</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <Card key={event.id.toString()}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 ml-2"
                      onClick={() => onDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
