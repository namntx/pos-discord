import React from 'react';
import PropTypes from 'prop-types';

const Header = ({
  title = 'Bữa Nay Kafe',
  description = 'Khám phá thế giới đồ uống với những hương vị độc đáo và trải nghiệm đặt hàng tiện lợi'
}) => {
  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl font-light text-slate-900 mb-4">{title}</h1>
      <p className="text-slate-600 max-w-2xl mx-auto">
        {description}
      </p>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
};

export default Header;