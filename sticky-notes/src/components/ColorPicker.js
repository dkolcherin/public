import React from 'react';
import PropTypes from 'prop-types';

const ColorPicker = (props) => {
  const onSelectedColorChanged = (color) => {
    if (color !== props.selectedColor) {
      props.onColorChanged(color)
    }
  };

  const renderColor = (color) => {
    return (
      <div key={color} className="colorPicker-item" style={{backgroundColor: color}} onClick={() => onSelectedColorChanged(color)} />
    );
  };
  
  return (
    <div className="colorPicker-container">
      {props.colors.map(renderColor)}
    </div>
  );
};

ColorPicker.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedColor: PropTypes.string,
  onColorChanged: PropTypes.func.isRequired
};

export default ColorPicker;