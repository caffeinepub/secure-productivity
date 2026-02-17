import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/core/query/queryKeys';
import { NotesService } from '../services/notesService';
import type { CreateNoteInput, UpdateNoteInput, NoteViewModel } from '../types';
import type { NoteId } from '@/backend';

export function useNotesList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<NoteViewModel[]>({
    queryKey: queryKeys.notes.all,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const service = new NotesService(actor);
      return service.getAllNotes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useNote(id: NoteId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<NoteViewModel>({
    queryKey: queryKeys.notes.detail(id!.toString()),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const service = new NotesService(actor);
      return service.getNote(id!);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      if (!actor) throw new Error('Actor not available');
      const service = new NotesService(actor);
      return service.createNote(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      if (!actor) throw new Error('Actor not available');
      const service = new NotesService(actor);
      return service.updateNote(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(variables.id.toString()) });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: NoteId) => {
      if (!actor) throw new Error('Actor not available');
      const service = new NotesService(actor);
      return service.deleteNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}
