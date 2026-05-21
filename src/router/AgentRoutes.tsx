import { type RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import AgentLayout from '@/layouts/AgentLayout';
import AgentDashboard from '@/features/agent/dashboard/pages/AgentDashboard';
import AgentPickups from '@/features/agent/pickups/pages/AgentPickups';
import AgentProfile from '@/features/agent/profile/pages/AgentProfile';

export const agentRoutes: RouteObject = {
    path: '/agent',
    element: (
        <ProtectedRoute allowedRoles={['COLLECTION_AGENT']}>
            <AgentLayout />
        </ProtectedRoute>
    ),
    children: [
        { index: true, element: <AgentDashboard /> },
        { path: 'pickups', element: <AgentPickups /> },
        { path: 'profile', element: <AgentProfile /> },
    ],
};
