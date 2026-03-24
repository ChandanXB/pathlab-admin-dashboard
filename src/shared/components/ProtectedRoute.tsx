import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuthStore();

    // Check if user is authenticated
    if (!isAuthenticated) {
        // Redirect to login page, but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has permission
    if (allowedRoles && user && !allowedRoles.includes(user?.role?.name)) {
        // Prevent infinite loops by redirecting to appropriate role-based dashboard
        if (user?.role?.name === 'COLLECTION_AGENT') {
            return <Navigate to="/agent" replace />;
        }
        if (user?.role?.name === 'DOCTOR') {
            return <Navigate to="/doctor" replace />;
        }
        
        // If role doesn't match any known portal, return to login safely
        return <Navigate to="/login" replace />;
    }

    // User is authenticated and authorized
    return <>{children}</>;
};

export default ProtectedRoute;
