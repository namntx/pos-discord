import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isStaff, setIsStaff] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkUserRole = async (userId) => {
        try {
            console.log('Bắt đầu kiểm tra role cho user:', userId);

            if (!userId) {
                console.error('Không có userId');
                return 'customer';
            }

            // Thêm timeout cho việc kiểm tra role
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout khi kiểm tra role')), 3000)
            );

            // Kiểm tra profile với timeout
            const profilePromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            const { data: profile, error: profileError } = await Promise.race([
                profilePromise,
                timeoutPromise
            ]);

            console.log('Kết quả kiểm tra profile:', { profile, error: profileError });

            // Nếu có lỗi hoặc không tìm thấy profile, tạo mới
            if (profileError || !profile) {
                console.log('Tạo profile mới cho user');
                try {
                    const { data: newProfile, error: insertError } = await supabase
                        .from('profiles')
                        .insert([{ id: userId, role: 'customer' }])
                        .select('role')
                        .single();

                    if (insertError) {
                        console.error('Lỗi khi tạo profile:', insertError);
                        return 'customer';
                    }

                    setIsStaff(false);
                    setIsAdmin(false);
                    return 'customer';
                } catch (insertError) {
                    console.error('Lỗi khi tạo profile:', insertError);
                    return 'customer';
                }
            }

            // Cập nhật role
            console.log('Role hiện tại:', profile.role);
            const isAdminRole = profile.role === 'admin';
            const isStaffRole = profile.role === 'staff' || isAdminRole;

            setIsStaff(isStaffRole);
            setIsAdmin(isAdminRole);

            return profile.role;
        } catch (error) {
            console.error('Lỗi trong checkUserRole:', error);
            // Mặc định là customer nếu có lỗi
            setIsStaff(false);
            setIsAdmin(false);
            return 'customer';
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Bắt đầu đăng nhập');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            console.log('Đăng nhập thành công, kiểm tra role');
            setUser(data.user);
            const role = await checkUserRole(data.user.id);
            console.log('Role sau khi đăng nhập:', role);
            return data;
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setIsStaff(false);
            setIsAdmin(false);
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            throw error;
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                console.log('Khởi tạo auth...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Lỗi khi lấy session:', error);
                    if (mounted) setLoading(false);
                    return;
                }

                if (session?.user && mounted) {
                    console.log('Đã tìm thấy session, kiểm tra role');
                    setUser(session.user);

                    // Thêm timeout cho toàn bộ quá trình khởi tạo
                    const timeoutId = setTimeout(() => {
                        if (mounted) {
                            console.log('Timeout khi khởi tạo, mặc định là customer');
                            setIsStaff(false);
                            setIsAdmin(false);
                            setLoading(false);
                        }
                    }, 5000);

                    const role = await checkUserRole(session.user.id);
                    clearTimeout(timeoutId);

                    console.log('Role sau khi khởi tạo:', role);
                    if (mounted) setLoading(false);
                } else {
                    console.log('Không tìm thấy session');
                    if (mounted) setLoading(false);
                }
            } catch (error) {
                console.error('Lỗi trong initializeAuth:', error);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Trạng thái auth thay đổi:', event, session);

            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                const role = await checkUserRole(session.user.id);
                console.log('Role sau khi đăng nhập:', role);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsStaff(false);
                setIsAdmin(false);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        user,
        isStaff,
        isAdmin,
        loading,
        login,
        signOut
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 