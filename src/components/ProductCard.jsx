import React from 'react';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onOrderClick }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
            {product.image}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">{product.name}</h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="text-xl font-light text-slate-900 mb-6">
          {product.price.toLocaleString('vi-VN')}đ
        </div>
        <button
          onClick={() => onOrderClick(product)}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    image_url: PropTypes.string
  }).isRequired,
  onOrderClick: PropTypes.func.isRequired
};

export default ProductCard;