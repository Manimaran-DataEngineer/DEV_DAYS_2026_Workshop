// Core quiz logic.
// This file has NO browser (DOM) code so it can be tested with Node.js.

/**
 * Returns a new array with the items in random order.
 * The original array is not changed.
 */
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createQuiz(questions) {
  return {
    questions: [...questions],
    current: 0,
    score: 0,
  };
}

function answerQuestion(state, selectedIndex) {
  if (isQuizFinished(state)) {
    throw new RangeError("Cannot answer a finished quiz");
  }

  const correct = isCorrect(state.questions[state.current], selectedIndex);
  return {
    state: {
      ...state,
      score: state.score + (correct ? 1 : 0),
    },
    correct,
  };
}

function advanceQuestion(state) {
  return {
    ...state,
    current: state.current + 1,
  };
}

function isQuizFinished(state) {
  return state.current >= state.questions.length;
}

/**
 * Returns true when the selected option is the correct one.
 */
function isCorrect(question, selectedIndex) {
  return question.answer === selectedIndex;
}

/**
 * Converts a score into a whole-number percentage (0-100).
 */
function calculatePercentage(score, total) {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

/**
 * Turns a percentage into a grade.
 * A = 90% or more, B = 75% or more, C = 50% or more.
 */
function getGrade(percentage) {
  if (percentage >= 90) return "A";
  if (percentage >= 75) return "B";
  if (percentage >= 50) return "C";
  return "Keep practicing";
}

function getFeedbackMessage(grade) {
  if (grade === "A") return "Excellent work!";
  if (grade === "B") return "Great job!";
  if (grade === "C") return "Good effort!";
  return "Keep practicing!";
}

function isNewBestScore(current, best) {
  return best === null || current > best;
}

function formatTimeLeft(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    throw new TypeError("seconds must be a finite number");
  }
  return `⏱ ${Math.max(0, Math.ceil(seconds))}s`;
}

// Lets Node.js tests load this file. Browsers ignore this block.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    shuffle,
    createQuiz,
    answerQuestion,
    advanceQuestion,
    isQuizFinished,
    isCorrect,
    calculatePercentage,
    getGrade,
    getFeedbackMessage,
    isNewBestScore,
    formatTimeLeft,
  };
}
