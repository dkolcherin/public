const getUniqueId = () => Math.random().toString(36).substr(2);

export default class NoteInfo {
  constructor({
    id = getUniqueId(),
    text = "", 
    top = 0, 
    left = 0, 
    width = NoteInfo.initialSize, 
    height = NoteInfo.initialSize,
    noteColor = NoteInfo.availableNoteColors[0],
    layer = 0
  }) {
    this.id = id;
    this.text = text;
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.noteColor = noteColor;
    this.layer = layer;
  }

  static minSize = 100;
  static initialSize = 200;
  static availableNoteColors = [ "#FFF440", "#CDF93E", "#DC63C2", "aqua" ];
}