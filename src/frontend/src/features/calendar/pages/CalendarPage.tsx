import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import MonthCalendar from '../components/MonthCalendar';
import DailyAgenda from '../components/DailyAgenda';
import EventForm from '../components/EventForm';
import { useEventsForDay, useCreateEvent, useDeleteEvent } from '../hooks/useCalendarQueries';
import { formatError } from '@/core/errors/formatError';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateMidnight = useMemo(() => {
    const date = new Date(selectedDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [selectedDate]);

  const selectedDateTimestamp = BigInt(selectedDateMidnight.getTime() * 1000000);

  const { data: events = [], isLoading } = useEventsForDay(selectedDateTimestamp);
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const daysWithEvents = useMemo(() => {
    const days = new Set<string>();
    events.forEach(event => {
      const date = new Date(Number(event.date) / 1000000);
      days.add(date.toISOString().split('T')[0]);
    });
    return days;
  }, [events]);

  const handleCreateEvent = async (data: {
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
  }) => {
    try {
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);

      const dateObj = new Date(data.date);
      dateObj.setHours(0, 0, 0, 0);

      const startTimeMinutes = startHours * 60 + startMinutes;
      const endTimeMinutes = endHours * 60 + endMinutes;

      await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        date: BigInt(dateObj.getTime() * 1000000),
        startTime: BigInt(startTimeMinutes),
        endTime: BigInt(endTimeMinutes),
        location: data.location || null,
      });

      toast.success('Event created successfully');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const handleDeleteEvent = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent.mutateAsync(id);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">Manage your events and schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MonthCalendar
            currentDate={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={setCurrentMonth}
            daysWithEvents={daysWithEvents}
          />
          <DailyAgenda
            date={selectedDate}
            events={events}
            isLoading={isLoading}
            onDeleteEvent={handleDeleteEvent}
          />
        </div>

        <div>
          <EventForm
            selectedDate={selectedDate}
            onCreateEvent={handleCreateEvent}
            isSaving={createEvent.isPending}
          />
        </div>
      </div>
    </div>
  );
}
