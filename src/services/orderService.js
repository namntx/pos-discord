import { supabase } from '../config/supabase.js';

export const orderService = {
    // Tạo đơn hàng mới
    async createOrder(orderData) {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Lấy danh sách đơn hàng
    async getOrders(filters = {}) {
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // Áp dụng các bộ lọc
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.startDate && filters.endDate) {
            query = query
                .gte('created_at', filters.startDate)
                .lte('created_at', filters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}; 