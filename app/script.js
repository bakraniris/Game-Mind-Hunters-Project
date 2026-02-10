let originalCards = [];
let cards = [];
let seconds = 0;
let timerInterval = null;
let timerStarted = false;
let revealCount = 0;
let currentDifficulty = null;
let maxReveals = 30;

async function getCards() {
  const response = await fetch("/cards");
  const data = await response.json();

  console.log(data);
  return data;
}
getCards();

function createPairs(cards) {
  return [...cards, ...cards];
}

function shuffle(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function shuffle(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function addCardToGrid(grid, card) {
  const el = document.createElement("div");
  el.className = "card";
  el.dataset.cardId = card.id;
  el.addEventListener("click", handleCardClick);

  const cardInner = document.createElement("div");
  cardInner.className = "card-inner";
  el.appendChild(cardInner);

  const cardFront = document.createElement("div");
  cardFront.className = "card-front";
  cardFront.textContent = "♦ ♠ ♣ ♥";
  cardInner.appendChild(cardFront);

  const cardBack = document.createElement("div");
  cardBack.className = "card-back";
  cardInner.appendChild(cardBack);

  const emoji = document.createElement("div");
  emoji.textContent = card.emoji;
  cardBack.appendChild(emoji);

  const name = document.createElement("div");
  name.textContent = card.name;
  cardBack.appendChild(name);

  grid.appendChild(el);
}

function renderCards(cards) {
  const grid = document.getElementById("cardsGrid");

  cards.forEach((card) => {
    addCardToGrid(grid, card);
  });
}

function setMaxReveals() {
  const numberOfCards = cards.length;

  if (currentDifficulty == "easy") {
    maxReveals = numberOfCards / 0.25;
  } else if (currentDifficulty == "medium") {
    maxReveals = numberOfCards / 0.4;
  } else if (currentDifficulty == "hard") {
    maxReveals = numberOfCards / 0.75;
  } else {
    maxReveals = numberOfCards / 0.25;
  }

  maxReveals = Math.round(maxReveals);

  document.getElementById("revealMax").textContent = maxReveals;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updateTimerDisplay() {
  document.getElementById("timer").textContent = formatTime(seconds);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerStarted = false;
}

function incrementRevealCount() {
  revealCount++;
  document.getElementById("revealCount").textContent = revealCount;
}

function handleCardClick(event) {
  const card = event.currentTarget;
  if (!timerStarted) {
    startTimer();
  }

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length === 2
  ) {
    return;
  }

  card.classList.add("flipped");

  revealCount++;
  const revealElement = document.getElementById("revealCount");
  if (revealElement) revealElement.textContent = revealCount;

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
    }, 500);
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, 1000);
  }

  checkFailureCondition();
}

function checkWinCondition() {
  const numberOfCards = originalCards.length;

  if (matchedPairs === numberOfCards) {
    initVictoryScreen();
  }
}

function checkFailureCondition() {
  console.log(revealCount, maxReveals);
  if (revealCount >= maxReveals) {
    initFailureScreen();
  }
}

function initVictoryScreen() {
  stopTimer();
  const cardsGrid = document.getElementById("cardsGrid");
  cardsGrid.style.display = "none";
  while (cardsGrid.firstChild) {
    cardsGrid.removeChild(cardsGrid.firstChild);
  }
  document.getElementById("victoryScreen").style.display = "block";
  document.getElementById("failureScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "none";

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ffff00", "#ff0000", "#00ff00", "#0000ff"],
  });
}

function initFailureScreen() {
  stopTimer();
  const cardsGrid = document.getElementById("cardsGrid");
  cardsGrid.style.display = "none";
  while (cardsGrid.firstChild) {
    cardsGrid.removeChild(cardsGrid.firstChild);
  }
  document.getElementById("victoryScreen").style.display = "none";
  document.getElementById("failureScreen").style.display = "block";
  document.getElementById("startScreen").style.display = "none";

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ffff00", "#ff0000", "#00ff00", "#0000ff"],
  });
}

function initStartScreen() {
  document.getElementById("victoryScreen").style.display = "none";
  document.getElementById("failureScreen").style.display = "none";
  document.getElementById("cardsGrid").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
}

function initGameEasy() {
  initGame("easy");
}

function initGameMedium() {
  initGame("medium");
}

function initGameHard() {
  initGame("hard");
}

async function initGame(difficulty = "easy") {
  currentDifficulty = difficulty;
  flippedCards = [];
  matchedPairs = 0;
  revealCount = 0;
  seconds = 0;
  timerStarted = false;

  console.log("Game start. Difficulty: ", currentDifficulty);
  clearInterval(timerInterval);

  document.getElementById("victoryScreen").style.display = "none";
  document.getElementById("failureScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("cardsGrid").style.display = "grid";

  document.getElementById("timer").textContent = "0";
  document.getElementById("revealCount").textContent = "0";

  originalCards = await getCards();
  cards = shuffle(createPairs(originalCards));
  renderCards(cards);
  setMaxReveals();
}

initStartScreen();
