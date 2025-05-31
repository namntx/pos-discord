import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingSpinner({ isOpen, message = 'Đang xử lý đơn hàng...' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
                <p className="text-slate-900 font-medium">{message}</p>
            </div>
        </div>
    );
}

LoadingSpinner.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    message: PropTypes.string
}; 