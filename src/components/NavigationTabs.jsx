import React from 'react';
import PropTypes from 'prop-types';
import { Coffee, ShoppingBag } from 'lucide-react';

const NavigationTabs = ({ activeTab, setActiveTab, cartCount = 0 }) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'menu'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Coffee className="w-5 h-5 mr-2" />
          Menu
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'cart'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Giỏ hàng
          {cartCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-slate-900 text-white rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

NavigationTabs.propTypes = {
  activeTab: PropTypes.oneOf(['menu', 'cart']).isRequired,
  setActiveTab: PropTypes.func.isRequired,
  cartCount: PropTypes.number
};

export default NavigationTabs;