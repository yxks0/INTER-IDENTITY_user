import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPgWFqszS_2o_40rIUbZhSDPgsxl3u5n0",
  authDomain: "interidentity-90d32.firebaseapp.com",
  databaseURL: "https://interidentity-90d32-default-rtdb.firebaseio.com",
  projectId: "interidentity-90d32",
  storageBucket: "interidentity-90d32.appspot.com",
  messagingSenderId: "564846928127",
  appId: "1:564846928127:web:abf02f06edd576fcd12cca",
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase();

const intersexImg = document.querySelector(".intersex-section img");
const intersexContent = document.querySelector(".intersex-section p");

const variation1Img = document.querySelector(".variation-1 img");
const variation1Name = document.querySelector(".variation-1 h1");
const variation1Content = document.querySelector(".variation-1 p");

const variation2Img = document.querySelector(".variation-2 img");
const variation2Name = document.querySelector(".variation-2 h1");
const variation2Content = document.querySelector(".variation-2 p");

const variation3Img = document.querySelector(".variation-3 img");
const variation3Name = document.querySelector(".variation-3 h1");
const variation3Content = document.querySelector(".variation-3 p");

const card1Name = document.querySelector(".card-1-name");
const card1Content = document.querySelector(".card-1-content");

const card2Name = document.querySelector(".card-2-name");
const card2Content = document.querySelector(".card-2-content");

const card3Name = document.querySelector(".card-3-name");
const card3Content = document.querySelector(".card-3-content");

displayVariation();

async function displayVariation() {
  const snapshot = await get(ref(database, "content/intersex"));
  const data = snapshot.val();

  if (data.intersexContent) {
    intersexImg.src = data.intersexContent.imgUrl;
    intersexContent.textContent = data.intersexContent.content;
  }

  if (data.variation1) {
    variation1Img.src = data.variation1.imgUrl;
    variation1Name.textContent = data.variation1.name;
    variation1Content.textContent = data.variation1.content;

    card1Name.textContent = data.variation1.name;
    card1Content.textContent = data.variation1.content;
  }

  if (data.variation2) {
    variation2Img.src = data.variation2.imgUrl;
    variation2Name.textContent = data.variation2.name;
    variation2Content.textContent = data.variation2.content;

    card2Name.textContent = data.variation2.name;
    card2Content.textContent = data.variation2.content;
  }

  if (data.variation3) {
    variation3Img.src = data.variation3.imgUrl;
    variation3Name.textContent = data.variation3.name;
    variation3Content.textContent = data.variation3.content;

    card3Name.textContent = data.variation3.name;
    card3Content.textContent = data.variation3.content;
  }
}

document.addEventListener("headerLoaded", () => {
  const btnNav = document.querySelector(".menu-nav .btn-home");
  btnNav.style.background = "rgba(0, 0, 0, 0.5)";
  btnNav.style.color = "white";
  document.querySelector(".header-nav .btn-home").style.color =
    "var(--color-main-purple-2)";
});
