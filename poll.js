/**
 * Daily Poll Feature for Bob Comics
 *
 * - Selects a question based on the day of the year (1-365)
 * - Tracks which question numbers have been shown (no repeats within a year)
 * - Prevents users from voting more than once per question via localStorage
 * - Stores vote counts in localStorage
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
  // Firebase configuration & vote storage helpers
  // ---------------------------------------------------------------------------

  const firebaseConfig = {
    apiKey: "AIzaSyCMOmdGYAObQaqDRpjHFteBe60nQD6iygA",
    authDomain: "poll-26ec4.firebaseapp.com",
    projectId: "poll-26ec4",
    storageBucket: "poll-26ec4.firebasestorage.app",
    messagingSenderId: "490514847465",
    appId: "1:490514847465:web:48532a16bca89b83534278",
    measurementId: "G-9Z97SYN65L"
  };

  const DB_URL = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;

  /** Returns the vote counts object for the given question number from Firebase. */
  async function getVoteCounts(questionNum) {
    try {
      const response = await fetch(`${DB_URL}/pollResults/${questionNum}.json`);
      const data = await response.json();
      return data || {};
    } catch (e) {
      console.error("Firebase fetch failed", e);
      return {};
    }
  }

  /** Increments the vote count for a specific option in Firebase.
   *  Writes back all option counts for the question in one PUT to minimize writes.
   */
  async function recordVote(questionNum, optionName, allOptions) {
    try {
      const currentCounts = await getVoteCounts(questionNum);
      const newCounts = {};
      allOptions.forEach(opt => {
        newCounts[opt] = currentCounts[opt] || 0;
      });
      newCounts[optionName] += 1;
      await fetch(`${DB_URL}/pollResults/${questionNum}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCounts)
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

  const QUESTIONS_URL = 'https://raw.githubusercontent.com/shreyansh-k/bobcomic/main/questions.json';

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

      if (questionText) {
        questionText.innerText = `Poll: ${currentQuestion.question}`;
      }
      pollContainer.innerHTML = '';

      currentQuestion.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary poll-option';
        btn.style.margin = '5px';
        btn.innerText = option;
        btn.onclick = async () => {
          if (hasVoted(questionNum)) {
            alert("You've already voted today!");
            return;
          }
          await recordVote(questionNum, option, currentQuestion.options);
          markVoted(questionNum);
          await renderResults(questionNum, currentQuestion.options);
        };
        pollContainer.appendChild(btn);
      });

      if (hasVoted(questionNum)) {
        await renderResults(questionNum, currentQuestion.options);
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
    options.forEach((option) => {
      const votes = counts[option] || 0;
      const percent = total === 0 ? 0 : Math.min(100, Math.max(0, Math.round((votes / total) * 100)));

      const row = document.createElement('div');
      row.style.margin = '10px 0';

      const labelRow = document.createElement('div');
      labelRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 5px;';

      const optionLabel = document.createElement('span');
      optionLabel.textContent = option;

      const countLabel = document.createElement('span');
      countLabel.textContent = `${percent}% (${votes})`;

      labelRow.appendChild(optionLabel);
      labelRow.appendChild(countLabel);

      const barOuter = document.createElement('div');
      barOuter.style.cssText = 'background: #333; height: 10px; border-radius: 5px; overflow: hidden;';

      const barInner = document.createElement('div');
      barInner.style.cssText = `background: #ff4757; width: ${percent}%; height: 100%; transition: width 0.5s ease;`;

      barOuter.appendChild(barInner);
      row.appendChild(labelRow);
      row.appendChild(barOuter);
      resultsDisplay.appendChild(row);
    });
  }

  document.addEventListener('DOMContentLoaded', initPoll);
})();
