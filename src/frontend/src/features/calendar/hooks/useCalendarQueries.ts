import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/core/query/queryKeys';
import { CalendarService, type CreateEventInput } from '../services/calendarService';
import type { Event, EventId } from '@/backend';

export function useEventsForDay(date: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: queryKeys.events.day(date.toString()),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const service = new CalendarService(actor);
      return service.getEventsForDay(date);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!actor) throw new Error('Actor not available');
      const service = new CalendarService(actor);
      return service.createEvent(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: EventId) => {
      if (!actor) throw new Error('Actor not available');
      const service = new CalendarService(actor);
      return service.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}
