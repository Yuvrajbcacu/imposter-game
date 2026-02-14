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

  // 🏏 Cricket
  "Kohli","Dhoni","Rohit","Bumrah","Jadeja","Gill","Sachin","Yuvraj","Hardik",
  "IPL","Bat","Stump","Helmet","Umpire","Pitch","Boundary","Yorker","Googly",

  // 🎬 Bollywood
  "Shahrukh","Salman","Aamir","Ranbir","Ranveer","Akshay","Ajay","Amitabh",
  "Alia","Deepika","Katrina","Anushka","Kareena","Kiara","Kartik",
  "Pathaan","Jawan","Sholay","Don","Lagaan","Swades","Dangal","Krrish",

  // 😂 Meme Culture
  "Binod","MoyeMoye","Rasode","JCB","Pawri","Elvish","CarryMinati",
  "Triggered","Reel","Meme","Viral","Roast","Thumbnail","Influencer",

  // 🍲 Food
  "Rajma","Chawal","Paneer","Biryani","Samosa","Jalebi","Lassi","Paratha",
  "Maggi","Momos","Chaat","Kachori","Kulfi","Halwa","Naan","Tandoor",
  "ButterChicken","GolGappa","Chole","Pakoda",

  // 🚇 North India
  "Delhi","Noida","Lucknow","Kanpur","Jaipur","Agra","Varanasi","Chandigarh",
  "Metro","Rickshaw","Dhaba","Baraat","Shaadi","Band","Dhol","Lehenga",
  "Kurta","Pagdi","Mandap","Pandit",

  // 🏫 College / Youth
  "Backbencher","Proxy","Assignment","Viva","Hostel","Mess","Farewell",
  "Freshers","Placement","Internship","Attendance","Notebook","Project",
  "Crush","Friendzone","Roommate",

  // 📱 Internet / Tech
  "Instagram","WhatsApp","YouTube","Netflix","Hotstar","UPI","Paytm",
  "PhonePe","Amazon","Flipkart","iPhone","Android","WiFi","Screenshot",
  "Hashtag","Emoji","Sticker",

  // 🎉 Festivals
  "Diwali","Holi","Navratri","Dussehra","RakshaBandhan","Lohri","KarwaChauth",
  "Firecracker","Rangoli","Pichkari",

  // 👨‍👩‍👧 Family & Social
  "Aunty","Uncle","Cousin","Dadi","Nani","Papa","Mummy","Bhaiya","Didi",
  "Neighbour","Teacher","Principal","Warden","Driver",

  // 🚗 Daily Life
  "Thar","Bullet","Scooty","Auto","Petrol","Traffic","Helmet","Signal",
  "Ticket","Platform","Train","Station",

  // 🧃 Snacks / Brands
  "ParleG","Bournvita","Amul","Frooti","Maaza","ThumsUp","Sprite","Pepsi",
  "Kurkure","Lays","Haldiram","Bingo",

  // 🎮 Fun / Games
  "Ludo","Carrom","Chess","Kabaddi","KhoKho","Badminton","Football",
  "GullyCricket","Penalty","Trophy",

  // 🎵 Pop Culture
  "Arijit","HoneySingh","Badshah","Diljit","APDhillon","SidhuMoosewala",
  "Spotify","Playlist","Concert",

  // 🧠 Meme-ish Nouns (safe)
  "Jugaad","Swag","Vibe","Chaos","Drama","Attitude","Ego","Flex",
  "Legend","Noob","NPC","Sigma","Alpha","Aura",

  // 🌍 Small International refs
  "Messi","Ronaldo","MrBeast","ElonMusk","Bitcoin","Marvel","Batman","Joker",

  // 🍛 Extra Desi Life (extendable)
  "Tiffin","Chai","Thermos","Balcony","Terrace","Generator","Inverter",
  "Tuition","Coaching","Exam","Result","Marksheet","Uniform","Library",

  // 🎭 TV / Shows
  "BiggBoss","KapilSharma","CID","TarakMehta","IndianIdol","Splitsvilla",

  // 👕 Clothing / Style
  "Sneakers","Kurti","Jeans","Sherwani","Dupatta","Watch","Chain","Goggles",

  // 🏠 Household
  "PressureCooker","Belan","Chimta","Bucket","Mug","Sofa","Mattress","Cooler",

  // 🔥 Extra memes / internet slang nouns
  "OP","Clutch","Lag","Ping","Spam","Bot","Moderator","Chat","Subscriber"
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