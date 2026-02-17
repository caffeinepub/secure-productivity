export const queryKeys = {
  notes: {
    all: ['notes'] as const,
    detail: (id: string) => ['notes', id] as const,
  },
  events: {
    all: ['events'] as const,
    day: (date: string) => ['events', 'day', date] as const,
    detail: (id: bigint) => ['events', id.toString()] as const,
  },
  settings: {
    user: ['settings', 'user'] as const,
  },
} as const;
