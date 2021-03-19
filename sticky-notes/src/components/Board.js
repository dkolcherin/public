import React, {useState, useRef, useEffect} from "react";
import PropTypes from 'prop-types';
import Note from "./Note";
import NoteInfo from './../data/NoteInfo';
import Trash from './Trash';

const trashWidth = 60;

const Board = (props) => {
  const [width, setWidth] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  
  const containerRef = useRef();
  const maxLayerValue = useRef();

  const {notes} = props;

  useEffect(() => {
    const setBoardWidth = () => {
      setWidth(containerRef.current.clientWidth);
    };
    setBoardWidth();
    window.addEventListener("resize", setBoardWidth);
    return () => {
      window.removeEventListener("resize", setBoardWidth);
    };
  }, []);

  const getMaxLayerValue = (inc) => {
    if (typeof maxLayerValue.current === "undefined") {
      let max = 0;
      notes.forEach(n => {
        if (n.layer > max) {
          max = n.layer;
        }
      });
      maxLayerValue.current = max;
    }
    if (inc) {
      maxLayerValue.current++;
    }
    return maxLayerValue.current;
  };

  const createNewNote = (e) => {
    let {offsetY: top, offsetX: left} = e.nativeEvent;
    if (left + NoteInfo.initialSize > width) {
      left = width - NoteInfo.initialSize;
    }
    const noteData = {
      top,
      left,
      width: NoteInfo.initialSize,
      height: NoteInfo.initialSize,
      layer: getMaxLayerValue(true)
    };

    props.createNote(noteData);
  };

  const onNoteMoveEnd = (noteInfo) => {
    //check if note is in "trash" zone
    if (noteInfo.left + noteInfo.width > width - 10 - trashWidth) {
      if (window.confirm("Do you want to remove this note?")) {
        props.removeNote(noteInfo.id);
      }
    }
    setIsMoving(false);
  };

  return (
    <div ref={containerRef} className="board-container" onDoubleClick={createNewNote}>
      {notes.map(n => (
        <Note key={n.id}
              boardWidth={width} 
              noteInfo={n}
              getMaxLayerValue={getMaxLayerValue}
              onNoteChanged={(data) => props.onNoteChanged(n.id, data)}
              onNoteMoveStart={() => setIsMoving(true)}
              onNoteMoveEnd={onNoteMoveEnd}
              containerElement={containerRef.current}
        />
      ))}
      {isMoving && <Trash width={trashWidth} zIndex={getMaxLayerValue() - 1} />}
    </div>
  );
};

Board.propTypes = {
  notes: PropTypes.array.isRequired,
  onNoteChanged: PropTypes.func.isRequired,
  createNote: PropTypes.func.isRequired,
  removeNote: PropTypes.func.isRequired,
};

export default Board;