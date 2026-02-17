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
const DIFFICULTY_FACTOR_ULTRA_HARD = DIFFICULTY_FACTOR_HARD;
const DIFFICULTY_FACTOR_CROATIAN = DIFFICULTY_FACTOR_HARD;

const CROATIAN_SOUNDS = [
  { id: "sound1", sound: "./sounds/baba-srbi.m4a", name: "Sound 1" },
  { id: "sound2", sound: "./sounds/za-dom.m4a", name: "Sound 2" },
  { id: "sound3", sound: "./sounds/kralj.m4a", name: "Sound 3" },
  { id: "sound4", sound: "./sounds/p-k.m4a", name: "Sound 4" },
  { id: "sound5", sound: "./sounds/macke-viskas.m4a", name: "Sound 5" },
  { id: "sound6", sound: "./sounds/mesaj-mala.m4a", name: "Sound 6" },
];

let activeAudios = [];
const CROATIAN_MATCH_DELAY = 2500;
const CROATIAN_FLIP_BACK_DELAY = 3000;

const CHINESE_CHARACTERS = [
  "龍", "虎", "鳳", "福", "愛", "和", "夢", "花",
  "月", "星", "山", "水", "火", "風", "雲", "雪",
  "金", "玉", "竹", "蓮", "劍", "鶴", "魚", "馬",
];

// Game state
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

// Mode and selection state
let selectedMode = null;
let selectedDifficulty = null;

// Multiplayer state
let isMultiplayer = false;
let currentPlayer = 1;
let player1 = { name: "Player 1", reveals: 0, matched: 0 };
let player2 = { name: "Player 2", reveals: 0, matched: 0 };

// Singleplayer DOM elements
const singleHeaderElement = document.getElementById("singleHeader");
const timerElement = document.getElementById("timer");
const revealCountElement = document.getElementById("revealCount");
const revealMaxElement = document.getElementById("revealMax");

// Core DOM elements
const cardsGridElement = document.getElementById("cardsGrid");
const victoryScreenElement = document.getElementById("victoryScreen");
const failureScreenElement = document.getElementById("failureScreen");
const startScreenElement = document.getElementById("startScreen");
const restartContainerElement = document.getElementById("restartContainer");

// Hall of Fame DOM elements
const hallOfFameElement = document.getElementById("hallOfFame");
const hallOfFameBodyElement = document.getElementById("hallOfFameBody");
const hallOfFameTableElement = document.getElementById("hallOfFameTable");
const hallOfFameEmptyElement = document.getElementById("hallOfFameEmpty");

// Battle Arena DOM elements
const battleArenaElement = document.getElementById("battleArena");
const battleArenaBodyElement = document.getElementById("battleArenaBody");
const battleArenaTableElement = document.getElementById("battleArenaTable");
const battleArenaEmptyElement = document.getElementById("battleArenaEmpty");

// Victory save form DOM elements
const saveResultFormElement = document.getElementById("saveResultForm");
const saveNameInputElement = document.getElementById("saveNameInput");
const saveResultMessageElement = document.getElementById("saveResultMessage");
const victoryTitleElement = document.getElementById("victoryTitle");
const victorySubtitleElement = document.getElementById("victorySubtitle");

// Start screen selection DOM elements
const multiplayerNamesElement = document.getElementById("multiplayerNames");
const mp1NameInputElement = document.getElementById("player1NameInput");
const mp2NameInputElement = document.getElementById("player2NameInput");

// Multiplayer DOM elements
const turnIndicatorElement = document.getElementById("turnIndicator");
const playerPanelsRowElement = document.getElementById("playerPanelsRow");
const player1PanelElement = document.getElementById("player1Panel");
const player2PanelElement = document.getElementById("player2Panel");
const player1PanelNameElement = document.getElementById("player1PanelName");
const player2PanelNameElement = document.getElementById("player2PanelName");
const player1RevealsElement = document.getElementById("player1Reveals");
const player2RevealsElement = document.getElementById("player2Reveals");
const player1MatchedElement = document.getElementById("player1Matched");
const player2MatchedElement = document.getElementById("player2Matched");

// --- Start screen selection logic ---

function selectMode(mode) {
  selectedMode = mode;
  document.getElementById("btnSingle").classList.toggle("selected", mode === "single");
  document.getElementById("btnMulti").classList.toggle("selected", mode === "multi");
  multiplayerNamesElement.style.display = mode === "multi" ? "flex" : "none";
}

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  document.getElementById("btnEasy").classList.toggle("selected", difficulty === "easy");
  document.getElementById("btnMedium").classList.toggle("selected", difficulty === "medium");
  document.getElementById("btnHard").classList.toggle("selected", difficulty === "hard");
  document.getElementById("btnUltraHard").classList.toggle("selected", difficulty === "ultrahard");
  document.getElementById("btnCroatian").classList.toggle("selected", difficulty === "croatian");
}

function startGame() {
  if (!selectedMode) {
    alert("Please select a game mode.");
    return;
  }
  if (!selectedDifficulty) {
    alert("Please select a difficulty.");
    return;
  }

  isMultiplayer = selectedMode === "multi";

  if (isMultiplayer) {
    const name1 = mp1NameInputElement.value.trim() || "Player 1";
    const name2 = mp2NameInputElement.value.trim() || "Player 2";
    player1 = { name: name1, reveals: 0, matched: 0 };
    player2 = { name: name2, reveals: 0, matched: 0 };
    currentPlayer = Math.random() < 0.5 ? 1 : 2;
  }

  initGame(selectedDifficulty);
}

// --- Utility functions ---

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

// --- Timer (singleplayer only) ---

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  updateTimerDisplay();
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

// --- Singleplayer reveal count ---

function incrementRevealCount() {
  revealCount++;
  revealCountElement.textContent = revealCount;
}

// --- Multiplayer panel updates ---

function updatePlayerPanels() {
  player1RevealsElement.textContent = player1.reveals;
  player2RevealsElement.textContent = player2.reveals;
  player1MatchedElement.textContent = player1.matched;
  player2MatchedElement.textContent = player2.matched;
}

function updateTurnIndicator() {
  const current = currentPlayer === 1 ? player1 : player2;
  turnIndicatorElement.textContent = `${current.name}, it's your turn!`;
  player1PanelElement.classList.toggle("active-turn", currentPlayer === 1);
  player2PanelElement.classList.toggle("active-turn", currentPlayer === 2);
}

function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnIndicator();
}

// --- Card rendering ---

function getChineseCharForCard(card) {
  const cardIndex = originalCards.findIndex((c) => c.id === card.id);
  return CHINESE_CHARACTERS[cardIndex % CHINESE_CHARACTERS.length];
}

function playCardSound(soundSrc) {
  const audio = new Audio(soundSrc);
  activeAudios.push(audio);
  audio.play();
  audio.addEventListener("ended", () => {
    activeAudios = activeAudios.filter((a) => a !== audio);
  });
}

function stopAllCardSounds() {
  activeAudios.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudios = [];
}

function addCardToGrid(grid, card) {
  const isUltraHard = currentDifficulty === "ultrahard";
  const isCroatian = currentDifficulty === "croatian";

  const mainContainer = createDiv("card");
  mainContainer.dataset.cardId = card.id;
  if (isCroatian && card.sound) {
    mainContainer.dataset.sound = card.sound;
  }
  mainContainer.addEventListener("click", handleCardClick);

  const cardInner = createDiv("card-inner");
  mainContainer.appendChild(cardInner);

  let cardFront;
  if (isCroatian) {
    cardFront = createDiv("card-front croatian-front");
    const flagImg = document.createElement("img");
    flagImg.src = "./croatian-flag.png";
    flagImg.alt = "Croatian Flag 1929";
    flagImg.className = "croatian-flag-img";
    cardFront.appendChild(flagImg);
  } else {
    const frontSymbol = isUltraHard ? "龍" : "♦ ♠ ♣ ♥";
    cardFront = createDiv("card-front", frontSymbol);
  }
  cardInner.appendChild(cardFront);

  const cardBack = createDiv("card-back");
  cardInner.appendChild(cardBack);

  if (isCroatian) {
    cardBack.classList.add("croatian-back");
    const emblemImg = document.createElement("img");
    emblemImg.src = "./ustaska-zastava.png";
    emblemImg.alt = "Emblem";
    emblemImg.className = "croatian-emblem-img";
    cardBack.appendChild(emblemImg);
    const speakerIcon = createDiv("speaker-icon", "🔊");
    cardBack.appendChild(speakerIcon);
  } else {
    const displayText = isUltraHard ? getChineseCharForCard(card) : card.emoji;
    const emoji = createDiv(isUltraHard ? "chinese-char" : null, displayText);
    cardBack.appendChild(emoji);

    if (!isUltraHard) {
      const name = createDiv(null, card.name);
      cardBack.appendChild(name);
    }
  }

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
    case "ultrahard":
      factor = DIFFICULTY_FACTOR_ULTRA_HARD;
      break;
    case "croatian":
      factor = DIFFICULTY_FACTOR_CROATIAN;
      break;
    default:
      factor = DIFFICULTY_FACTOR_EASY;
  }

  maxReveals = Math.round(numberOfCards / factor);
  revealMaxElement.textContent = maxReveals;
}

// --- Card click and match logic ---

function handleCardClick(event) {
  const card = event.currentTarget;

  if (!isMultiplayer && !timerStarted) startTimer();

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length === 2
  ) {
    return;
  }

  card.classList.add("flipped");

  if (currentDifficulty === "croatian" && card.dataset.sound) {
    playCardSound(card.dataset.sound);
  }

  if (isMultiplayer) {
    const current = currentPlayer === 1 ? player1 : player2;
    current.reveals++;
    updatePlayerPanels();
  } else {
    incrementRevealCount();
  }

  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;
  const id1 = card1.dataset.cardId;
  const id2 = card2.dataset.cardId;

  const isCroatian = currentDifficulty === "croatian";
  const matchDelay = isCroatian ? CROATIAN_MATCH_DELAY : MATCH_DELAY;
  const flipBackDelay = isCroatian ? CROATIAN_FLIP_BACK_DELAY : FLIP_BACK_DELAY;

  if (id1 === id2) {
    setTimeout(() => {
      stopAllCardSounds();
      card1.classList.add("matched");
      card2.classList.add("matched");
      flippedCards = [];

      if (isMultiplayer) {
        const current = currentPlayer === 1 ? player1 : player2;
        current.matched++;
        matchedPairs++;
        updatePlayerPanels();
        checkWinCondition();
      } else {
        matchedPairs++;
        checkWinCondition();
      }
    }, matchDelay);
  } else {
    setTimeout(() => {
      stopAllCardSounds();
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];

      if (isMultiplayer) {
        switchTurn();
      }
    }, flipBackDelay);
  }

  if (!isMultiplayer) {
    checkFailureCondition();
  }
}

function checkWinCondition() {
  if (matchedPairs === originalCards.length) {
    if (isMultiplayer) {
      initMultiplayerVictoryScreen();
    } else {
      initVictoryScreen();
    }
  }
}

function checkFailureCondition() {
  if (revealCount >= maxReveals) {
    initFailureScreen();
  }
}

// --- Endgame screens ---

function doEndgameCleanup() {
  stopTimer();
  stopAllCardSounds();
  cardsGridElement.style.display = "none";
  restartContainerElement.style.display = "none";
  turnIndicatorElement.style.display = "none";
  playerPanelsRowElement.classList.remove("active");
  player1PanelElement.style.display = "none";
  player2PanelElement.style.display = "none";
  while (cardsGridElement.firstChild) {
    cardsGridElement.removeChild(cardsGridElement.firstChild);
  }
}

function initVictoryScreen() {
  doEndgameCleanup();
  victoryTitleElement.textContent = "You won!";
  victorySubtitleElement.textContent = "Congratulations!";
  saveResultFormElement.style.display = "flex";
  victoryScreenElement.style.display = "flex";
  failureScreenElement.style.display = "none";

  saveNameInputElement.value = "";
  saveResultMessageElement.textContent = "";
  saveResultFormElement.querySelector(".save-result-row").style.display = "flex";

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ffff00", "#ff0000", "#00ff00", "#0000ff"],
  });
}

function initMultiplayerVictoryScreen() {
  doEndgameCleanup();

  let title, subtitle;
  if (player1.matched > player2.matched) {
    title = `${player1.name} wins!`;
    subtitle = `${player1.matched} - ${player2.matched}`;
  } else if (player2.matched > player1.matched) {
    title = `${player2.name} wins!`;
    subtitle = `${player2.matched} - ${player1.matched}`;
  } else {
    title = "It's a tie!";
    subtitle = `${player1.matched} - ${player2.matched}`;
  }

  victoryTitleElement.textContent = title;
  victorySubtitleElement.textContent = subtitle;
  saveResultFormElement.style.display = "none";
  victoryScreenElement.style.display = "flex";
  failureScreenElement.style.display = "none";

  saveBattle();

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

// --- Dragon / Chinese theme ---

function createDragonElement() {
  const leftDragon = document.createElement("div");
  leftDragon.className = "dragon-side dragon-left";
  leftDragon.id = "dragonLeft";
  const leftImg = document.createElement("img");
  leftImg.src = "./dragon.png";
  leftImg.alt = "Golden Dragon Left";
  leftDragon.appendChild(leftImg);
  document.body.appendChild(leftDragon);

  const rightDragon = document.createElement("div");
  rightDragon.className = "dragon-side dragon-right";
  rightDragon.id = "dragonRight";
  const rightImg = document.createElement("img");
  rightImg.src = "./dragon.png";
  rightImg.alt = "Golden Dragon Right";
  rightDragon.appendChild(rightImg);
  document.body.appendChild(rightDragon);
}

function removeDragonElement() {
  const left = document.getElementById("dragonLeft");
  if (left) left.remove();
  const right = document.getElementById("dragonRight");
  if (right) right.remove();
}

function applyChineseTheme() {
  document.body.classList.add("chinese-theme");
  removeDragonElement();
  createDragonElement();
}

function removeChineseTheme() {
  document.body.classList.remove("chinese-theme");
  removeDragonElement();
}

// --- Hall of Fame ---

async function fetchHallOfFame() {
  try {
    const response = await fetch("/hall-of-fame");
    const data = await response.json();
    renderHallOfFame(data);
  } catch (error) {
    hallOfFameEmptyElement.textContent = "Could not load records.";
    hallOfFameEmptyElement.style.display = "block";
    hallOfFameTableElement.style.display = "none";
  }
}

function renderHallOfFame(records) {
  while (hallOfFameBodyElement.firstChild) {
    hallOfFameBodyElement.removeChild(hallOfFameBodyElement.firstChild);
  }

  if (records.length === 0) {
    hallOfFameEmptyElement.style.display = "block";
    hallOfFameTableElement.style.display = "none";
    return;
  }

  hallOfFameEmptyElement.style.display = "none";
  hallOfFameTableElement.style.display = "table";

  const TOP_EMOJIS = ["🥇", "🥈", "🥉"];

  records.forEach((record, index) => {
    const row = document.createElement("tr");
    const positionEmoji = index < 3 ? ` ${TOP_EMOJIS[index]}` : "";
    const ultraHardEmoji = record.difficulty === "ultrahard" ? " 🏅" : "";
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${record.name}${positionEmoji}${ultraHardEmoji}</td>
      <td>${record.difficulty}</td>
      <td>${formatTime(record.time_seconds)}</td>
      <td>${record.reveals}</td>`;
    hallOfFameBodyElement.appendChild(row);
  });
}

// --- Battle Champions Arena ---

async function fetchBattles() {
  try {
    const response = await fetch("/battles");
    const data = await response.json();
    renderBattles(data);
  } catch (error) {
    battleArenaEmptyElement.textContent = "Could not load battles.";
    battleArenaEmptyElement.style.display = "block";
    battleArenaTableElement.style.display = "none";
  }
}

function renderBattles(records) {
  while (battleArenaBodyElement.firstChild) {
    battleArenaBodyElement.removeChild(battleArenaBodyElement.firstChild);
  }

  if (records.length === 0) {
    battleArenaEmptyElement.style.display = "block";
    battleArenaTableElement.style.display = "none";
    return;
  }

  battleArenaEmptyElement.style.display = "none";
  battleArenaTableElement.style.display = "table";

  records.forEach((record, index) => {
    const row = document.createElement("tr");
    const BATTLE_EMOJIS = ["🥇", "🥈", "🥉"];
    const emoji = index < 3 ? ` ${BATTLE_EMOJIS[index]}` : "";
    const winnerDisplay = record.winner === "Tie" ? "Tie" : `${record.winner}${emoji}`;
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${record.player1} vs ${record.player2}</td>
      <td>${record.player1_score} - ${record.player2_score}</td>
      <td>${winnerDisplay}</td>
      <td>${record.difficulty}</td>`;
    battleArenaBodyElement.appendChild(row);
  });
}

async function saveBattle() {
  const winner =
    player1.matched > player2.matched
      ? player1.name
      : player2.matched > player1.matched
        ? player2.name
        : "Tie";

  try {
    await fetch("/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player1: player1.name,
        player2: player2.name,
        player1_score: player1.matched,
        player2_score: player2.matched,
        winner,
        difficulty: currentDifficulty,
      }),
    });
  } catch (error) {
    // silent fail
  }
}

async function saveResult() {
  const name = saveNameInputElement.value.trim();
  if (!name) {
    saveResultMessageElement.textContent = "Please enter your name.";
    return;
  }

  try {
    const response = await fetch("/hall-of-fame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        difficulty: currentDifficulty,
        time_seconds: seconds,
        reveals: revealCount,
      }),
    });

    if (response.ok) {
      saveResultMessageElement.textContent = "Result saved!";
      saveResultFormElement.querySelector(".save-result-row").style.display = "none";
    } else {
      saveResultMessageElement.textContent = "Failed to save. Try again.";
    }
  } catch (error) {
    saveResultMessageElement.textContent = "Failed to save. Try again.";
  }
}

// --- Screen initialization ---

function initStartScreen() {
  removeChineseTheme();
  document.body.classList.remove("croatian-theme");
  stopAllCardSounds();
  selectedMode = null;
  selectedDifficulty = null;

  // Reset selection highlights
  document.getElementById("btnSingle").classList.remove("selected");
  document.getElementById("btnMulti").classList.remove("selected");
  document.getElementById("btnEasy").classList.remove("selected");
  document.getElementById("btnMedium").classList.remove("selected");
  document.getElementById("btnHard").classList.remove("selected");
  document.getElementById("btnUltraHard").classList.remove("selected");
  document.getElementById("btnCroatian").classList.remove("selected");
  multiplayerNamesElement.style.display = "none";
  mp1NameInputElement.value = "";
  mp2NameInputElement.value = "";

  // Hide everything except start screen and hall of fame
  singleHeaderElement.style.display = "none";
  victoryScreenElement.style.display = "none";
  failureScreenElement.style.display = "none";
  cardsGridElement.style.display = "none";
  restartContainerElement.style.display = "none";
  turnIndicatorElement.style.display = "none";
  playerPanelsRowElement.classList.remove("active");
  player1PanelElement.style.display = "none";
  player2PanelElement.style.display = "none";

  startScreenElement.style.display = "block";
  hallOfFameElement.style.display = "flex";
  battleArenaElement.style.display = "flex";
  fetchHallOfFame();
  fetchBattles();
}

async function initGame(difficulty = "easy") {
  currentDifficulty = difficulty;
  flippedCards = [];
  matchedPairs = 0;
  revealCount = 0;
  seconds = 0;
  timerStarted = false;

  clearInterval(timerInterval);

  if (currentDifficulty === "ultrahard") {
    applyChineseTheme();
  } else {
    removeChineseTheme();
  }

  if (currentDifficulty === "croatian") {
    document.body.classList.add("croatian-theme");
  } else {
    document.body.classList.remove("croatian-theme");
  }

  // Hide start/end screens
  startScreenElement.style.display = "none";
  hallOfFameElement.style.display = "none";
  battleArenaElement.style.display = "none";
  victoryScreenElement.style.display = "none";
  failureScreenElement.style.display = "none";

  // Show cards and restart
  cardsGridElement.style.display = "grid";
  restartContainerElement.style.display = "flex";

  if (isMultiplayer) {
    // Multiplayer UI
    singleHeaderElement.style.display = "none";
    player1PanelNameElement.textContent = player1.name;
    player2PanelNameElement.textContent = player2.name;
    playerPanelsRowElement.classList.add("active");
    player1PanelElement.style.display = "block";
    player2PanelElement.style.display = "block";
    turnIndicatorElement.style.display = "block";
    updatePlayerPanels();
    updateTurnIndicator();
  } else {
    // Singleplayer UI
    singleHeaderElement.style.display = "flex";
    playerPanelsRowElement.classList.remove("active");
    player1PanelElement.style.display = "none";
    player2PanelElement.style.display = "none";
    turnIndicatorElement.style.display = "none";
    timerElement.textContent = formatTime(0);
    revealCountElement.textContent = "0";
  }

  if (currentDifficulty === "croatian") {
    originalCards = CROATIAN_SOUNDS;
  } else {
    originalCards = await getCards();
  }
  cards = shuffleCards(createCardPairs(originalCards));
  renderCards(cards);

  if (!isMultiplayer) {
    setMaxReveals();
  }
}

const showCroatian = new URLSearchParams(window.location.search).get("show-croatian") === "true";
if (!showCroatian) {
  document.getElementById("btnCroatian").style.display = "none";
}

initStartScreen();
