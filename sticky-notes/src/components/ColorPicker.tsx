import React from 'react';

type ColorPickerProps = {
  colors: string[],
  selectedColor: string,
  onColorChanged: (color: string) => void
};

const ColorPicker: React.FC<ColorPickerProps> = (props) => {
  const onSelectedColorChanged = (color: string) => {
    if (color !== props.selectedColor) {
      props.onColorChanged(color)
    }
  };

  const renderColor = (color: string) => {
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

export default ColorPicker;