import React, {useState, useRef, useEffect} from "react";
import Note from "./Note";
import NoteInfo, { IChangeNoteInfo, INoteInfo } from './../data/NoteInfo';
import Trash from './Trash';

const trashWidth = 60;

type BoardProps = {
  notes: INoteInfo[],
  onNoteChanged: (id: string, data: IChangeNoteInfo) => void,
  createNote: (data: IChangeNoteInfo) => void,
  removeNote: (id: string) => void
};

const Board: React.FC<BoardProps> = (props) => {
  const [width, setWidth] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  const [isNewNoteCreation, setIsNewNoteCreation] = useState(false);
  const [newNotePosition, setNewNotePosition] = useState({top: 0, left: 0});
  const [newNoteSize, setNewNoteSize] = useState({width: 0, height: 0});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const maxLayerValue = useRef<number>();
  
  const {notes} = props;

  useEffect(() => {
    const setBoardWidth = (): void => {
      const container: any = containerRef.current;
      setWidth(container.clientWidth);
    };
    setBoardWidth();
    window.addEventListener("resize", setBoardWidth);
    return () => {
      window.removeEventListener("resize", setBoardWidth);
    };
  }, []);

  const getMaxLayerValue = (inc?: boolean): number => {
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

  const createNewNoteInternal = ({top = 0, left = 0, width = 0, height = 0}: IChangeNoteInfo) => {
    const noteData = {
      top: Math.max(top, 10),
      left: Math.max(left, 10),
      width: Math.max(width, NoteInfo.minSize),
      height: Math.max(height, NoteInfo.minSize),
      layer: getMaxLayerValue(true)
    };

    props.createNote(noteData);
  };

  const createNewNote = (e: React.MouseEvent) => {
    let {offsetY: top, offsetX: left} = e.nativeEvent;
    if (left + NoteInfo.initialSize > width) {
      left = width - NoteInfo.initialSize;
    }
    const container: any = containerRef.current;
    if (container.scrollLeft) {
      left += container.scrollLeft;
    }
    if (container.scrollTop) {
      top += container.scrollTop;
    }
    createNewNoteInternal({top, left, width: NoteInfo.initialSize, height: NoteInfo.initialSize});
  };

  const onNoteMoveEnd = (noteInfo: INoteInfo): void => {
    //check if note is in "trash" zone
    if (noteInfo.left + noteInfo.width > width - 10 - trashWidth) {
      if (window.confirm("Do you want to remove this note?")) {
        props.removeNote(noteInfo.id);
      }
    }
    setIsMoving(false);
  };

  const onBoardMouseDown = (e: React.MouseEvent): void => {
    const container: any = containerRef.current;
    if (e.target !== container) {
      return;
    }

    //is left button
    if (e.nativeEvent.which !== 1) {
      return;
    }
    
    const {offsetX: initialX, offsetY: initialY} = e.nativeEvent;
    setIsNewNoteCreation(true);
    
    const offsetY = e.pageY - initialY;
    let width = 0;
    let height = 0;
    let top = 0;
    let left = 0;

    const onMouseMove = (e: MouseEvent): void => {
      e.preventDefault();
      const {pageX, pageY} = e;
      width = pageX - initialX;
      height = pageY - initialY - offsetY;
      let newTop = height < 0 ? initialY + height : initialY;
      let newLeft = width < 0 ? initialX + width : initialX;
      if (newTop !== top || newLeft !== left) {
        top = newTop;
        left = newLeft;
        setNewNotePosition({top, left});
      }
      setNewNoteSize({
        width: Math.abs(width), 
        height: Math.abs(height)
      });
    };

    const onMouseUp = (e: MouseEvent): void => {
      if (width > 0 && height > 0) {
        createNewNoteInternal({
          top,
          left,
          width: Math.abs(width),
          height: Math.abs(height)
        });
      }
      setIsNewNoteCreation(false);
      setNewNoteSize({width: 0, height: 0});
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  let newNoteStyle = {};
  if (isNewNoteCreation) {
    newNoteStyle = {
      ...newNotePosition, 
      ...newNoteSize,
      zIndex: getMaxLayerValue()
    };
  }

  return (
    <div ref={containerRef} className="board-container" onDoubleClick={createNewNote} onMouseDown={onBoardMouseDown}>
      {notes.map(n => (
        <Note key={n.id}
              boardWidth={width} 
              noteInfo={n}
              getMaxLayerValue={getMaxLayerValue}
              onNoteChanged={(data) => props.onNoteChanged(n.id, data)}
              onNoteMoveStart={() => setIsMoving(true)}
              onNoteMoveEnd={onNoteMoveEnd}
              containerElement={containerRef.current as any}
        />
      ))}
      {isNewNoteCreation && 
      <div style={newNoteStyle} className="board-newNote"></div>
      }
      {isMoving && <Trash width={trashWidth} zIndex={getMaxLayerValue() - 1} />}
    </div>
  );
};

export default Board;