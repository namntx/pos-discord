import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            // Chuyển hướng dựa vào role
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
                    <p className="text-slate-600 mt-2">Vui lòng đăng nhập để tiếp tục</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Nhập email"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Nhập mật khẩu"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
} 