/**
 * Daily Poll Feature for Bob Comics
 *
 * - Selects a question based on the day of the year (1-365)
 * - Tracks which question numbers have been shown (no repeats within a year)
 * - Prevents users from voting more than once per question via localStorage
 * - Stores vote counts in localStorage (simulating qanswers.txt client-side)
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Returns the day-of-year (1–365/366) for a given Date (defaults to today).
   *  Uses UTC-based arithmetic to avoid DST skew.
   */
  function getDayOfYear(date) {
    var d = date || new Date();
    var startOfYear = Date.UTC(d.getFullYear(), 0, 1);
    var today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Picks a question number for today.
   * Persists a day→questionNumber mapping so the same question is shown all day.
   * Tracks used question numbers so no number repeats within a year.
   */
  function getTodaysQuestionNumber() {
    var today = new Date();
    var year = today.getFullYear();
    var dayOfYear = getDayOfYear(today);

    // Persistent mapping: { "dayOfYear": questionNum, ... }
    var mappingKey = 'pollDayMapping_' + year;
    var dayMapping = JSON.parse(localStorage.getItem(mappingKey) || '{}');

    // If we already assigned a question for today, return it
    if (dayMapping[dayOfYear] !== undefined) {
      return dayMapping[dayOfYear];
    }

    // Gather already-used question numbers (one per day so far this year)
    var usedNumbers = Object.values(dayMapping).map(Number);

    // Start from a day-based candidate to spread questions across the year.
    // Clamp to 1-365 to handle leap years (day 366 wraps to question 1 range).
    var candidate = ((Math.min(dayOfYear, 365) - 1) % 365) + 1;

    // Find the next unused number if the candidate is already taken
    for (var offset = 0; offset < 365; offset++) {
      var tryNum = ((candidate - 1 + offset) % 365) + 1;
      if (usedNumbers.indexOf(tryNum) === -1) {
        candidate = tryNum;
        break;
      }
    }

    // Persist this day's assignment
    dayMapping[dayOfYear] = candidate;
    localStorage.setItem(mappingKey, JSON.stringify(dayMapping));

    return candidate;
  }

  // ---------------------------------------------------------------------------
  // Firebase configuration & storage helpers (GitHub Pages Compatible)
  // ---------------------------------------------------------------------------

  // TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMOmdGYAObQaqDRpjHFteBe60nQD6iygA",
  authDomain: "poll-26ec4.firebaseapp.com",
  projectId: "poll-26ec4",
  storageBucket: "poll-26ec4.firebasestorage.app",
  messagingSenderId: "490514847465",
  appId: "1:490514847465:web:48532a16bca89b83534278",
  measurementId: "G-9Z97SYN65L"
};

  /** Returns the vote counts object for the given question number from Firebase. */
  async function getVoteCounts(questionNum) {
    try {
      const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/pollResults/${questionNum}.json`);
      const data = await response.json();
      return data || { 0: 0, 1: 0 };
    } catch (e) {
      console.error("Firebase fetch failed", e);
      return { 0: 0, 1: 0 };
    }
  }

  /** Increments the vote count for a specific option in Firebase. */
  async function recordVote(questionNum, optionIndex) {
    try {
      const currentCounts = await getVoteCounts(questionNum);
      const newCount = (currentCounts[optionIndex] || 0) + 1;
      
      await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/pollResults/${questionNum}/${optionIndex}.json`, {
        method: 'PUT',
        body: JSON.stringify(newCount)
      });
    } catch (e) {
      console.error("Firebase save failed", e);
    }
  }

  /** Returns the key used to check whether the user has already voted. */
  function hasVotedKey(questionNum) {
    return 'pollVoted_' + questionNum;
  }

  /** Returns true if the current user has already voted on this question. */
  function hasVoted(questionNum) {
    return localStorage.getItem(hasVotedKey(questionNum)) !== null;
  }

  /** Marks the question as voted for by this user. */
  function markVoted(questionNum) {
    localStorage.setItem(hasVotedKey(questionNum), '1');
  }

  // ---------------------------------------------------------------------------
  // UI & Logic
  // ---------------------------------------------------------------------------

  const QUESTIONS_URL = 'https://raw.githubusercontent.com/shreyansh-k/bobcomic/refs/heads/copilot/add-daily-poll-feature/questions.json';

  async function initPoll() {
    const questionNum = getTodaysQuestionNumber();
    const pollContainer = document.getElementById('poll-choices');
    const resultsDisplay = document.getElementById('results-display');
    const pollResults = document.getElementById('poll-results');
    const questionText = document.querySelector('.poll-section h2');

    if (!pollContainer || !resultsDisplay || !pollResults) return;

    try {
      const response = await fetch(QUESTIONS_URL);
      const questions = await response.json();
      const currentQuestion = questions[questionNum];

      if (!currentQuestion) return;

      questionText.innerText = `Poll: ${currentQuestion.question}`;
      pollContainer.innerHTML = '';
      
      currentQuestion.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary poll-option';
        btn.style.margin = '5px';
        btn.innerText = option;
        btn.onclick = async () => {
          if (hasVoted(questionNum)) {
            alert("You've already voted today!");
            return;
          }
          await recordVote(questionNum, index);
          markVoted(questionNum);
          renderResults(questionNum, currentQuestion.options);
        };
        pollContainer.appendChild(btn);
      });

      if (hasVoted(questionNum)) {
        renderResults(questionNum, currentQuestion.options);
      }
    } catch (e) {
      console.error("Error loading poll questions", e);
    }
  }

  async function renderResults(questionNum, options) {
    const pollContainer = document.getElementById('poll-choices');
    const resultsDisplay = document.getElementById('results-display');
    const pollResults = document.getElementById('poll-results');
    
    pollContainer.style.display = 'none';
    pollResults.style.display = 'block';
    resultsDisplay.innerHTML = 'Loading results...';

    const counts = await getVoteCounts(questionNum);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    resultsDisplay.innerHTML = '';
    options.forEach((option, index) => {
      const votes = counts[index] || 0;
      const percent = total === 0 ? 0 : Math.round((votes / total) * 100);
      
      const row = document.createElement('div');
      row.style.margin = '10px 0';
      row.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>${option}</span>
          <span>${percent}% (${votes})</span>
        </div>
        <div style="background: #333; height: 10px; border-radius: 5px; overflow: hidden;">
          <div style="background: #ff4757; width: ${percent}%; height: 100%; transition: width 0.5s ease;"></div>
        </div>
      `;
      resultsDisplay.appendChild(row);
    });
  }

  document.addEventListener('DOMContentLoaded', initPoll);
})();

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Builds the poll section and inserts it after the .hero element. */
  function renderPoll(questionData, questionNum) {
    var section = document.createElement('section');
    section.id = 'daily-poll';
    section.className = 'daily-poll';

    var title = document.createElement('div');
    title.className = 'poll-title';
    title.textContent = '🗳️ Daily Poll';

    var questionEl = document.createElement('p');
    questionEl.className = 'poll-question';
    questionEl.textContent = questionData.question;

    var buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'poll-options';

    questionData.options.forEach(function (optionText, index) {
      var btn = document.createElement('button');
      btn.className = 'poll-btn';
      btn.dataset.index = index;
      btn.textContent = optionText;
      btn.addEventListener('click', function () {
        onVote(questionNum, index, questionData, section);
      });
      buttonsDiv.appendChild(btn);
    });

    section.appendChild(title);
    section.appendChild(questionEl);
    section.appendChild(buttonsDiv);

    // If the user has already voted, show results immediately
    if (hasVoted(questionNum)) {
      showResults(section, questionData, questionNum, null);
    }

    // Insert after the .hero element
    var hero = document.querySelector('.hero');
    if (hero && hero.parentNode) {
      hero.parentNode.insertBefore(section, hero.nextSibling);
    } else {
      document.body.insertBefore(section, document.body.firstChild);
    }
  }

  /** Called when a user clicks a vote button. */
  function onVote(questionNum, optionIndex, questionData, section) {
    if (hasVoted(questionNum)) {
      return; // Safety guard: shouldn't be reachable from the UI
    }
    recordVote(questionNum, optionIndex);
    markVoted(questionNum);
    showResults(section, questionData, questionNum, optionIndex);
  }

  /** Replaces the option buttons with vote-count bars. */
  function showResults(section, questionData, questionNum, votedIndex) {
    var counts = getVoteCounts(questionNum);
    var total = questionData.options.reduce(function (sum, _, i) {
      return sum + (counts[i] || 0);
    }, 0);

    // Clear existing options area
    var existingOptions = section.querySelector('.poll-options');
    if (existingOptions) {
      existingOptions.remove();
    }

    var resultsDiv = document.createElement('div');
    resultsDiv.className = 'poll-results';

    if (total === 0) {
      var noVotes = document.createElement('p');
      noVotes.className = 'poll-no-votes';
      noVotes.textContent = 'No votes yet – be the first!';
      resultsDiv.appendChild(noVotes);
    } else {
      questionData.options.forEach(function (optionText, index) {
        var count = counts[index] || 0;
        var pct = Math.round((count / total) * 100);

        var row = document.createElement('div');
        row.className = 'poll-result-row' + (index === votedIndex ? ' poll-voted' : '');

        var label = document.createElement('span');
        label.className = 'poll-result-label';
        label.textContent = optionText + (index === votedIndex ? ' ✔' : '');

        var barWrap = document.createElement('div');
        barWrap.className = 'poll-bar-wrap';

        var bar = document.createElement('div');
        bar.className = 'poll-bar';
        bar.style.width = '0%';

        var pctLabel = document.createElement('span');
        pctLabel.className = 'poll-pct';
        pctLabel.textContent = pct + '%';

        barWrap.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barWrap);
        row.appendChild(pctLabel);
        resultsDiv.appendChild(row);

        // Animate bar fill
        setTimeout(function (b, p) { b.style.width = p + '%'; }, 50, bar, pct);
      });
    }

    var note = document.createElement('p');
    note.className = 'poll-voted-note';
    if (votedIndex === null) {
      note.textContent = 'You already voted on this question.';
    } else {
      note.textContent = 'Thanks for voting!';
    }

    resultsDiv.appendChild(note);
    section.appendChild(resultsDiv);
  }

  // ---------------------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------------------

  function init() {
    var questionNum = getTodaysQuestionNumber();

    fetch('questions.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load questions.json');
        return res.json();
      })
      .then(function (questions) {
        var questionData = questions[String(questionNum)];
        if (!questionData) {
          console.warn('Poll: No question found for number', questionNum);
          return;
        }
        renderPoll(questionData, questionNum);
      })
      .catch(function (err) {
        console.warn('Poll could not be loaded:', err);
      });
  }

  // Wait for the DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
