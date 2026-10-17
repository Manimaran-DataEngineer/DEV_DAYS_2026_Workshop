// Tests use Node's built-in test runner, so nothing needs to be installed.
// Run them with:  npm test
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  shuffle,
  createQuiz,
  answerQuestion,
  advanceQuestion,
  isQuizFinished,
  isCorrect,
  calculatePercentage,
  getGrade,
  getFeedbackMessage,
  formatTimeLeft,
} = require("../src/quiz.js");

test("createQuiz initializes progress for the given questions", () => {
  const questions = [{ answer: 1 }];
  const state = createQuiz(questions);

  assert.deepEqual(state, { questions, current: 0, score: 0 });
  assert.notEqual(state.questions, questions);
});

test("createQuiz initializes an empty quiz", () => {
  assert.deepEqual(createQuiz([]), { questions: [], current: 0, score: 0 });
});

test("createQuiz rejects null questions", () => {
  assert.throws(() => createQuiz(null), TypeError);
});

test("answerQuestion increments the score for a correct selection without mutation", () => {
  const state = createQuiz([{ answer: 1 }]);
  const result = answerQuestion(state, 1);

  assert.equal(result.correct, true);
  assert.deepEqual(result.state, { questions: state.questions, current: 0, score: 1 });
  assert.equal(state.score, 0);
  assert.notEqual(result.state, state);
});

test("answerQuestion leaves the score unchanged for a wrong selection", () => {
  const state = createQuiz([{ answer: 1 }]);
  const result = answerQuestion(state, 0);

  assert.equal(result.correct, false);
  assert.equal(result.state.score, 0);
  assert.equal(state.score, 0);
});

test("answerQuestion rejects null state", () => {
  assert.throws(() => answerQuestion(null, 0), TypeError);
});

test("answerQuestion rejects a finished quiz", () => {
  const state = advanceQuestion(createQuiz([{ answer: 0 }]));
  assert.throws(() => answerQuestion(state, 0), RangeError);
});

test("advanceQuestion returns a new state at the next question", () => {
  const state = createQuiz([{ answer: 0 }, { answer: 1 }]);
  const next = advanceQuestion(state);

  assert.equal(next.current, 1);
  assert.equal(state.current, 0);
  assert.notEqual(next, state);
});

test("isQuizFinished returns false before the final question", () => {
  assert.equal(isQuizFinished(createQuiz([{ answer: 0 }])), false);
});

test("isQuizFinished returns true after the final question", () => {
  assert.equal(isQuizFinished(advanceQuestion(createQuiz([{ answer: 0 }]))), true);
});

test("isQuizFinished returns true for an empty quiz", () => {
  assert.equal(isQuizFinished(createQuiz([])), true);
});

test("isQuizFinished rejects null state", () => {
  assert.throws(() => isQuizFinished(null), TypeError);
});

test("isCorrect returns true for the right answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 2), true);
});

test("isCorrect returns false for a wrong answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 0), false);
});

test("calculatePercentage rounds to a whole number", () => {
  assert.equal(calculatePercentage(2, 3), 67);
});

test("calculatePercentage returns 0 when there are no questions", () => {
  assert.equal(calculatePercentage(0, 0), 0);
});

test("shuffle keeps every item and does not change the original array", () => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
});

test("getGrade returns A when percentage is 90", () => {
  assert.equal(getGrade(90), "A");
});

test("getGrade returns B when percentage is 89", () => {
  assert.equal(getGrade(89), "B");
});

test("getGrade returns B when percentage is 75", () => {
  assert.equal(getGrade(75), "B");
});

test("getGrade returns C when percentage is 74", () => {
  assert.equal(getGrade(74), "C");
});

test("getGrade returns C when percentage is 50", () => {
  assert.equal(getGrade(50), "C");
});

test("getGrade returns Keep practicing when percentage is 49", () => {
  assert.equal(getGrade(49), "Keep practicing");
});

test("getFeedbackMessage encourages when grade is A", () => {
  assert.equal(getFeedbackMessage("A"), "Excellent work!");
});

test("getFeedbackMessage encourages when grade is B", () => {
  assert.equal(getFeedbackMessage("B"), "Great job!");
});

test("getFeedbackMessage encourages when grade is C", () => {
  assert.equal(getFeedbackMessage("C"), "Good effort!");
});

test("getFeedbackMessage returns a fallback when grade is unknown", () => {
  assert.equal(getFeedbackMessage("D"), "Keep practicing!");
});

test("getFeedbackMessage returns a fallback when grade is null", () => {
  assert.equal(getFeedbackMessage(null), "Keep practicing!");
});

test("formatTimeLeft formats positive seconds when given 15", () => {
  assert.equal(formatTimeLeft(15), "⏱ 15s");
});

test("formatTimeLeft formats seconds when given 12", () => {
  assert.equal(formatTimeLeft(12), "⏱ 12s");
});

test("formatTimeLeft formats seconds at the warning threshold", () => {
  assert.equal(formatTimeLeft(5), "⏱ 5s");
});

test("formatTimeLeft rounds up when given fractional seconds", () => {
  assert.equal(formatTimeLeft(11.2), "⏱ 12s");
});

test("formatTimeLeft formats zero when given zero", () => {
  assert.equal(formatTimeLeft(0), "⏱ 0s");
});

test("formatTimeLeft clamps negative seconds when given a negative value", () => {
  assert.equal(formatTimeLeft(-1), "⏱ 0s");
});

test("formatTimeLeft rejects null when given null", () => {
  assert.throws(() => formatTimeLeft(null), TypeError);
});

test("formatTimeLeft rejects empty input when given an empty string", () => {
  assert.throws(() => formatTimeLeft(""), TypeError);
});

test("formatTimeLeft rejects non-finite values when given Infinity", () => {
  assert.throws(() => formatTimeLeft(Infinity), TypeError);
});
