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

class Task {
  constructor(id, text, priority = 'Medium', completed = false, dueDate = null) {
    this.id = id;
    this.text = text;
    this.priority = priority; // 'High', 'Medium', 'Low'
    this.completed = completed; // boolean
    this.dueDate = dueDate; // string date or null
  }
}
