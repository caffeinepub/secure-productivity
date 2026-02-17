import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/core/query/queryKeys';
import { SettingsService } from '../services/settingsService';
import type { Settings } from '@/backend';

export function useUserSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Settings>({
    queryKey: queryKeys.settings.user,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const service = new SettingsService(actor);
      return service.getUserSettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error('Actor not available');
      const service = new SettingsService(actor);
      return service.saveUserSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.user });
    },
  });
}
