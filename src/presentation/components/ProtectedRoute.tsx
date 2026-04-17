import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '../../data/api';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = isTokenValid();

    if (!isAuthenticated) {
        // Redirect to signin while saving the current location they were trying to go to
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
