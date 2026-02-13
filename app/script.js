// Timing and game logic constants
const FLIP_BACK_DELAY = 1000;
const MATCH_DELAY = 500;
const TIMER_INTERVAL = 1000;
const DEFAULT_MAX_REVEALS = 30;

// Magic numbers as named constants
const TIME_SECONDS_PER_MINUTE = 60;
const TIME_PAD_LENGTH = 2;
const DIFFICULTY_FACTOR_EASY = 0.25;
const DIFFICULTY_FACTOR_MEDIUM = 0.4;
const DIFFICULTY_FACTOR_HARD = 0.6;

let originalCards = [];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let seconds = 0;
let timerInterval = null;
let timerStarted = false;
let revealCount = 0;
let currentDifficulty = null;
let maxReveals = DEFAULT_MAX_REVEALS;

const timerElement = document.getElementById("timer");
const revealCountElement = document.getElementById("revealCount");
const revealMaxElement = document.getElementById("revealMax");
const cardsGridElement = document.getElementById("cardsGrid");
const victoryScreenElement = document.getElementById("victoryScreen");
const failureScreenElement = document.getElementById("failureScreen");
const startScreenElement = document.getElementById("startScreen");

async function getCards() {
  const response = await fetch("/cards");
  const data = await response.json();
  return data;
}

function createCardPairs(cards) {
  return [...cards, ...cards];
}

function shuffleCards(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createDiv(className, textContent = null) {
  const element = document.createElement("div");
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, TIMER_INTERVAL);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerStarted = false;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / TIME_SECONDS_PER_MINUTE);
  const secs = totalSeconds % TIME_SECONDS_PER_MINUTE;
  return `${mins}:${secs.toString().padStart(TIME_PAD_LENGTH, "0")}`;
}

function updateTimerDisplay() {
  timerElement.textContent = formatTime(seconds);
}

function incrementRevealCount() {
  revealCount++;
  revealCountElement.textContent = revealCount;
}

function addCardToGrid(grid, card) {
  const mainContainer = createDiv("card");
  mainContainer.dataset.cardId = card.id;
  mainContainer.addEventListener("click", handleCardClick);

  const cardInner = createDiv("card-inner");
  mainContainer.appendChild(cardInner);

  const cardFront = createDiv("card-front", "♦ ♠ ♣ ♥");
  cardInner.appendChild(cardFront);

  const cardBack = createDiv("card-back");
  cardInner.appendChild(cardBack);

  const emoji = createDiv(null, card.emoji);
  cardBack.appendChild(emoji);

  const name = createDiv(null, card.name);
  cardBack.appendChild(name);

  grid.appendChild(mainContainer);
}

function renderCards(cards) {
  while (cardsGridElement.firstChild) {
    cardsGridElement.removeChild(cardsGridElement.firstChild);
  }
  cards.forEach((card) => addCardToGrid(cardsGridElement, card));
}

function setMaxReveals() {
  const numberOfCards = cards.length;
  let factor;

  switch (currentDifficulty) {
    case "easy":
      factor = DIFFICULTY_FACTOR_EASY;
      break;
    case "medium":
      factor = DIFFICULTY_FACTOR_MEDIUM;
      break;
    case "hard":
      factor = DIFFICULTY_FACTOR_HARD;
      break;
    default:
      factor = DIFFICULTY_FACTOR_EASY;
  }

  maxReveals = Math.round(numberOfCards / factor);
  revealMaxElement.textContent = maxReveals;
}

function handleCardClick(event) {
  const card = event.currentTarget;

  if (!timerStarted) startTimer();

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length === 2
  ) {
    return;
  }

  card.classList.add("flipped");
  incrementRevealCount();

  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;
  const id1 = card1.dataset.cardId;
  const id2 = card2.dataset.cardId;

  if (id1 === id2) {
    setTimeout(() => {
      card1.classList.add("matched");
      card2.classList.add("matched");
      flippedCards = [];
      matchedPairs++;
      checkWinCondition();
    }, MATCH_DELAY);
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, FLIP_BACK_DELAY);
  }

  checkFailureCondition();
}

function checkWinCondition() {
  if (matchedPairs === originalCards.length) {
    initVictoryScreen();
  }
}

function checkFailureCondition() {
  if (revealCount >= maxReveals) {
    initFailureScreen();
  }
}

function doEndgameCleanup() {
  stopTimer();
  cardsGridElement.style.display = "none";
  while (cardsGridElement.firstChild) {
    cardsGridElement.removeChild(cardsGridElement.firstChild);
  }
}

function initVictoryScreen() {
  doEndgameCleanup();
  victoryScreenElement.style.display = "block";
  failureScreenElement.style.display = "none";

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ffff00", "#ff0000", "#00ff00", "#0000ff"],
  });
}

function initFailureScreen() {
  doEndgameCleanup();
  victoryScreenElement.style.display = "none";
  failureScreenElement.style.display = "block";
}

function initStartScreen() {
  victoryScreenElement.style.display = "none";
  failureScreenElement.style.display = "none";
  cardsGridElement.style.display = "none";
  startScreenElement.style.display = "block";
}

async function initGame(difficulty = "easy") {
  currentDifficulty = difficulty;
  flippedCards = [];
  matchedPairs = 0;
  revealCount = 0;
  seconds = 0;
  timerStarted = false;

  clearInterval(timerInterval);

  startScreenElement.style.display = "none";
  victoryScreenElement.style.display = "none";
  failureScreenElement.style.display = "none";
  cardsGridElement.style.display = "grid";

  timerElement.textContent = "0";
  revealCountElement.textContent = "0";

  originalCards = await getCards();
  cards = shuffleCards(createCardPairs(originalCards));
  renderCards(cards);
  setMaxReveals();
}

initStartScreen();
