import { supabase } from '../config/supabase.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const orderService = {
    // Lấy báo cáo doanh thu
    async getRevenueReport(period) {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'day':
                startDate = startOfDay(now);
                endDate = endOfDay(now);
                break;
            case 'week':
                startDate = startOfWeek(now);
                endDate = endOfWeek(now);
                break;
            case 'month':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            default:
                startDate = startOfDay(now);
                endDate = endOfDay(now);
        }

        // Lấy tổng doanh thu và số đơn hàng
        const { data: revenueData, error: revenueError } = await supabase
            .from('orders')
            .select('total')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (revenueError) throw revenueError;

        const total_revenue = revenueData.reduce((sum, order) => sum + order.total, 0);
        const total_orders = revenueData.length;
        const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

        // Lấy top sản phẩm bán chạy
        const { data: topProducts, error: topProductsError } = await supabase
            .from('orders')
            .select('items')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (topProductsError) throw topProductsError;

        // Tính toán số lượng và doanh thu cho từng sản phẩm
        const productStats = {};
        topProducts.forEach(order => {
            order.items.forEach(item => {
                if (!productStats[item.name]) {
                    productStats[item.name] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productStats[item.name].quantity += item.quantity || 1;
                productStats[item.name].revenue += (item.price || 0) * (item.quantity || 1);
            });
        });

        // Chuyển đổi thành mảng và sắp xếp theo doanh thu
        const top_products = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            total_revenue,
            total_orders,
            average_order_value,
            top_products
        };
    }
}; 