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

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function createDiv(className, textContent = null) {
  const element = document.createElement("div");
  if (className != null) {
    element.className = className;
  }
  if (textContent != null) {
    element.textContent = textContent;
  }
  return element;
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
  if (revealCount >= maxReveals) {
    initFailureScreen();
  }
}

function doEndgameCleanup() {
  stopTimer();
  const cardsGrid = document.getElementById("cardsGrid");
  cardsGrid.style.display = "none";
  while (cardsGrid.firstChild) {
    cardsGrid.removeChild(cardsGrid.firstChild);
  }
}

function initVictoryScreen() {
  doEndgameCleanup();

  document.getElementById("victoryScreen").style.display = "block";
  document.getElementById("failureScreen").style.display = "none";

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ffff00", "#ff0000", "#00ff00", "#0000ff"],
  });
}

function initFailureScreen() {
  doEndgameCleanup();

  document.getElementById("victoryScreen").style.display = "none";
  document.getElementById("failureScreen").style.display = "block";
}

function initStartScreen() {
  document.getElementById("victoryScreen").style.display = "none";
  document.getElementById("failureScreen").style.display = "none";
  document.getElementById("cardsGrid").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
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
  cards = shuffleCards(createCardPairs(originalCards));
  renderCards(cards);
  setMaxReveals();
}

initStartScreen();
