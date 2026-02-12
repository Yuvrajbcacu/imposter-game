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

const words = ["Apple", "Car", "Beach", "Pizza", "Lion", "School"];

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

window.createRoom = async function () {
  playerName = document.getElementById("nameInput").value;
  currentRoom = generateRoomCode();

  await setDoc(doc(db, "rooms", currentRoom), {
    players: [playerName],
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
    data.players.push(playerName);
    await updateDoc(roomRef, { players: data.players });
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
      data.players.map(p => `<div>${p}</div>`).join("");

    if (data.word) {
      showWord(data.word, data.imposter);
    }
  });
}

window.startRound = async function () {
  const roomRef = doc(db, "rooms", currentRoom);
  const roomSnap = await getDoc(roomRef);
  const data = roomSnap.data();

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