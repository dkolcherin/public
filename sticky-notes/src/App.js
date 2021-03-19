import { useReducer, useEffect } from 'react';
import { noteActions, noteReducer } from "./reducers/noteReducer";
import Board from './components/Board';
import { API } from './data/API';

const App = () => {
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

  const loadNotes = () => {
    dispatch({type: noteActions.LOAD_NOTES});
  };

  const onNoteChanged = (id, data) => {
    dispatch({type: noteActions.NOTE_CHANGED, id, data});
  };

  const createNote = (data) => {
    dispatch({type: noteActions.ADD_NOTE, data});
  };

  const removeNote = (id) => {
    dispatch({type: noteActions.REMOVE_NOTE, id});
  };

  const onHelpButtonClick = () => {
    const text = 
`Double-click on the board to create a new note!
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
             dispatch={dispatch} 
             onNoteChanged={onNoteChanged}
             createNote={createNote}
             removeNote={removeNote}
      />
    </div>
  );
}

export default App;
