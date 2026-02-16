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
    if (allowedRoles && user && !allowedRoles.includes(user.role.name)) {
        // Redirect to home page if they don't have the right role
        return <Navigate to="/" replace />;
    }

    // User is authenticated and authorized
    return <>{children}</>;
};

export default ProtectedRoute;
