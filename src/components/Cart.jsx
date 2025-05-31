import { useState } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../config/supabase';

export default function Cart({ cart, onUpdateCart, onRemoveFromCart, onCheckout }) {
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            // Tính giá của size được chọn
            const sizePrice = item.selectedSize?.price || 0;

            // Tính tổng giá của các topping được chọn
            const toppingsPrice = item.selectedToppings?.reduce(
                (sum, topping) => sum + topping.price,
                0
            ) || 0;

            // Tính tổng giá của một item (bao gồm size và topping) nhân với số lượng
            const itemTotal = (sizePrice + toppingsPrice) * item.quantity;

            return total + itemTotal;
        }, 0);
    };

    const calculateDiscount = () => {
        if (!appliedDiscount) return 0;
        const subtotal = calculateSubtotal();
        let discountAmount = 0;

        if (appliedDiscount.discount_type === 'percentage') {
            discountAmount = (subtotal * appliedDiscount.discount_value) / 100;
        } else {
            discountAmount = appliedDiscount.discount_value;
        }

        if (appliedDiscount.max_discount_amount) {
            discountAmount = Math.min(discountAmount, appliedDiscount.max_discount_amount);
        }

        return discountAmount;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        return subtotal - discount;
    };

    const handleApplyDiscount = async () => {
        try {
            setDiscountError('');
            const { data, error } = await supabase
                .from('discounts')
                .select('*')
                .eq('code', discountCode)
                .single();

            if (error) throw error;

            if (!data) {
                setDiscountError('Mã giảm giá không tồn tại');
                return;
            }

            if (!data.is_active) {
                setDiscountError('Mã giảm giá đã hết hạn');
                return;
            }

            const now = new Date();
            if (data.start_date && new Date(data.start_date) > now) {
                setDiscountError('Mã giảm giá chưa có hiệu lực');
                return;
            }

            if (data.end_date && new Date(data.end_date) < now) {
                setDiscountError('Mã giảm giá đã hết hạn');
                return;
            }

            const subtotal = calculateSubtotal();
            if (data.min_order_amount && subtotal < data.min_order_amount) {
                setDiscountError(`Đơn hàng tối thiểu ${data.min_order_amount.toLocaleString('vi-VN')}đ`);
                return;
            }

            setAppliedDiscount(data);
        } catch (error) {
            setDiscountError(error.message);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Giỏ hàng</h2>

            {cart.length === 0 ? (
                <p className="text-slate-600 text-center py-4">Giỏ hàng trống</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {cart.map((item) => {
                            // Tính giá của một item
                            const sizePrice = item.selectedSize?.price || 0;
                            const toppingsPrice = item.selectedToppings?.reduce(
                                (sum, topping) => sum + topping.price,
                                0
                            ) || 0;
                            const itemTotal = (sizePrice + toppingsPrice) * item.quantity;

                            return (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                                        {item.selectedSize && (
                                            <p className="text-sm text-slate-600">Size: {item.selectedSize.name}</p>
                                        )}
                                        {item.selectedToppings?.length > 0 && (
                                            <p className="text-sm text-slate-600">
                                                Topping: {item.selectedToppings.map(t => t.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onUpdateCart(item.id, item.quantity - 1)}
                                                className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateCart(item.id, item.quantity + 1)}
                                                className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-medium">
                                            {itemTotal.toLocaleString('vi-VN')}đ
                                        </span>
                                        <button
                                            onClick={() => onRemoveFromCart(item.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                placeholder="Nhập mã giảm giá"
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                            <button
                                onClick={handleApplyDiscount}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Áp dụng
                            </button>
                        </div>
                        {discountError && (
                            <p className="text-red-600 text-sm">{discountError}</p>
                        )}
                        {appliedDiscount && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg">
                                <p className="font-medium">Mã giảm giá đã được áp dụng</p>
                                <p className="text-sm">
                                    {appliedDiscount.discount_type === 'percentage'
                                        ? `Giảm ${appliedDiscount.discount_value}%`
                                        : `Giảm ${appliedDiscount.discount_value.toLocaleString('vi-VN')}đ`}
                                </p>
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Tạm tính:</span>
                                <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{calculateDiscount().toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-slate-900">
                                <span>Tổng cộng:</span>
                                <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={() => onCheckout(calculateTotal(), appliedDiscount)}
                            className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Thanh toán
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

Cart.propTypes = {
    cart: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            quantity: PropTypes.number.isRequired,
            selectedSize: PropTypes.shape({
                name: PropTypes.string.isRequired,
                price: PropTypes.number.isRequired
            }),
            selectedToppings: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string.isRequired,
                    price: PropTypes.number.isRequired
                })
            )
        })
    ).isRequired,
    onUpdateCart: PropTypes.func.isRequired,
    onRemoveFromCart: PropTypes.func.isRequired,
    onCheckout: PropTypes.func.isRequired
}; 