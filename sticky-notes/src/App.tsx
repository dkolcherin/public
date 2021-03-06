import { useReducer, useEffect } from 'react';
import { noteActions, noteReducer } from "./reducers/noteReducer";
import Board from './components/Board';
import { API } from './data/API';
import { IChangeNoteInfo } from './data/NoteInfo';

const App: React.FC = () => {
  const [notes, dispatch] = useReducer(noteReducer, []);

  useEffect(() => {
    loadNotes();
  }, []);

  const onAPISave = async() => {
    try {
      const res = await API.save(notes);
      alert(res);
    }
    catch (e) {
      alert(e);
    }
  };

  const loadNotes = (): void => {
    dispatch({type: noteActions.LOAD_NOTES});
  };

  const onNoteChanged = (id: string, data: IChangeNoteInfo): void => {
    dispatch({type: noteActions.NOTE_CHANGED, id, data});
  };

  const createNote = (data: IChangeNoteInfo): void => {
    dispatch({type: noteActions.ADD_NOTE, data});
  };

  const removeNote = (id: string): void => {
    dispatch({type: noteActions.REMOVE_NOTE, id});
  };

  const onHelpButtonClick = (): void => {
    const text = 
`Double-click on the board or draw a rectangle to create a new note!
To move the note, grab it by the header area.
To remove the note, move it to the "Trash" zone on the right.`;
    alert(text);
  };

  return (
    <div className="App">
      <header className="header">
        <button className="app-saveDataButton" onClick={onAPISave}>Save API call</button>
        <span>Sticky Notes</span>
        <button className="app-helpButton" onClick={onHelpButtonClick}>?</button>
      </header>
      <Board notes={notes} 
             onNoteChanged={onNoteChanged}
             createNote={createNote}
             removeNote={removeNote}
      />
    </div>
  );
}

export default App;
