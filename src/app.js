// UI code: connects the quiz logic (quiz.js) to the page (index.html).

const QUESTION_TIME_LIMIT = 15;
const state = {
  quiz: createQuiz([]),
  timerId: null,
  timerToken: 0,
  questionResolved: false,
};

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const progressText = document.getElementById("progress");
const timerText = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options");
const feedbackText = document.getElementById("feedback");
const nextButton = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const gradeText = document.getElementById("grade-text");

function stopQuestionTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  state.timerToken++;
}

function timeOutQuestion() {
  if (state.questionResolved) return;
  state.questionResolved = true;
  stopQuestionTimer();

  const question = state.quiz.questions[state.quiz.current];
  const buttons = optionsList.querySelectorAll("button");
  const optionHadFocus = optionsList.contains(document.activeElement);
  buttons.forEach((button) => (button.disabled = true));
  buttons[question.answer].classList.add("correct");
  feedbackText.textContent = "Time's up!";
  nextButton.hidden = false;
  if (optionHadFocus) nextButton.focus();
}

function updateQuestionTimer(deadline, timerToken) {
  if (timerToken !== state.timerToken || state.questionResolved) return;

  const secondsLeft = Math.max(0, (deadline - Date.now()) / 1000);
  timerText.textContent = formatTimeLeft(secondsLeft);
  timerText.classList.toggle("is-low", secondsLeft <= 5);
  if (secondsLeft === 0) timeOutQuestion();
}

function startQuestionTimer() {
  stopQuestionTimer();
  state.questionResolved = false;
  const timerToken = state.timerToken;
  const deadline = Date.now() + QUESTION_TIME_LIMIT * 1000;
  updateQuestionTimer(deadline, timerToken);
  if (!state.questionResolved) {
    state.timerId = setInterval(() => updateQuestionTimer(deadline, timerToken), 250);
  }
}

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function startQuiz() {
  stopQuestionTimer();
  state.quiz = createQuiz(shuffle(QUESTIONS));
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  const question = state.quiz.questions[state.quiz.current];
  progressText.textContent = `Question ${state.quiz.current + 1} of ${state.quiz.questions.length}`;
  questionText.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.hidden = true;
  optionsList.innerHTML = "";

  question.options.forEach((option, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));
    item.appendChild(button);
    optionsList.appendChild(item);
  });
  startQuestionTimer();
}

function selectAnswer(selectedIndex, selectedButton) {
  if (state.questionResolved) return;
  state.questionResolved = true;
  stopQuestionTimer();

  const question = state.quiz.questions[state.quiz.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = true));

  const result = answerQuestion(state.quiz, selectedIndex);
  state.quiz = result.state;
  if (result.correct) {
    selectedButton.classList.add("correct");
    feedbackText.textContent = "Correct!";
  } else {
    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");
    feedbackText.textContent = "Not quite. The correct answer is highlighted.";
  }

  nextButton.hidden = false;
  nextButton.focus();
}

function nextQuestion() {
  stopQuestionTimer();
  state.quiz = advanceQuestion(state.quiz);
  if (!isQuizFinished(state.quiz)) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  stopQuestionTimer();
  const total = state.quiz.questions.length;
  const percentage = calculatePercentage(state.quiz.score, total);
  scoreText.textContent = `You scored ${state.quiz.score} out of ${total} (${percentage}%)`;
  gradeText.textContent = `Grade: ${getGrade(percentage)}`;
  showScreen(resultScreen);
}

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
