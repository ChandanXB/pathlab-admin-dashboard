import { type RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';
import Dashboard from '@/features/admin/dashboard/pages/Dashboard';
import LabTestManager from '@/features/admin/labTests/pages/LabTestManager';
import PatientManager from '@/features/admin/patients/pages/PatientManager';
import LabOrderManager from '@/features/admin/labOrder/pages/LabOrderManager';
import CollectionAgentManager from '@/features/admin/collectionAgent/pages/CollectionAgentManager';
import AgentProfilePage from '@/features/admin/collectionAgent/pages/AgentProfilePage';
import DoctorManager from '@/features/admin/doctors/pages/DoctorManager';
import CityManager from '@/features/admin/locations/pages/CityManager';
import AdminProfile from '@/features/admin/profile/pages/AdminProfile';
import ANCCareManager from '@/features/admin/anc/pages/ANCCareManager';
import PNCManager from '@/features/admin/patients/pages/PNCManager';
import CouponManager from '@/features/admin/coupons/pages/CouponManager';
import ConsultationManager from '@/features/admin/consultations/pages/ConsultationManager';

export const adminRoutes: RouteObject = {
    path: '/',
    element: (
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'ADMIN']}>
            <AdminLayout />
        </ProtectedRoute>
    ),
    children: [
        { index: true, element: <Dashboard /> },
        { path: 'tests-packages', element: <LabTestManager /> },
        { path: 'patients', element: <PatientManager /> },
        { path: 'lab-orders', element: <LabOrderManager /> },
        { path: 'collection-agents', element: <CollectionAgentManager /> },
        { path: 'collection-agents/:id', element: <AgentProfilePage /> },
        { path: 'doctors', element: <DoctorManager /> },
        { path: 'service-cities', element: <CityManager /> },
        { path: 'anc-care', element: <ANCCareManager /> },
        { path: 'pnc-care', element: <PNCManager /> },
        { path: 'profile', element: <AdminProfile /> },
        { path: 'coupons', element: <CouponManager /> },
        { path: 'consultations', element: <ConsultationManager /> },
        { path: '*', element: <Navigate to="/" replace /> },
    ],
};
