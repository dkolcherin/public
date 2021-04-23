import React, {useState} from "react";
import ColorPicker from "./ColorPicker";
import NoteInfo, { INoteInfo } from './../data/NoteInfo';

type NoteProps = {
  boardWidth: number,
  noteInfo: INoteInfo,
  getMaxLayerValue: (inc?: boolean) => number,
  onNoteChanged: (data: object) => void,
  onNoteMoveStart: () => void,
  onNoteMoveEnd: (data: INoteInfo) => void,
  containerElement: HTMLDivElement
};

type Coordinates = {
  x: number,
  y: number
};

type MouseMoveHandlerArguments = {
  pageX: number,
  pageY: number,
  offsetX?: number,
  offsetY?: number
};

type ChangePositionOrSizeArguments = {
  e: React.MouseEvent,
  x: number,
  y: number,
  onMouseMoveHandler: (data: MouseMoveHandlerArguments) => Coordinates,
  changeNoteData: (cord: Coordinates) => void,
  onBeforeAction?: () => void
};

const Note: React.FC<NoteProps> = (props) => {
  const [position, setPosition] = useState({top: props.noteInfo.top, left: props.noteInfo.left});
  const [size, setSize] = useState({width: props.noteInfo.width, height: props.noteInfo.height});
  
  const updateNoteLayer = (): void => {
    const maxLayer = props.getMaxLayerValue();
    if (props.noteInfo.layer < maxLayer) {
      props.onNoteChanged({
        layer: props.getMaxLayerValue(true)
      });
    }
  };

  //chech newValue against bounds
  const getStateValue = (newValue: number, lowerLimit: number, upperLimit?: number): number => {
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
  }: ChangePositionOrSizeArguments): void => {
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

    const onMouseMove = (e: MouseEvent): void => {
      e.preventDefault();
      const {pageX, pageY} = e;
      ({x, y} = onMouseMoveHandler({offsetX, offsetY, pageX, pageY}));
    };
  
    const onMouseUp = (e: MouseEvent): void => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      
      changeNoteData({x, y});
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const headerHeight = 50;
  const getFixYValue = () => props.containerElement.scrollTop - headerHeight;

  const onMoveStart = (e: React.MouseEvent): void => changePositionOrSize({
    e,
    x: position.left, y: position.top,
    onMouseMoveHandler: ({offsetX, offsetY, pageX, pageY}) => {
      const x = getStateValue(pageX - (offsetX || 0), 10, props.boardWidth - size.width - 12);
      const y = getStateValue(pageY - (offsetY || 0) + getFixYValue(), 10);
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

  const onResizeStart = (e: React.MouseEvent): void => changePositionOrSize({
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

  const onTextChanged = (e: React.FormEvent<HTMLTextAreaElement>): void => {
    props.onNoteChanged({
      text: e.currentTarget.value
    });
  };

  const onNoteColorChanged = (color: string): void => {
    if (color === props.noteInfo.noteColor) {
      return;
    }
    props.onNoteChanged({
      noteColor: color
    });
  };

  const onNoteClick = (e: React.MouseEvent): void => {
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

export default Note;