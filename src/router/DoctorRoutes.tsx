import { type RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import DoctorLayout from '@/layouts/DoctorLayout';
import DoctorDashboard from '@/features/doctor/dashboard/pages/DoctorDashboard';
import DoctorPatients from '@/features/doctor/patients/pages/DoctorPatients';
import DoctorProfile from '@/features/doctor/profile/pages/DoctorProfile';

export const doctorRoutes: RouteObject = {
    path: '/doctor',
    element: (
        <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorLayout />
        </ProtectedRoute>
    ),
    children: [
        { index: true, element: <DoctorDashboard /> },
        { path: 'patients', element: <DoctorPatients /> },
        { path: 'profile', element: <DoctorProfile /> },
    ],
};
