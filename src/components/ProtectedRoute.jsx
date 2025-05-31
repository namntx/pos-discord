import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, isAdmin, isStaff, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (!requireAdmin && !isStaff && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requireAdmin: PropTypes.bool
}; 