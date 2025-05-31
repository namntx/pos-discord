import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Tag, BarChart2 } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const navigation = [
        { name: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard },
        { name: 'Mã giảm giá', href: '/admin/discounts', icon: Tag },
        { name: 'Báo cáo', href: '/admin/reports', icon: BarChart2 },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 border-b">
                        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                                title="Đăng xuất"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                <main className="py-6 px-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

AdminLayout.propTypes = {
    children: PropTypes.node.isRequired
}; 