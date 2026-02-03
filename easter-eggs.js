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
  // Check if game has already been played in this session
  if (sessionStorage.getItem('tacoGamePlayed')) {
    return;
  }
  
  // Game state
  let gameActive = false;
  let score = 0;
  let gameTime = 30; // 30 seconds
  let timeRemaining = gameTime;
  let gameInterval;
  let spawnInterval;
  let clickableTacos = [];
  
  // Add game CSS
  const gameStyle = document.createElement('style');
  gameStyle.id = 'taco-game-style';
  gameStyle.textContent = `
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
    
    @media (max-width: 768px) {
      .taco-score-display {
        top: 10px;
        right: 10px;
        padding: 10px 15px;
        font-size: 1rem;
      }
      
      .game-taco {
        font-size: 2rem;
      }
    }
  `;
  document.head.appendChild(gameStyle);
  
  // Start the game automatically on first page load
  setTimeout(startGame, 1000); // Small delay to let page load
  
  function startGame() {
    gameActive = true;
    score = 0;
    timeRemaining = gameTime;
    clickableTacos = [];
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'taco-score-display';
    scoreDisplay.innerHTML = `
      <div>Score: <span class="score">${score}</span>/20</div>
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
    
    // Mark game as played in session
    sessionStorage.setItem('tacoGamePlayed', 'true');
    
    // Show results
    setTimeout(() => {
      if (score >= 20) {
        alert(`🥇 You Won! You collected ${score} tacos!`);
      } else {
        alert(`Better luck next time! You collected ${score}/20 tacos.`);
      }
    }, 500);
  }
})();
