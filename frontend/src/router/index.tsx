import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import ActivityPage from '@/pages/ActivityPage';
import LogsPage from '@/pages/LogsPage';
import SettingsPage from '@/pages/SettingsPage';

// Provider pages
import ProvidersListPage from '@/pages/providers/ProvidersListPage';
import CreateProviderPage from '@/pages/providers/CreateProviderPage';
import ProviderReadPage from '@/pages/providers/ProviderReadPage';
import EditProviderPage from '@/pages/providers/EditProviderPage';

// Model pages
import ModelsListPage from '@/pages/models/ModelsListPage';
import CreateModelPage from '@/pages/models/CreateModelPage';
import ModelReadPage from '@/pages/models/ModelReadPage';
import EditModelPage from '@/pages/models/EditModelPage';

// Session pages
import SessionsListPage from '@/pages/sessions/SessionsListPage';
import SessionReadPage from '@/pages/sessions/SessionReadPage';

// Request pages
import RequestsListPage from '@/pages/requests/RequestsListPage';
import RequestReadPage from '@/pages/requests/RequestReadPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout statusMessage="Ready" />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'activity',
        element: <ActivityPage />,
      },
      {
        path: 'logs',
        element: <LogsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      // Provider routes
      {
        path: 'providers',
        element: <ProvidersListPage />,
      },
      {
        path: 'providers/create',
        element: <CreateProviderPage />,
      },
      {
        path: 'providers/:id',
        element: <ProviderReadPage />,
      },
      {
        path: 'providers/:id/edit',
        element: <EditProviderPage />,
      },
      // Model routes
      {
        path: 'models',
        element: <ModelsListPage />,
      },
      {
        path: 'models/create',
        element: <CreateModelPage />,
      },
      {
        path: 'models/:id',
        element: <ModelReadPage />,
      },
      {
        path: 'models/:id/edit',
        element: <EditModelPage />,
      },
      // Session routes
      {
        path: 'sessions',
        element: <SessionsListPage />,
      },
      {
        path: 'sessions/:id',
        element: <SessionReadPage />,
      },
      // Request routes
      {
        path: 'requests',
        element: <RequestsListPage />,
      },
      {
        path: 'requests/:id',
        element: <RequestReadPage />,
      },
      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
