import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Discounts() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newDiscount, setNewDiscount] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDiscounts(data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('discounts')
                .insert([newDiscount]);

            if (error) throw error;

            // Reset form
            setNewDiscount({
                code: '',
                discount_type: 'percentage',
                discount_value: '',
                min_order_amount: '',
                max_discount_amount: '',
                start_date: '',
                end_date: '',
                is_active: true
            });

            // Refresh danh sách
            fetchDiscounts();
        } catch (error) {
            console.error('Error creating discount:', error);
        }
    };

    const toggleDiscountStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('discounts')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchDiscounts();
        } catch (error) {
            console.error('Error toggling discount status:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý mã giảm giá</h1>

            {/* Form tạo mã giảm giá mới */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Tạo mã giảm giá mới</h2>
                </div>
                <form onSubmit={handleCreateDiscount} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mã giảm giá</label>
                            <input
                                type="text"
                                value={newDiscount.code}
                                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loại giảm giá</label>
                            <select
                                value={newDiscount.discount_type}
                                onChange={(e) => setNewDiscount({ ...newDiscount, discount_type: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="percentage">Phần trăm</option>
                                <option value="fixed">Số tiền cố định</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Giá trị giảm giá</label>
                            <input
                                type="number"
                                value={newDiscount.discount_value}
                                onChange={(e) => setNewDiscount({ ...newDiscount, discount_value: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Đơn hàng tối thiểu</label>
                            <input
                                type="number"
                                value={newDiscount.min_order_amount}
                                onChange={(e) => setNewDiscount({ ...newDiscount, min_order_amount: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Giảm giá tối đa</label>
                            <input
                                type="number"
                                value={newDiscount.max_discount_amount}
                                onChange={(e) => setNewDiscount({ ...newDiscount, max_discount_amount: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                            <input
                                type="datetime-local"
                                value={newDiscount.start_date}
                                onChange={(e) => setNewDiscount({ ...newDiscount, start_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                            <input
                                type="datetime-local"
                                value={newDiscount.end_date}
                                onChange={(e) => setNewDiscount({ ...newDiscount, end_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Tạo mã giảm giá
                        </button>
                    </div>
                </form>
            </div>

            {/* Danh sách mã giảm giá */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Danh sách mã giảm giá</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn tối thiểu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm tối đa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {discounts.map((discount) => (
                                <tr key={discount.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{discount.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {discount.discount_type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {discount.discount_type === 'percentage'
                                            ? `${discount.discount_value}%`
                                            : `${discount.discount_value.toLocaleString()}đ`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {discount.min_order_amount
                                            ? `${discount.min_order_amount.toLocaleString()}đ`
                                            : 'Không có'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {discount.max_discount_amount
                                            ? `${discount.max_discount_amount.toLocaleString()}đ`
                                            : 'Không có'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(new Date(discount.start_date), 'dd/MM/yyyy', { locale: vi })} -
                                        {format(new Date(discount.end_date), 'dd/MM/yyyy', { locale: vi })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs ${discount.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {discount.is_active ? 'Đang hoạt động' : 'Đã tắt'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleDiscountStatus(discount.id, discount.is_active)}
                                            className={`px-3 py-1 rounded ${discount.is_active
                                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                }`}
                                        >
                                            {discount.is_active ? 'Tắt' : 'Bật'}
                                        </button>
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