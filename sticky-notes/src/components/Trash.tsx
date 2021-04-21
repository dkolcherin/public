import React, { CSSProperties } from 'react'

const Trash: React.FC<CSSProperties> = (props) => {
  return (
    <div className="trash-container" style={props}>
      <h1>Trash</h1>
    </div>
  );
};

export default Trash;