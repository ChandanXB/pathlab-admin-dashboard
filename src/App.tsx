import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import muiTheme from '@/styles/muiTheme';
import antdTheme from '@/config/antdConfig';
import Dashboard from '@/features/admin/dashboard/pages/Dashboard';
import Login from '@/features/auth/pages/Login';
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
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';
import AgentLayout from '@/layouts/AgentLayout';
import DoctorLayout from '@/layouts/DoctorLayout';
import AgentDashboard from '@/features/agent/dashboard/pages/AgentDashboard';
import AgentPickups from '@/features/agent/pickups/pages/AgentPickups';
import AgentProfile from '@/features/agent/profile/pages/AgentProfile';
import DoctorDashboard from '@/features/doctor/dashboard/pages/DoctorDashboard';
import DoctorPatients from '@/features/doctor/patients/pages/DoctorPatients';
import DoctorProfile from '@/features/doctor/profile/pages/DoctorProfile';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <AntdConfigProvider theme={antdTheme}>
        <NotificationProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin', 'ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tests-packages" element={<LabTestManager />} />
              <Route path="patients" element={<PatientManager />} />
              <Route path="lab-orders" element={<LabOrderManager />} />
              <Route path="collection-agents" element={<CollectionAgentManager />} />
              <Route path="collection-agents/:id" element={<AgentProfilePage />} />
              <Route path="doctors" element={<DoctorManager />} />
              <Route path="service-cities" element={<CityManager />} />
              <Route path="anc-care" element={<ANCCareManager />} />
              <Route path="pnc-care" element={<PNCManager />} />
              <Route path="profile" element={<AdminProfile />} />
              {/* Fallback for development/typos */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* Collection Agent Portal */}
            <Route
              path="/agent"
              element={
                <ProtectedRoute allowedRoles={['COLLECTION_AGENT']}>
                  <AgentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AgentDashboard />} />
              <Route path="pickups" element={<AgentPickups />} />
              <Route path="profile" element={<AgentProfile />} />
            </Route>

            {/* Doctor Portal */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AntdConfigProvider>
    </MuiThemeProvider>
  );
}

export default App;
