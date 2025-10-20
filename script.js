
// === Game State Variables ===
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropMaker;
let timer;


// === DOM Elements ===
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const messageDisplay = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");


// === Game Messages ===
const winMessages = [
  "Amazing! You’re a true Water Hero!",
  "You helped bring clean water to many!",
  "Incredible! The world is better with you!"
];
const loseMessages = [
  "So close! Try again to help more people!",
  "Keep going! Every drop counts!",
  "Don’t give up! Clean water needs you!"
];


// === Event Listeners ===
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);


// === Start Game Function ===
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  messageDisplay.textContent = "";
  startBtn.disabled = true;

  dropMaker = setInterval(createDrop, 900);
  timer = setInterval(updateTimer, 1000);
}


// === Create Water Drop ===
function createDrop() {
  const drop = document.createElement("div");
  const isBad = Math.random() < 0.2; // 20% chance of bad drop
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  const size = 40 + Math.random() * 30;
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  const xPosition = Math.random() * (gameContainer.offsetWidth - size);
  drop.style.left = `${xPosition}px`;
  drop.style.animationDuration = `${3 + Math.random() * 2}s`;

  gameContainer.appendChild(drop);

  drop.addEventListener("click", () => {
    if (!gameRunning) return;
    if (isBad) {
      score = Math.max(0, score - 2);
    } else {
      score++;
    }
    scoreDisplay.textContent = score;
    drop.remove();
  });

  drop.addEventListener("animationend", () => drop.remove());
}


// === Timer Update ===
function updateTimer() {
  timeLeft--;
  timeDisplay.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}


// === End Game Function ===
function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timer);
  startBtn.disabled = false;
  gameContainer.innerHTML = "";

  if (score >= 20) {
    const msg = winMessages[Math.floor(Math.random() * winMessages.length)];
    messageDisplay.textContent = msg;
    celebrate();
  } else {
    const msg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    messageDisplay.textContent = msg;
  }
}


// === Reset Game Function ===
function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timer);
  gameRunning = false;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameContainer.innerHTML = "";
  messageDisplay.textContent = "";
  startBtn.disabled = false;
}


// === Confetti Celebration ===
function celebrate() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}
