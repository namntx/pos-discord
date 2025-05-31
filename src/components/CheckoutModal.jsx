import { useState } from 'react';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutModal({
    isOpen,
    onClose,
    total,
    onPaymentComplete,
    orderType = 'dine-in',
}) {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [selectedOrderType, setSelectedOrderType] = useState(orderType);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
    });
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (selectedOrderType === 'takeaway') {
                if (!customerInfo.name.trim()) {
                    throw new Error('Vui lòng nhập tên khách hàng');
                }
                if (!customerInfo.phone.trim()) {
                    throw new Error('Vui lòng nhập số điện thoại');
                }
                if (!customerInfo.address.trim()) {
                    throw new Error('Vui lòng nhập địa chỉ');
                }
            }

            onPaymentComplete(total, null, {
                paymentMethod,
                orderType: selectedOrderType,
                customerInfo: selectedOrderType === 'takeaway' ? customerInfo : null,
            });
        } catch (error) {
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Thanh toán</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Loại đơn hàng
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedOrderType('dine-in')}
                                className={`p-4 border rounded-lg text-center transition-colors ${selectedOrderType === 'dine-in'
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-medium">Ngồi tại quán</div>
                                <div className="text-sm text-slate-600">Thưởng thức tại chỗ</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedOrderType('takeaway')}
                                className={`p-4 border rounded-lg text-center transition-colors ${selectedOrderType === 'takeaway'
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-medium">Mang về</div>
                                <div className="text-sm text-slate-600">Đóng gói mang đi</div>
                            </button>
                        </div>
                    </div>

                    {selectedOrderType === 'takeaway' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Tên khách hàng
                                </label>
                                <input
                                    type="text"
                                    value={customerInfo.name}
                                    onChange={(e) =>
                                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={customerInfo.phone}
                                    onChange={(e) =>
                                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    value={customerInfo.address}
                                    onChange={(e) =>
                                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phương thức thanh toán
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-4 border rounded-lg text-center transition-colors ${paymentMethod === 'cash'
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-medium">Tiền mặt</div>
                                <div className="text-sm text-slate-600">Thanh toán trực tiếp</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('vietqr')}
                                className={`p-4 border rounded-lg text-center transition-colors ${paymentMethod === 'vietqr'
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-medium">VietQR</div>
                                <div className="text-sm text-slate-600">Chuyển khoản</div>
                            </button>
                        </div>
                    </div>

                    {paymentMethod === 'vietqr' && (
                        <div className="text-center">
                            <QRCodeSVG
                                value={`https://api.vietqr.io/image/VCB-1234567890-${total}`}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                            <p className="mt-2 text-sm text-slate-600">
                                Quét mã QR để thanh toán
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <div className="flex justify-between font-semibold text-slate-900">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Xác nhận
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CheckoutModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
    onPaymentComplete: PropTypes.func.isRequired,
    orderType: PropTypes.oneOf(['dine-in', 'takeaway'])
}; 