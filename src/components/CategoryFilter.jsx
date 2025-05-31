import React from 'react';
import { categories } from '../data/products';

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${selectedCategory === category.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;