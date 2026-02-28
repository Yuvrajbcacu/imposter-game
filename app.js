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

/* ===== CRICKET ===== */
"Kohli","Dhoni","Rohit","Bumrah","Gill","Jadeja","Hardik","Sachin","Yuvraj","Dravid",
"Ganguly","Sehwag","Pant","KL","Ashwin","Chahal","Siraj","Sky","WorldCup","IPL",
"Bat","Ball","Stump","Bouncer","Yorker","Googly","Helmet","Pad","Pitch","Boundary",
"Six","Four","Catch","Runout","Umpire","DRS","Toss","Powerplay","SuperOver","Century",

/* ===== BOLLYWOOD ACTORS ===== */
"Shahrukh","Salman","Aamir","Ranbir","Ranveer","Akshay","Ajay","Amitabh","Hrithik","Saif",
"Alia","Deepika","Katrina","Anushka","Kareena","Kiara","Kartik","Shraddha","Varun","Sunny",

/* ===== BOLLYWOOD MOVIES ===== */
"Pathaan","Jawan","Dangal","Sholay","Don","Lagaan","Swades","Krrish","Gadar","HeraPheri",
"Golmaal","RaOne","Singham","Drishyam","Baahubali","Pushpa","Animal","ChennaiExpress","PK","3Idiots",

/* ===== MEME CULTURE ===== */
"Binod","MoyeMoye","Rasode","JCB","Pawri","Elvish","CarryMinati","Triggered","Reel","Meme",
"Viral","Roast","Thumbnail","Influencer","Sigma","Alpha","Aura","Flex","NPC","Noob",
"OP","Clutch","Lag","Spam","Bot","Subscriber","Hashtag","Screenshot","Sticker","Emoji",

/* ===== NORTH INDIA CITIES ===== */
"Delhi","Noida","Lucknow","Kanpur","Agra","Varanasi","Jaipur","Chandigarh","Patna","Meerut",
"Ghaziabad","Gurgaon","Prayagraj","Haridwar","Shimla","Manali","Amritsar","Dehradun","Aligarh","Bareilly",

/* ===== FOOD ===== */
"Rajma","Chawal","Paneer","Biryani","Samosa","Jalebi","Lassi","Paratha","Maggi","Momos",
"Chaat","Kachori","Kulfi","Halwa","Naan","Tandoor","Pakoda","GolGappa","Chole","ButterChicken",
"Raita","Papad","Pickle","Chai","Coffee","Frooti","Maaza","ThumsUp","Sprite","Pepsi",

/* ===== FESTIVALS ===== */
"Diwali","Holi","Navratri","Dussehra","RakshaBandhan","Lohri","KarwaChauth","Eid","Christmas","Janmashtami",
"GaneshChaturthi","Baisakhi","MakarSankranti","Rangoli","Pichkari","Firecracker","Dhol","Garba","Aarti","Prasad",

/* ===== COLLEGE LIFE ===== */
"Backbencher","Proxy","Assignment","Viva","Hostel","Mess","Farewell","Freshers","Placement","Internship",
"Attendance","Notebook","Project","Crush","Friendzone","Roommate","Canteen","Library","Exam","Result",

/* ===== INTERNET / TECH ===== */
"Instagram","WhatsApp","YouTube","Netflix","Hotstar","UPI","Paytm","PhonePe","Amazon","Flipkart",
"iPhone","Android","WiFi","Bluetooth","Laptop","Keyboard","Mouse","Router","Password","Notification",

/* ===== DAILY LIFE ===== */
"Metro","Rickshaw","Auto","Dhaba","Shaadi","Baraat","Band","Dhol","Lehenga","Kurta",
"Pagdi","Mandap","Pandit","Helmet","Signal","Traffic","Petrol","Ticket","Platform","Station",

/* ===== FAMILY ===== */
"Aunty","Uncle","Cousin","Dadi","Nani","Papa","Mummy","Bhaiya","Didi","Neighbour",
"Teacher","Principal","Warden","Driver","Pandit","Barber","Doctor","Engineer","Lawyer","Judge",

/* ===== SPORTS ===== */
"Football","Kabaddi","KhoKho","Badminton","Chess","Carrom","Ludo","Penalty","Trophy","Referee",
"Stadium","Coach","Captain","Goal","Medal","Gym","Protein","Trainer","Dumbbell","Treadmill",

/* ===== BRANDS ===== */
"ParleG","Bournvita","Amul","Haldiram","Bingo","Kurkure","Lays","Cadbury","KitKat","Magnum",
"Zomato","Swiggy","Ola","Uber","Rapido","Dominos","PizzaHut","Starbucks","KFC","McDonalds",

/* ===== DESI OBJECTS ===== */
"Tiffin","Balcony","Terrace","Generator","Inverter","Tuition","Coaching","Marksheet","Uniform","PressureCooker",
"Belan","Bucket","Mug","Cooler","Fan","AC","Geyser","Curtain","Remote","Mattress",

/* ===== TV SHOWS ===== */
"BiggBoss","CID","KapilSharma","TarakMehta","IndianIdol","Splitsvilla","Roadies","MTV","Aashram","Mirzapur",

/* ===== INTERNATIONAL ===== */
"Messi","Ronaldo","MrBeast","Elon","Bitcoin","Marvel","Batman","Joker","Avengers","Thor",
"Spiderman","Barbie","Oppenheimer","Netflix","Spotify","Burger","Pizza","Sushi","Dubai","London",

/* ===== RANDOM FUN ===== */
"Vibe","Drama","Attitude","Ego","Chaos","Legend","Swag","Energy","Focus","Motivation",
"Alarm","Charger","Headphones","Speaker","Camera","Tripod","Selfie","Filter","Caption","Playlist"

"Breakup","Ex","Rebound","Situationship","Date","BlindDate","Tinder","Bumble","Hinge",
"RedFlag","GreenFlag","Ghosting","Crush","Proposal","Friendzone","Cheating","Commitment",
"Shaadi","ArrangedMarriage","LoveMarriage","Rishta","InLaws","Sasural","Dowry","Engagement",

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
