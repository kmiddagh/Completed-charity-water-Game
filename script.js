// === Game State Variables ===
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropMaker;
let timer;
let streak = 0; // Track correct clicks in a row


// === DOM Elements ===
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const messageDisplay = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const pauseBtn = document.getElementById("pause-btn");
const toast = document.getElementById("toast");
const audioToggle = document.getElementById("audio-toggle");


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


// === Difficulty Settings ===
const DIFFICULTY = {
  Easy:   { spawnMs: 900,  fallSec: [3.5, 5.0], badChance: 0.15, target: 15,  blue: +1, red: -1 },
  Normal: { spawnMs: 750,  fallSec: [3.0, 4.5], badChance: 0.20, target: 20,  blue: +1, red: -2 },
  Hard:   { spawnMs: 550,  fallSec: [2.4, 3.6], badChance: 0.30, target: 28,  blue: +1, red: -3 }
};

let selectedDifficulty = DIFFICULTY.Normal; // Default difficulty
const difficultySelect = document.getElementById("difficulty");
const difficultyHelper = document.getElementById("difficulty-helper");

// Set initial helper text
difficultyHelper.textContent = `Goal: ${selectedDifficulty.target} points`;

difficultySelect.addEventListener("change", () => {
  selectedDifficulty = DIFFICULTY[difficultySelect.value];
  difficultyHelper.textContent = `Goal: ${selectedDifficulty.target} points`;
});


// === Milestones ===
const MILESTONES = [
  { score: 10, msg: "Halfway there! 💧" },
  { score: 20, msg: "Amazing flow! 🌊" },
  { score: 30, msg: "Water champion! 🚰" }
];

let triggeredMilestones = new Set(); // Track triggered milestones


// === Event Listeners ===
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", togglePause);


// === Helper to format time as seconds with "s" suffix ===
function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${seconds}s`;
}


// === Start Game Function ===
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  timeLeft = 30; // Preserve 30s round length
  scoreDisplay.textContent = score;
  timeDisplay.textContent = formatTime(timeLeft);
  messageDisplay.textContent = "";
  startBtn.disabled = true;

  dropMaker = setInterval(createDrop, selectedDifficulty.spawnMs);
  timer = setInterval(updateTimer, 1000);
}


// === Toggle Pause/Resume ===
let gamePaused = false; // Track pause state

function togglePause() {
  if (!gameRunning) return;

  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "Resume" : "Pause";

  if (gamePaused) {
    clearInterval(dropMaker);
    clearInterval(timer);
    gameContainer.classList.add("paused");
  } else {
    dropMaker = setInterval(createDrop, selectedDifficulty.spawnMs);
    timer = setInterval(updateTimer, 1000);
    gameContainer.classList.remove("paused");
  }
}


// === Create Water Drop ===
function createDrop() {
  const drop = document.createElement("div");
  const isBad = Math.random() < selectedDifficulty.badChance;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  const size = 40 + Math.random() * 30;
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  const xPosition = Math.random() * (gameContainer.offsetWidth - size);
  drop.style.left = `${xPosition}px`;

  const [minFall, maxFall] = selectedDifficulty.fallSec;
  drop.style.animationDuration = `${minFall + Math.random() * (maxFall - minFall)}s`;

  gameContainer.appendChild(drop);

  const handleInteraction = (event) => {
    if (!gameRunning || gamePaused) return;

    drop.remove(); // Remove the drop immediately on interaction
    handleDropClick(event, isBad);
  };

  drop.addEventListener("click", handleInteraction);
  drop.addEventListener("pointerdown", handleInteraction); // Touch support

  drop.addEventListener("animationend", () => drop.remove());
}

let soundEnabled = true;

audioToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  audioToggle.textContent = soundEnabled ? "🔊 Sound: On" : "🔇 Sound: Off";
});

function playSound(src) {
  if (soundEnabled) {
    const audio = new Audio(src);
    audio.play();
  }
}

function handleDropClick(event, isBad) {
  const value = isBad ? selectedDifficulty.red : selectedDifficulty.blue;
  score = Math.max(0, score + value);

  // Update score display and animate pulse
  scoreDisplay.textContent = score;
  scoreDisplay.classList.remove("score-pulse");
  // trigger reflow to restart animation
  void scoreDisplay.offsetWidth;
  scoreDisplay.classList.add("score-pulse");

  // Display the value in the top-right corner of the playing area, slightly offset
  const effect = document.createElement("div");
  effect.className = `click-fx ${value > 0 ? "good" : "bad"}`;
  effect.textContent = value > 0 ? `+${value}` : `${value}`;
  effect.style.position = "absolute";
  effect.style.right = "15px"; // Moved left by increasing right offset
  effect.style.top = "15px";   // Moved down by increasing top offset
  effect.style.zIndex = "10";

  gameContainer.appendChild(effect); // Append to game container
  setTimeout(() => effect.remove(), 1000);

  // Remove the drop immediately on interaction
  event.target.remove();

  // Handle streak logic
  if (!isBad) {
    streak++;
    if (streak >= 3) {
      scoreDisplay.classList.add("streak-glow");
    }
  } else {
    streak = 0;
    scoreDisplay.classList.remove("streak-glow");
  }

  // Play sound
  playSound(isBad ? "lose.mp3" : "click.mp3");

  // Check for milestones
  checkMilestones();
}

function showClickEffect(x, y, value) {
  const effect = document.createElement("div");
  effect.className = `click-fx ${value > 0 ? "good" : "bad"}`;
  effect.textContent = value > 0 ? `+${value}` : `${value}`;

  // Position the effect directly at the click location
  effect.style.position = "absolute";
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  effect.style.transform = "translate(-50%, -50%)"; // Center the effect

  // Append the effect to the game container
  gameContainer.appendChild(effect);

  setTimeout(() => effect.remove(), 1000);
}

function checkMilestones() {
  MILESTONES.forEach((milestone) => {
    if (score >= milestone.score && !triggeredMilestones.has(milestone.score)) {
      triggeredMilestones.add(milestone.score);
      showMilestoneMessage(milestone.msg);
    }
  });
}

function showMilestoneMessage(message) {
  const toastMessage = document.createElement("div");
  toastMessage.className = "milestone-toast";
  toastMessage.textContent = message;

  gameContainer.appendChild(toastMessage);
  toast.textContent = message; // Update hidden aria-live region for screen readers

  setTimeout(() => {
    toastMessage.remove();
    toast.textContent = ""; // Clear aria-live region
  }, 2000);
}

function showComboIndicator(x, y, value) {
  const indicator = document.createElement("div");
  indicator.className = "combo-indicator";
  indicator.textContent = value > 0 ? `+${value}` : `${value}`;
  if (value < 0) indicator.classList.add("bad");

  indicator.style.left = `${x}px`;
  indicator.style.top = `${y}px`;

  document.body.appendChild(indicator);

  setTimeout(() => indicator.remove(), 1000);
}


// === Timer Update ===
function updateTimer() {
  timeLeft--;
  timeDisplay.textContent = formatTime(timeLeft);

  // Add a visual warning class for low time
  if (timeLeft <= 10 && timeLeft > 0) {
    timeDisplay.classList.add("time-warning");
  } else {
    timeDisplay.classList.remove("time-warning");
  }

  if (timeLeft === 10 || timeLeft === 5) {
    showTimerWarning(timeLeft);
  }

  if (timeLeft <= 0) {
    endGame();
  }
}

function showTimerWarning(seconds) {
  const warning = document.createElement("div");
  warning.className = "timer-warning";
  warning.textContent = `Hurry up! Only ${seconds}s left!`;

  gameContainer.appendChild(warning);

  setTimeout(() => warning.remove(), 1000);
}


// === End Game Function ===
function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timer);
  startBtn.disabled = false;
  gameContainer.innerHTML = "";

  if (score >= selectedDifficulty.target) {
    const msg = winMessages[Math.floor(Math.random() * winMessages.length)];
    messageDisplay.textContent = `${msg} (Target: ${selectedDifficulty.target})`;
    celebrate();
    playSound("win.mp3");
  } else {
    const msg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    messageDisplay.textContent = `${msg} (Target: ${selectedDifficulty.target})`;
    playSound("lose.mp3");
  }
}


// === Reset Game Function ===
function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timer);
  gameRunning = false;
  score = 0;
  timeLeft = 30;
  triggeredMilestones.clear(); // Reset milestones
  scoreDisplay.textContent = score;
  timeDisplay.textContent = formatTime(timeLeft);
  gameContainer.innerHTML = "";
  messageDisplay.textContent = "";
  startBtn.disabled = false;
}


// === Confetti Celebration ===
function celebrate() {
  // Confetti library may not be available in some environments; guard the call
  if (typeof confetti === "function") {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  } else {
    // fallback: simple visual cue - pulse the score display
    scoreDisplay.classList.add("score-pulse");
    setTimeout(() => scoreDisplay.classList.remove("score-pulse"), 800);
  }
}
