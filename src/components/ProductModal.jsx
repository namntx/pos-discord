import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toppings, sugarLevels, iceLevels } from '../data/products';

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [orderForm, setOrderForm] = useState({
    toppings: [],
    sugar: '100%',
    ice: '100%',
    note: ''
  });

  const handleToppingChange = (toppingId) => {
    setOrderForm(prev => ({
      ...prev,
      toppings: prev.toppings.includes(toppingId)
        ? prev.toppings.filter(t => t !== toppingId)
        : [...prev.toppings, toppingId]
    }));
  };

  const calculateTotal = () => {
    const toppingsPrice = orderForm.toppings.reduce((sum, toppingId) => {
      const topping = toppings.find(t => t.id === toppingId);
      return sum + (topping ? topping.price : 0);
    }, 0);
    return product.price + toppingsPrice;
  };

  const handleAddToCart = () => {
    const selectedToppings = orderForm.toppings.map(toppingId =>
      toppings.find(t => t.id === toppingId)
    );

    onAddToCart(product, {
      ...orderForm,
      toppings: selectedToppings,
      total: calculateTotal()
    });

    // Reset form
    setOrderForm({
      toppings: [],
      sugar: '100%',
      ice: '100%',
      note: ''
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-light text-slate-900">{product.name}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 transform hover:scale-110 transition-transform duration-300">{product.image}</div>
            <div className="text-2xl font-light text-slate-900">
              {calculateTotal().toLocaleString()}đ
            </div>
          </div>

          {/* Toppings */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Chọn topping</h4>
            <div className="space-y-3">
              {toppings.map(topping => (
                <label key={topping.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={orderForm.toppings.includes(topping.id)}
                    onChange={() => handleToppingChange(topping.id)}
                    className="h-5 w-5 text-slate-900 focus:ring-slate-500 border-slate-300 rounded"
                  />
                  <span className="text-base text-slate-900 flex-1">
                    {topping.name}
                  </span>
                  <span className="text-sm text-slate-500">
                    +{topping.price.toLocaleString()}đ
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sugar Level */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Lượng đường</h4>
            <div className="flex flex-wrap gap-3">
              {sugarLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setOrderForm(prev => ({ ...prev, sugar: level }))}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${orderForm.sugar === level
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Ice Level */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Lượng đá</h4>
            <div className="flex flex-wrap gap-3">
              {iceLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setOrderForm(prev => ({ ...prev, ice: level }))}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${orderForm.ice === level
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Ghi chú</h4>
            <textarea
              value={orderForm.note}
              onChange={(e) => setOrderForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Ghi chú thêm cho đơn hàng..."
              className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
              rows="3"
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-full text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
          >
            Thêm vào giỏ hàng - {calculateTotal().toLocaleString()}đ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;