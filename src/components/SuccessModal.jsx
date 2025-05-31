import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle } from 'lucide-react';

export default function SuccessModal({
    isOpen,
    onClose,
    title = 'Đặt hàng thành công!',
    message = 'Cảm ơn quý khách đã đặt hàng.',
    buttonText = 'Đóng'
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6 text-center">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

SuccessModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    buttonText: PropTypes.string
}; 