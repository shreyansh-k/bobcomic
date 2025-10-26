// Initialize Firebase
const firebaseConfig = {
  // You'll need to replace these with your Firebase project details
  apiKey: "AIzaSyDKgqMN2YiswpsrAWawodhuLF27aoB3p64",
  authDomain: "meme-51314.firebaseapp.com",
  databaseURL: "https://meme-51314-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "meme-51314",
  storageBucket: "meme-51314.firebasestorage.app",
  messagingSenderId: "604768808089",
  appId: "1:604768808089:web:26134d5a0a0c92c6065c08"
};

// Initialize Firebase
let messagesRef;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();
    messagesRef = database.ref('messages');
    console.log("Firebase initialized successfully");

    // Test database connection
    messagesRef.once('value')
        .then(() => {
            console.log("Database connection successful");
        })
        .catch(error => {
            console.error("Database connection failed:", error);
            if (error.message.includes("permission_denied")) {
                alert("Database access denied. Please check Firebase rules.");
                console.log("To fix this, go to Firebase Console > Realtime Database > Rules and update the rules.");
            }
        });
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const gifBtn = document.getElementById("gifBtn");
const gifPanel = document.getElementById("gifPanel");
const gifSearch = document.getElementById("gifSearch");
const gifResults = document.getElementById("gifResults");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

// Get username when page loads
let username = localStorage.getItem('username');
if (!username) {
    username = prompt("Please enter your username:");
    localStorage.setItem('username', username);
}

// Load saved messages
const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
savedMessages.forEach(msg => {
    if (msg.type === 'text') {
        displayMessage(msg.username, msg.text);
    } else if (msg.type === 'gif') {
        displayGif(msg.username, msg.url);
    }
});

gifBtn.addEventListener("click", () => {
  console.log("GIF button clicked");
  gifPanel.style.display = gifPanel.style.display === "none" ? "block" : "none";
});

gifSearch.addEventListener("input", async () => {
  console.log("Searching for GIFs...");
  const query = gifSearch.value;
  const apiKey = "coVc1IHu97MvJb0pN3BzBXqN3uWiLLwA";
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=10`;

  const res = await fetch(url);
  const data = await res.json();

  gifResults.innerHTML = "";
  data.data.forEach(gif => {
    const img = document.createElement("img");
    img.src = gif.images.fixed_height.url;
    img.onclick = () => sendGIF(gif.images.fixed_height.url);
    gifResults.appendChild(img);
  });
});

function displayMessage(username, text, key) {
    const bubble = document.createElement("div");
    bubble.className = "message";
    if (key) bubble.setAttribute('data-key', key);

    const userSpan = document.createElement("span");
    userSpan.className = "username";
    userSpan.textContent = username;
    
    const textSpan = document.createElement("span");
    textSpan.className = "message-text";
    textSpan.textContent = text;

    bubble.appendChild(userSpan);
    bubble.appendChild(textSpan);
    chat.appendChild(bubble);
}

function displayGif(username, url, key) {
    const bubble = document.createElement("div");
    bubble.className = "message gif-message";
    if (key) bubble.setAttribute('data-key', key);

    const userSpan = document.createElement("span");
    userSpan.className = "username";
    userSpan.textContent = username;

    const img = document.createElement("img");
    img.src = url;
    img.alt = "GIF";
    img.style.maxWidth = "200px";
    img.style.borderRadius = "8px";

    bubble.appendChild(userSpan);
    bubble.appendChild(img);
    chat.appendChild(bubble);
}

function saveMessage(message) {
    // Save to Firebase
    messagesRef.push(message);
}

// Listen for new messages
messagesRef.on('child_added', (snapshot) => {
    const message = snapshot.val();
    const key = snapshot.key;
    
    if (message.type === 'text') {
        displayMessage(message.username, message.text, key);
    } else if (message.type === 'gif') {
        displayGif(message.username, message.url, key);
    }
    
    // Scroll to bottom
    chat.scrollTop = chat.scrollHeight;
});

function sendGIF(url) {
    console.log("Sending GIF:", url);
    const message = { type: 'gif', username, url };
    saveMessage(message);
    gifPanel.style.display = "none";
}

sendBtn.addEventListener("click", () => {
    console.log("Send button clicked");
    const text = messageInput.value.trim();
    if (text) {
        const message = { type: 'text', username, text };
        saveMessage(message);
        messageInput.value = "";
    }
});