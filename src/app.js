// UI code: connects the quiz logic (quiz.js) to the page (index.html).

const QUESTION_TIME_LIMIT = 15;
const BEST_SCORE_KEY = "dev-days-quiz-best-score";
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
const bestScoreText = document.getElementById("best-score-text");
const gradeText = document.getElementById("grade-text");

function getAndSaveBestScore(currentScore) {
  try {
    const storedScore = window.localStorage.getItem(BEST_SCORE_KEY);
    const parsedScore = storedScore === null ? null : Number(storedScore);
    const bestScore =
      Number.isInteger(parsedScore) && parsedScore >= 0 ? parsedScore : null;

    if (!isNewBestScore(currentScore, bestScore)) return bestScore;

    window.localStorage.setItem(BEST_SCORE_KEY, String(currentScore));
    return currentScore;
  } catch (error) {
    console.warn("Unable to access the saved best score.", error);
    return null;
  }
}

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

function handleAnswerShortcut(event) {
  if (event.repeat || quizScreen.hidden || state.questionResolved) return;
  if (!/^[1-4]$/.test(event.key)) return;

  const selectedIndex = Number(event.key) - 1;
  const selectedButton = optionsList.querySelectorAll("button")[selectedIndex];
  if (!selectedButton || selectedButton.disabled) return;

  event.preventDefault();
  selectAnswer(selectedIndex, selectedButton);
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
  const bestScore = getAndSaveBestScore(state.quiz.score);
  scoreText.textContent = `You scored ${state.quiz.score} out of ${total} (${percentage}%)`;
  bestScoreText.textContent =
    bestScore === null
      ? "Best score unavailable because local storage could not be accessed."
      : `Best score: ${bestScore} out of ${total}`;
  gradeText.textContent = `Grade: ${getGrade(percentage)}`;
  showScreen(resultScreen);
}

document.addEventListener("keydown", handleAnswerShortcut);
document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
