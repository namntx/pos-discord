import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { toppings, sugarLevels, iceLevels } from '../data/products';

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  // Hàm reset form về trạng thái ban đầu
  const resetForm = () => {
    setSelectedSize(null);
    setSelectedToppings([]);
    setQuantity(1);
    setNotes('');
    setError(null);
  };

  const handleAddToCart = () => {
    try {
      if (!product) {
        throw new Error('Không tìm thấy thông tin sản phẩm');
      }

      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        throw new Error('Vui lòng chọn size');
      }

      onAddToCart({
        ...product,
        selectedSize,
        selectedToppings,
        quantity,
        notes,
      });
      resetForm(); // Reset form sau khi thêm vào giỏ hàng
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  // Reset form khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, product]);

  const handleToppingToggle = (topping) => {
    setSelectedToppings((prev) => {
      const isSelected = prev.find((t) => t.id === topping.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== topping.id);
      }
      return [...prev, topping];
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

        <p className="text-slate-600 mb-4">{product.description}</p>

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-slate-900 mb-2">Chọn size</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 border rounded-lg text-center ${selectedSize?.name === size.name
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="font-medium">{size.name}</div>
                  <div className="text-sm text-slate-600">
                    {size.price.toLocaleString('vi-VN')}đ
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {product.toppings && product.toppings.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-slate-900 mb-2">Chọn topping</h3>
            <div className="space-y-2">
              {product.toppings.map((topping) => (
                <label
                  key={topping.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedToppings.some((t) => t.id === topping.id)}
                      onChange={() => handleToppingToggle(topping)}
                      className="text-slate-900 focus:ring-slate-500"
                    />
                    <span>{topping.name}</span>
                  </div>
                  <span className="text-slate-600">
                    {topping.price.toLocaleString('vi-VN')}đ
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            >
              +
            </button>
          </div>
          <div className="font-medium text-slate-900">
            {(
              (selectedSize?.price || product.price) +
              selectedToppings.reduce((sum, t) => sum + t.price, 0)
            ).toLocaleString('vi-VN')}
            đ
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-slate-900 mb-2">Ghi chú</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Nhập ghi chú cho món này..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image_url: PropTypes.string,
    sizes: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired
      })
    ),
    toppings: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired
      })
    )
  }),
  onAddToCart: PropTypes.func.isRequired
};