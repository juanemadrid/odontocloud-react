import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PremiumLoading from './PremiumLoading';

const normalizeRole = (role) => (role || "").trim().toLowerCase();

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PremiumLoading />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles?.length) {
        const role = normalizeRole(userProfile?.rol);
        const isAllowed = allowedRoles.some((allowedRole) => role === normalizeRole(allowedRole));

        if (!isAllowed) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
}
