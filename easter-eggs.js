// ==========================================
// EASTER EGGS SCRIPT FOR BOB COMICS WEBSITE
// ==========================================

// ==========================================
// 1. COOKIE CURSOR TRAIL EASTER EGG
// ==========================================
(function() {
  let clickCount = 0;
  let trailActive = false;
  const navBrand = document.querySelector('.nav-brand');
  
  if (navBrand) {
    navBrand.addEventListener('click', function() {
      clickCount++;
      
      // Activate cookie trail after 3 clicks
      if (clickCount === 3 && !trailActive) {
        trailActive = true;
        activateCookieTrail();
        
        // Visual feedback that easter egg is activated
        navBrand.style.animation = 'pulse 0.5s';
        setTimeout(() => {
          navBrand.style.animation = '';
        }, 500);
      }
    });
  }
  
  function activateCookieTrail() {
    let lastX = 0;
    let lastY = 0;
    let throttleTimer;
    
    // Add CSS for cookie animation
    if (!document.getElementById('cookie-trail-style')) {
      const style = document.createElement('style');
      style.id = 'cookie-trail-style';
      style.textContent = `
        .cookie-trail {
          position: fixed;
          pointer-events: none;
          font-size: 1.5rem;
          z-index: 9999;
          animation: cookieFade 1s ease-out forwards;
        }
        
        @keyframes cookieFade {
          0% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Mouse move handler with throttling for performance
    // Note: Event listener persists for the entire session as this is intentional behavior for the easter egg
    document.addEventListener('mousemove', function(e) {
      // Throttle to create trail effect without too many cookies
      const now = Date.now();
      if (throttleTimer && now - throttleTimer < 50) return;
      throttleTimer = now;
      
      // Only create cookie if mouse moved significantly
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 20) {
        createCookie(e.clientX, e.clientY);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
    
    // Touch support for mobile
    document.addEventListener('touchmove', function(e) {
      const touch = e.touches[0];
      const now = Date.now();
      if (throttleTimer && now - throttleTimer < 50) return;
      throttleTimer = now;
      
      const dx = touch.clientX - lastX;
      const dy = touch.clientY - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 20) {
        createCookie(touch.clientX, touch.clientY);
        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    });
  }
  
  function createCookie(x, y) {
    const cookie = document.createElement('div');
    cookie.className = 'cookie-trail';
    cookie.textContent = '🍪';
    cookie.style.left = (x - 12) + 'px';
    cookie.style.top = (y - 12) + 'px';
    document.body.appendChild(cookie);
    
    // Remove cookie after animation completes
    setTimeout(() => {
      cookie.remove();
    }, 1000);
  }
})();

// ==========================================
// 2. TACO CLICKING GAME EASTER EGG
// ==========================================
(function() {
  // Game constants
  const WINNING_SCORE = 20;
  const GAME_DURATION = 30; // seconds
  
  // Game state
  let gameActive = false;
  let score = 0;
  let gameTime = GAME_DURATION;
  let timeRemaining = gameTime;
  let gameInterval;
  let spawnInterval;
  let clickableTacos = [];
  let gameButton;
  
  // Add game CSS
  const gameStyle = document.createElement('style');
  gameStyle.id = 'taco-game-style';
  gameStyle.textContent = `
    .taco-game-button {
      position: fixed;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #F5A623 0%, #ff6b35 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 50px;
      font-family: 'Poppins', sans-serif;
      font-size: 1.3rem;
      font-weight: 600;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 6px 20px rgba(245, 166, 35, 0.4);
      transition: all 0.3s ease;
      animation: buttonPulse 2s ease-in-out infinite;
    }
    
    .taco-game-button:hover {
      transform: translateX(-50%) scale(1.05);
      box-shadow: 0 8px 25px rgba(245, 166, 35, 0.6);
    }
    
    .taco-game-button:active {
      transform: translateX(-50%) scale(0.98);
    }
    
    @keyframes buttonPulse {
      0%, 100% {
        box-shadow: 0 6px 20px rgba(245, 166, 35, 0.4);
      }
      50% {
        box-shadow: 0 6px 30px rgba(245, 166, 35, 0.7);
      }
    }
    
    .game-taco {
      position: fixed;
      font-size: 2.5rem;
      cursor: pointer;
      user-select: none;
      z-index: 10000;
      animation: tacoFall 3s linear forwards;
      transition: transform 0.1s;
    }
    
    .game-taco:hover {
      transform: scale(1.2);
    }
    
    .game-taco:active {
      transform: scale(0.9);
    }
    
    @keyframes tacoFall {
      from {
        top: -60px;
        transform: rotate(0deg);
      }
      to {
        top: 100vh;
        transform: rotate(360deg);
      }
    }
    
    .taco-score-display {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      padding: 15px 25px;
      border-radius: 15px;
      font-family: 'Poppins', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      z-index: 10001;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      border: 3px solid #ff6b35;
    }
    
    .taco-score-display .score {
      color: #ff6b35;
      font-size: 1.5rem;
    }
    
    .taco-score-display .timer {
      font-size: 1rem;
      color: #666;
      margin-top: 5px;
    }
    
    .taco-game-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10002;
      animation: fadeIn 0.3s ease-out;
    }
    
    .taco-game-modal-content {
      background: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    }
    
    .taco-game-modal-content h2 {
      margin: 0 0 20px 0;
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      color: #333;
    }
    
    .taco-game-modal-content p {
      margin: 0 0 30px 0;
      font-family: 'Poppins', sans-serif;
      font-size: 1.2rem;
      color: #666;
    }
    
    .taco-game-modal-button {
      background: #ff6b35;
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .taco-game-modal-button:hover {
      background: #ff5722;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      .taco-game-button {
        top: 80px;
        padding: 12px 24px;
        font-size: 1.1rem;
      }
      
      .taco-score-display {
        top: 10px;
        right: 10px;
        padding: 10px 15px;
        font-size: 1rem;
      }
      
      .game-taco {
        font-size: 2rem;
      }
      
      .taco-game-modal-content {
        padding: 30px 20px;
      }
      
      .taco-game-modal-content h2 {
        font-size: 1.5rem;
      }
      
      .taco-game-modal-content p {
        font-size: 1rem;
      }
    }
  `;
  document.head.appendChild(gameStyle);
  
  // Create and add the game button when DOM is ready
  function createGameButton() {
    gameButton = document.createElement('button');
    gameButton.className = 'taco-game-button';
    gameButton.innerHTML = '🌮 Play Taco Game!';
    gameButton.setAttribute('aria-label', 'Start Taco Clicking Game');
    gameButton.onclick = startGame;
    document.body.appendChild(gameButton);
  }
  
  // Initialize button when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGameButton);
  } else {
    createGameButton();
  }
  
  function startGame() {
    // Hide the game button
    if (gameButton) {
      gameButton.style.display = 'none';
    }
    
    gameActive = true;
    score = 0;
    timeRemaining = gameTime;
    clickableTacos = [];
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'taco-score-display';
    scoreDisplay.innerHTML = `
      <div>Tacos: <span class="score">${score}</span>/${WINNING_SCORE}</div>
      <div class="timer">Time: ${timeRemaining}s</div>
    `;
    document.body.appendChild(scoreDisplay);
    
    // Update timer every second
    gameInterval = setInterval(() => {
      timeRemaining--;
      const timerElement = scoreDisplay.querySelector('.timer');
      if (timerElement) {
        timerElement.textContent = `Time: ${timeRemaining}s`;
      }
      
      if (timeRemaining <= 0) {
        endGame();
      }
    }, 1000);
    
    // Spawn tacos every 500ms
    spawnInterval = setInterval(spawnTaco, 500);
  }
  
  function spawnTaco() {
    if (!gameActive) return;
    
    const taco = document.createElement('div');
    taco.className = 'game-taco';
    taco.textContent = '🌮';
    taco.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    taco.style.top = '-60px';
    
    // Click handler
    taco.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (gameActive) {
        collectTaco(taco);
      }
    });
    
    // Touch handler for mobile
    taco.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (gameActive) {
        collectTaco(taco);
      }
    });
    
    // Remove taco when animation ends
    taco.addEventListener('animationend', () => {
      taco.remove();
      const index = clickableTacos.indexOf(taco);
      if (index > -1) {
        clickableTacos.splice(index, 1);
      }
    });
    
    document.body.appendChild(taco);
    clickableTacos.push(taco);
  }
  
  function collectTaco(taco) {
    score++;
    
    // Visual feedback
    taco.style.animation = 'none';
    taco.style.transform = 'scale(1.5)';
    taco.style.opacity = '0';
    
    // Update score display
    const scoreElement = document.querySelector('.taco-score-display .score');
    if (scoreElement) {
      scoreElement.textContent = score;
      // Pulse animation on score increase
      scoreElement.style.animation = 'pulse 0.3s';
      setTimeout(() => {
        scoreElement.style.animation = '';
      }, 300);
    }
    
    // Remove taco
    setTimeout(() => {
      taco.remove();
      const index = clickableTacos.indexOf(taco);
      if (index > -1) {
        clickableTacos.splice(index, 1);
      }
    }, 200);
  }
  
  function endGame() {
    gameActive = false;
    
    // Clear intervals
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    
    // Remove all remaining tacos
    clickableTacos.forEach(taco => {
      taco.remove();
    });
    clickableTacos = [];
    
    // Remove score display
    const scoreDisplay = document.querySelector('.taco-score-display');
    if (scoreDisplay) {
      scoreDisplay.remove();
    }
    
    // Show results with accessible modal instead of alert
    setTimeout(() => {
      showGameResultModal(score);
    }, 500);
  }
  
  function resetGameButton() {
    // Show the game button again
    if (gameButton) {
      gameButton.style.display = 'block';
    }
  }
  
  function showGameResultModal(finalScore) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'taco-game-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'game-result-title');
    modal.setAttribute('aria-describedby', 'game-result-description');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'taco-game-modal-content';
    
    const title = document.createElement('h2');
    title.id = 'game-result-title';
    
    const description = document.createElement('p');
    description.id = 'game-result-description';
    
    if (finalScore >= WINNING_SCORE) {
      title.textContent = '🥇 You Won!';
      description.textContent = `You collected ${finalScore} tacos!`;
    } else {
      title.textContent = 'Better luck next time!';
      description.textContent = `You collected ${finalScore}/${WINNING_SCORE} tacos.`;
    }
    
    const button = document.createElement('button');
    button.className = 'taco-game-modal-button';
    button.textContent = 'Close';
    button.setAttribute('aria-label', 'Close game results');
    button.onclick = () => {
      modal.remove();
      resetGameButton();
    };
    
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(button);
    modal.appendChild(modalContent);
    
    // Close modal on background click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        resetGameButton();
      }
    };
    
    // Close modal on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        resetGameButton();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
    
    document.body.appendChild(modal);
    
    // Focus on the close button for accessibility
    button.focus();
  }
})();
