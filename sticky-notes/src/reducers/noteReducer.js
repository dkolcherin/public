import NoteInfo from './../data/NoteInfo';

const localStorageItemName = "notes";

const saveToLocalStorage = (notes) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

const loadFromLocalStorage = () => JSON.parse(localStorage.getItem(localStorageItemName) || "[]");

export const noteActions = {
  NOTE_CHANGED: Symbol(),
  ADD_NOTE: Symbol(),
  LOAD_NOTES: Symbol(),
  REMOVE_NOTE: Symbol()
};

export function noteReducer(state, action) {
  switch(action.type) {
    case noteActions.LOAD_NOTES: {
      const newState = loadFromLocalStorage().map(n => new NoteInfo(n));
      newState.sort((n1, n2) => n1.layer - n2.layer);
      newState.forEach((n, i) => n.layer = i);
      return newState;
    }
    case noteActions.ADD_NOTE: {
      const newState = [
        ...state,
        new NoteInfo(action.data)
      ];
      saveToLocalStorage(newState);
      return newState;
    }
    case noteActions.NOTE_CHANGED: {
      const newState = state.map(n => {
        if (n.id !== action.id) {
          return n;
        }
        const newNote = {...n, ...action.data};
        return newNote;
      });
      saveToLocalStorage(newState);
      return newState;
    }
    case noteActions.REMOVE_NOTE: {
      const newState = state.filter(n => n.id !== action.id);
      saveToLocalStorage(newState);
      return newState;
    }
    default: throw new Error("noteReduced action type is not defined");
  }
}