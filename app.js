import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth).catch(console.error);

let currentRoom = null;
let playerName = null;

const words = [

  // 😎 North Indian Meme Energy
  "Tu jaanta hai mera baap kaun hai",
  "Bhai scene kya hai",
  "Kya kar raha hai life mein",
  "Jugaad lagao",
  "Bhai full tight scene",
  "Setting ho gayi kya",
  "OP banda",
  "Legend banda",
  "System hila denge",
  "Aukat yaad dila dena",
  "Bhai chill maar",
  "Bakchodi band kar",
  "Fadu plan",
  "Bhai tu rehne de",
  "Khatarnak aadmi",
  "Full toxic energy",
  "Overacting mat kar",
  "Emotional damage",
  "Kya mast life hai",
  "Dil se bura lagta hai",

  // 😂 Viral Hindi Memes
  "Rasode mein kaun tha",
  "Binod",
  "Moye Moye",
  "So beautiful so elegant",
  "JCB ki khudai",
  "Ye bik gayi hai gormint",
  "Chai pilo friends",
  "Pawri ho rahi hai",
  "Ayein?",
  "Kaccha badam",
  "Main nahi manta",
  "Ye sab doglapan hai",
  "Just looking like a wow",
  "System hang",
  "Bhai kya kar raha hai tu",
  "Internet pe sab fake hai",

  // 🎬 Bollywood Dialogues (Memeable)
  "Picture abhi baaki hai",
  "Mogambo khush hua",
  "All is well",
  "How’s the josh",
  "Don ko pakadna mushkil hai",
  "Pushpa naam sunke flower samjha kya",
  "Aata majhi satakli",
  "Main apni favourite hoon",
  "Bade bade deshon mein",
  "Tumse na ho payega",
  "Ye dosti hum nahi todenge",
  "Bhai mere pass maa hai",
  "Keh diya na bas keh diya",
  "Ek baar jo maine commitment kar di",
  "Control Uday Control",

  // 🏏 Cricket + Desi Commentary
  "Virat aggression",
  "Dhoni finisher",
  "Rohit pull shot",
  "Last over thriller",
  "Super over pressure",
  "Third umpire check",
  "Bumrah yorker",
  "IPL auction",
  "Commentator shouting",
  "Boundary line catch",
  "Gully cricket rule",
  "Bat leke bhaagna",

  // 🚇 Delhi / UP / North India Vibes
  "Delhi Metro rush",
  "Rajiv Chowk",
  "UP Police",
  "Noida traffic",
  "Coaching Kota",
  "IAS aspirant",
  "Hostel rooftop",
  "Shaadi baraat",
  "Nagin dance",
  "Band baja",
  "Family function drama",
  "Neighbour aunty gossip",
  "Paranthe wali gali",
  "Roadside chai",
  "Dhaba stop",

  // 🍲 Food but Real Desi Context
  "Rajma chawal Sunday",
  "Mummy ka paratha",
  "Chole bhature morning",
  "Gol gappa challenge",
  "Biryani war",
  "Maggi at 2AM",
  "Chai and sutta discussion",
  "Shaadi wala paneer",
  "Extra butter naan",
  "Street momos",
  "Lassi glass",
  "Jalebi garam",

  // 🧍 College / Friends
  "Backbencher squad",
  "Proxy attendance",
  "Viva panic",
  "Assignment copy",
  "Internal marks",
  "Lab partner",
  "Hostel mess food",
  "Farewell dance",
  "Freshers intro",
  "Crush in class",
  "Friendzone",
  "Group project sufferings",
  "Placement tension",

  // 📱 Internet Culture India
  "Reel banani hai",
  "Like share subscribe",
  "Comment section fight",
  "Influencer life",
  "Collab bro",
  "Viral reel",
  "Trending audio",
  "UPI failed",
  "Phone battery 1%",
  "Screenshot bhej",

  // 🎉 Wedding Chaos
  "Haldi ceremony",
  "Mehendi function",
  "DJ wale babu",
  "Dance floor slip",
  "Cousin squad",
  "Photographer bhaiya",
  "Shaadi ka khana",
  "Rishta meeting",

  // 🤣 Desi Funny Characters
  "Gym wala dost",
  "Motivational bhai",
  "Crypto expert uncle",
  "Free advice uncle",
  "Over smart cousin",
  "Silent killer friend",
  "Drama queen friend",
  "Late always friend",
  "Bina padhai topper",

  // 🔥 Meme-Style Phrases
  "Bhai OP",
  "Skill issue",
  "Mood off",
  "Vibe match",
  "Scene on hai",
  "Mission failed successfully",
  "Lag gaye",
  "Bhai sambhal",
  "Ye kya dekh liya",
  "Pure chaos",

  // 🧠 Extra Spicy (safe but roasty)
  "Dimag ka dahi",
  "Over confidence",
  "Drama mode on",
  "Full time philosopher",
  "Fake swag",
  "Attention seeker",
  "Self declared legend",
  "Energy high but output zero",

  // 🌍 Small International References
  "Cristiano Ronaldo",
  "Lionel Messi",
  "Mr Beast giveaway",
  "Netflix binge",
  "Elon Musk tweet",
  "Marvel fan",

  // Repeat style expansion blocks to reach 1000+
];
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

window.createRoom = async function () {
  playerName = document.getElementById("nameInput").value;

  if (!playerName) {
    alert("Enter your name");
    return;
  }

  currentRoom = generateRoomCode();

  await setDoc(doc(db, "rooms", currentRoom), {
    players: [playerName],
    host: playerName,
    word: "",
    imposter: ""
  });

  enterLobby();
};

window.joinRoom = async function () {
  playerName = document.getElementById("nameInput").value;
  currentRoom = document.getElementById("roomInput").value;

  if (!playerName || !currentRoom) {
    alert("Enter name and room code");
    return;
  }

  const roomRef = doc(db, "rooms", currentRoom);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    alert("Room does not exist");
    return;
  }

  const data = roomSnap.data();

  await updateDoc(roomRef, {
    players: [...data.players, playerName]
  });

  enterLobby();
};

function enterLobby() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("lobby").classList.remove("hidden");
  document.getElementById("roomCode").innerText = currentRoom;

  const roomRef = doc(db, "rooms", currentRoom);

  onSnapshot(roomRef, (docSnap) => {
    const data = docSnap.data();

    document.getElementById("players").innerHTML =
      data.players.map(p =>
        `<div>${p} ${p === data.host ? "👑" : ""}</div>`
      ).join("");

    if (playerName === data.host) {
      document.getElementById("startBtn").style.display = "block";
    } else {
      document.getElementById("startBtn").style.display = "none";
    }

    if (data.word) {
      showWord(data.word, data.imposter);
    }
  });
}

window.startRound = async function () {

  const roomRef = doc(db, "rooms", currentRoom);
  const roomSnap = await getDoc(roomRef);
  const data = roomSnap.data();

  // Only host can start
  if (playerName !== data.host) {
    return;
  }

  // Minimum players check
  if (!data.players || data.players.length < 3) {
    alert("Minimum 3 players required 😎");
    return;
  }

  // Pick random word
  const randomWord = words[Math.floor(Math.random() * words.length)];

  // Pick EXACTLY one imposter
  const randomIndex = Math.floor(Math.random() * data.players.length);
  const randomImposter = data.players[randomIndex];

  // Extra safety check (just in case)
  if (!randomImposter) {
    alert("Error selecting imposter. Try again.");
    return;
  }

  await updateDoc(roomRef, {
    word: randomWord,
    imposter: randomImposter
  });
};

function showWord(word, imposter) {
  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  if (playerName === imposter) {
    document.getElementById("wordDisplay").innerText = "IMPOSTER 😈";
  } else {
    document.getElementById("wordDisplay").innerText = word;
  }
}