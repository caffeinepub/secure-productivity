import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import AuthGate from './features/auth/components/AuthGate';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import NotesPage from './features/notes/pages/NotesPage';
import CalendarPage from './features/calendar/pages/CalendarPage';
import SettingsPage from './features/settings/pages/SettingsPage';

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster />
    </ThemeProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  ),
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: () => (
    <AuthGate>
      <NotesPage />
    </AuthGate>
  ),
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: () => (
    <AuthGate>
      <CalendarPage />
    </AuthGate>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, notesRoute, calendarRoute, settingsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
