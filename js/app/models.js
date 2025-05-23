class Question {
  constructor(id, text, subject, difficulty, options, answer) {
    this.id = id;
    this.text = text;
    this.subject = subject;
    this.difficulty = difficulty;
    this.options = options; // e.g., array of strings
    this.answer = answer; // e.g., string or index of the correct option
  }
}
