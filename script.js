const cardData = [
  { id: 1, name: "Cat", emoji: "🐱" },
  { id: 2, name: "Dog", emoji: "🐶" },
  { id: 3, name: "Fox", emoji: "🦊" },
  { id: 4, name: "Lion", emoji: "🦁" },
  { id: 5, name: "Panda", emoji: "🐼" },
  { id: 6, name: "Koala", emoji: "🐨" },
];

function createPairs(cards) {
  return [...cards, ...cards];
}

function shuffle(array) {
  const shuffled = [...array]; // Create copy

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

let cards = [];

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
let seconds = 0;
let timerInterval = null;
let timerStarted = false;
let revealCount = 0;

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

  // Don't count if card is already flipped or matched or 2 cards are already flipped
  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length === 2
  ) {
    return;
  }

  // Flip the card
  card.classList.add("flipped");

  // Increment reveal count and update DOM
  revealCount++;
  const revealElement = document.getElementById("revealCount");
  if (revealElement) revealElement.textContent = revealCount;

  // Add to flipped cards array
  flippedCards.push(card);

  // Check for match when 2 cards are flipped
  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;
  const id1 = card1.dataset.cardId;
  const id2 = card2.dataset.cardId;

  if (id1 === id2) {
    // Match: keep them flipped and mark as matched
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
}

function checkWinCondition() {
  const TOTAL_PAIRS = cardData.length;
  if (matchedPairs === TOTAL_PAIRS) {
    stopTimer();
    setTimeout(() => {
      const message = `🎉 You won!\nTime: ${formatTime(seconds)}`;
      alert(message);
    }, 500);
  }
}

function initGame() {
  flippedCards = [];
  matchedPairs = 0;
  revealCount = 0;
  seconds = 0;
  timerStarted = false;

  clearInterval(timerInterval);

  document.getElementById("timer").textContent = "0";
  document.getElementById("revealCount").textContent = "0";

  cards = shuffle(createPairs(cardData));
  renderCards(cards);
}

initGame();
