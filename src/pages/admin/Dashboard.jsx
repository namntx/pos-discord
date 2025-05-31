import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setOrders(data);

            // Tính toán thống kê
            const totalOrders = data.length;
            const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);
            const pendingOrders = data.filter(order => order.status === 'pending').length;

            setStats({
                totalOrders,
                totalRevenue,
                pendingOrders
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Cập nhật lại danh sách đơn hàng
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Bảng điều khiển</h1>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Tổng đơn hàng</h3>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Doanh thu</h3>
                    <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}đ</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500">Đơn hàng đang chờ</h3>
                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Đơn hàng gần đây</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{order.customer_info.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(new Date(order.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{order.total.toLocaleString()}đ</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status === 'pending' ? 'Đang chờ' :
                                                order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="pending">Đang chờ</option>
                                            <option value="completed">Hoàn thành</option>
                                            <option value="cancelled">Đã hủy</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 