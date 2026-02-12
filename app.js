import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

await signInAnonymously(auth);

let currentRoom = null;
let playerName = null;

const words = [
"Virat Kohli","MS Dhoni","Rohit Sharma","Hardik Pandya","Sachin Tendulkar",
"Jasprit Bumrah","Ravindra Jadeja","Kapil Dev","Sourav Ganguly","Yuvraj Singh",
"Shah Rukh Khan","Salman Khan","Aamir Khan","Ranveer Singh","Ranbir Kapoor",
"Deepika Padukone","Alia Bhatt","Katrina Kaif","Anushka Sharma","Amitabh Bachchan",
"Rajma Chawal","Chole Bhature","Paneer Butter Masala","Gol Gappa","Samosa",
"Maggi","Butter Chicken","Biryani","Lassi","Jalebi",
"Delhi Metro","UP Police","IAS Aspirant","Coaching Centre","Shaadi Baraat",
"Nagin Dance","Jugaad","Desi Swag","Pados Wali Aunty","Gym Freak",
"Binod","Rasode Mein Kaun Tha","Moye Moye","System Hang","So Beautiful So Elegant",
"CarryMinati","Elvish Yadav","Triggered Insaan","Technical Guruji","BB Ki Vines",
"Auto Rickshaw","Bullet Bike","Thar","Metro Card","UPI",
"Aadhaar Card","Zomato","Swiggy","Paytm","Instagram",
"Cristiano Ronaldo","Lionel Messi","Mr Beast","Netflix","Bitcoin",
"Elon Musk","iPhone","WhatsApp","Google","YouTube",
"Parle G","Kurta Pajama","Dhaba","Wedding Band","Halwai",
"Paranthe","Tandoor","Rickshaw Wala","Chai Stall","Hostel Life",
"Exam Result","Board Exams","Crush","First Love","Breakup",
"Friendzone","Sarkari Naukri","Startup Founder","MBA Wala Banda","Engineering Student",
"Vada Pav","Dhokla","Idli Sambar","Pani Puri","Kachori",
"Kulfi","Gajar Ka Halwa","Mom Made Food","Tiffin Box","Lunch Break",
"School PTM","Class Monitor","Bench Partner","Backbencher","Principal",
"Wedding Card","Baraati","DJ Wala Babu","Ghar Ki Shaadi","Cousin Brother",
"Train Journey","Sleeper Coach","Auto Fare","Petrol Price","Traffic Jam",
"IPL Auction","World Cup","Stadium Crowd","Cricket Umpire","Commentator",
"Bigg Boss","Kapil Sharma Show","Indian Idol","Dance India Dance","KBC",
"Holi","Diwali","Dussehra","Raksha Bandhan","Navratri",
"Desi Dad","Strict Teacher","Hostel Warden","Roommate","Mess Food",
"Wedding Photographer","Shaadi Planner","Makeup Artist","Dance Floor","Band Baja",
"Temple Visit","Gurudwara","Masjid","Pandit Ji","Prasad",
"Political Rally","Election Campaign","Roadside Dhaba","Tea Stall Gossip","Neighbour Uncle",
"Wedding Proposal","Arranged Marriage","Love Marriage","Rishta Aaya Hai","Family Function",
"College Fest","Freshers Party","Farewell","Annual Day","Sports Day",
"Cricket Match","Football Match","Kabaddi","Kho Kho","Badminton",
"Morning Walk","Yoga Class","Gym Trainer","Protein Shake","Diet Plan",
"Selfie","Group Photo","Reel","Viral Video","Trending Meme",
"Hostel Party","Birthday Cake","Surprise Party","Gift Voucher","Amazon Sale"
];function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

window.createRoom = async function () {
  playerName = document.getElementById("nameInput").value;
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

  const roomRef = doc(db, "rooms", currentRoom);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    const data = roomSnap.data();
    
    await updateDoc(roomRef, {
      players: [...data.players, playerName]
    });

    enterLobby();
  }
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
      document.getElementById("newRoundBtn").style.display = "block";
    } else {
      document.getElementById("startBtn").style.display = "none";
      document.getElementById("newRoundBtn").style.display = "none";
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

  if (playerName !== data.host) {
    alert("Only Host can start new round 👑");
    return;
  }

  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomImposter = data.players[Math.floor(Math.random() * data.players.length)];

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

window.newRound = async function () {
  await startRound();
};