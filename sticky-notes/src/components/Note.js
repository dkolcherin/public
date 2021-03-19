import React, {useState} from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import NoteInfo from './../data/NoteInfo';

const Note = (props) => {
  const [top, setTop] = useState(props.noteInfo.top);
  const [left, setLeft] = useState(props.noteInfo.left);
  const [width, setWidth] = useState(props.noteInfo.width);
  const [height, setHeight] = useState(props.noteInfo.height);
  
  const updateNoteLayer = () => {
    const maxLayer = props.getMaxLayerValue();
    if (props.noteInfo.layer < maxLayer) {
      onNoteFieldChanged("layer", props.getMaxLayerValue(true));
    }
  };

  //chech newValue against bounds
  const getStateValue = (newValue, lowerLimit, upperLimit) => {
    if (typeof lowerLimit !== "undefined" && newValue < lowerLimit) {
      newValue = lowerLimit;
    }
    if (typeof upperLimit !== "undefined" && newValue > upperLimit) {
      newValue = upperLimit;
    }
    return newValue;
  };

  //universal func for set note's position or size
  const changePositionOrSize = ({
    e, 
    x, y, 
    setX, setY, 
    calcX, calcY, 
    minX = 0, minY = 0, 
    maxX, maxY, 
    mapForOutput, 
    onBeforeAction, onAfterAction
  }) => {
    e.stopPropagation();
    updateNoteLayer();
    
    //is left button
    if (e.nativeEvent.which !== 1) {
      return;
    }

    if (onBeforeAction) {
      onBeforeAction();
    }

    const {offsetX, offsetY} = e.nativeEvent;

    const onMouseMove = (e) => {
      e.preventDefault();
      const {pageX, pageY} = e;
      x = getStateValue(calcX({pageX, offsetX}), minX, maxX);
      y = getStateValue(calcY({pageY, offsetY}), minY, maxY);
      setX(x);
      setY(y);
    };
  
    const onMouseUp = (e) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      
      const changedData = {
        [mapForOutput["x"]]: x,
        [mapForOutput["y"]]: y
      };
      props.onNoteChanged(changedData);

      if (onAfterAction) {
        onAfterAction({...props.noteInfo, ...changedData});
      }
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const headerHeight = 50;
  const getFixYValue = () => props.containerElement.scrollTop - headerHeight;

  const onMoveStart = (e) => changePositionOrSize({
    e,
    x: left, y: top,
    setX: setLeft, setY: setTop,
    calcX: ({pageX, offsetX}) => pageX - offsetX,
    calcY: ({pageY, offsetY}) => pageY - offsetY + getFixYValue(),
    minX: 10, minY: 10,
    maxX: props.boardWidth - width - 12,
    mapForOutput: { "x": "left", "y": "top" },
    onBeforeAction: props.onNoteMoveStart,
    onAfterAction: props.onNoteMoveEnd
  });

  const onResizeStart = (e) => changePositionOrSize({
    e,
    x: width, y: height,
    setX: setWidth, setY: setHeight,
    calcX: ({pageX}) => pageX - left,
    calcY: ({pageY}) => pageY - top + getFixYValue(),
    minX: NoteInfo.minSize, minY: NoteInfo.minSize,
    maxX: props.boardWidth - left - 12,
    mapForOutput: { "x": "width", "y": "height" }
  });

  const onNoteFieldChanged = (fieldName, value) => {
    if (value === props.noteInfo[fieldName]) {
      return;
    }
    props.onNoteChanged({
      [fieldName]: value
    });
  };

  const onTextChanged = (e) => {
    onNoteFieldChanged("text", e.target.value);
  };

  const onNoteColorChanged = (color) => {
    onNoteFieldChanged("noteColor", color);
  };

  const onNoteClick = (e) => {
    updateNoteLayer();
  };

  const {text, noteColor, layer} = props.noteInfo;

  const style = { 
    top, 
    left, 
    width, 
    height, 
    backgroundColor: noteColor, 
    zIndex: layer 
  };

  return (
    <div className="note-container" 
         style={style}
         onClick={onNoteClick}
         onDoubleClick={e => e.stopPropagation()}
    >
      <div className="note-header" onMouseDown={onMoveStart} />
      <div className="note-colorPicker">
        <ColorPicker colors={NoteInfo.availableNoteColors}
                     selectedColor={noteColor} 
                     onColorChanged={onNoteColorChanged}
        />
      </div>
      <div className="note-resizeAnchor" onMouseDown={onResizeStart} />
      <div className="note-textAreaContainer">
        <textarea className="note-textContainer" 
                  style={{backgroundColor: noteColor}}
                  value={text} 
                  onChange={onTextChanged} 
        />
      </div>
    </div>
  );
};

Note.propTypes = {
  boardWidth: PropTypes.number.isRequired,
  noteInfo: PropTypes.object.isRequired,
  getMaxLayerValue: PropTypes.func.isRequired,
  onNoteChanged: PropTypes.func.isRequired,
  onNoteMoveStart: PropTypes.func.isRequired,
  onNoteMoveEnd: PropTypes.func.isRequired,
  containerElement: PropTypes.object.isRequired
};

export default Note;