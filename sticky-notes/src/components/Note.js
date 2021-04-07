import React, {useState} from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import NoteInfo from './../data/NoteInfo';

const Note = (props) => {
  const [position, setPosition] = useState({top: props.noteInfo.top, left: props.noteInfo.left});
  const [size, setSize] = useState({width: props.noteInfo.width, height: props.noteInfo.height});
  
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
    onMouseMoveHandler,
    changeNoteData,
    onBeforeAction
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
      ({x, y} = onMouseMoveHandler({offsetX, offsetY, pageX, pageY}));
    };
  
    const onMouseUp = (e) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      
      changeNoteData({x, y});
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const headerHeight = 50;
  const getFixYValue = () => props.containerElement.scrollTop - headerHeight;

  const onMoveStart = (e) => changePositionOrSize({
    e,
    x: position.left, y: position.top,
    onMouseMoveHandler: ({offsetX, offsetY, pageX, pageY}) => {
      const x = getStateValue(pageX - offsetX, 10, props.boardWidth - size.width - 12);
      const y = getStateValue(pageY - offsetY + getFixYValue(), 10);
      setPosition({top: y, left: x});
      return {x, y};
    },
    changeNoteData: ({x,y}) => {
      const changedData = { left: x, top: y };
      props.onNoteChanged(changedData);
      props.onNoteMoveEnd({...props.noteInfo, ...changedData});
    },
    onBeforeAction: props.onNoteMoveStart
  });

  const onResizeStart = (e) => changePositionOrSize({
    e,
    x: size.width, y: size.height,
    onMouseMoveHandler: ({pageX, pageY}) => {
      const x = getStateValue(pageX - position.left, NoteInfo.minSize, props.boardWidth - position.left - 12); 
      const y = getStateValue(pageY - position.top + getFixYValue(), NoteInfo.minSize);
      setSize({width: x, height: y});
      return {x, y};
    },
    changeNoteData: ({x,y}) => props.onNoteChanged({ width: x, height: y })
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
    ...position,
    ...size,
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