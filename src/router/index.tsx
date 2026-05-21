import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import Login from '@/features/auth/pages/Login';
import { adminRoutes } from './AdminRoutes';
import { agentRoutes } from './AgentRoutes';
import { doctorRoutes } from './DoctorRoutes';

const routes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    adminRoutes,
    agentRoutes,
    doctorRoutes,
];

const router = createBrowserRouter(routes);

export const AppRouter = () => <RouterProvider router={router} />;
