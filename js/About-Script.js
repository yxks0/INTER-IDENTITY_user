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

const headerImg = document.querySelector(".header-img");

const introContent = document.querySelector(".intro-container p");
const missionContent = document.querySelector(".mission-container p");
const visionContent = document.querySelector(".vision-container p");

const membersContainer = document.querySelector(".members-container");

displayAbout();

async function displayAbout() {
  membersContainer.innerHTML = "";

  const snapshot = await get(ref(database, "content/about"));
  const data = snapshot.val();

  if (data.imgUrl) {
    headerImg.src = data.imgUrl;
  }

  if (data.texts) {
    introContent.textContent = data.texts.intro;
    missionContent.textContent = data.texts.mission;
    visionContent.textContent = data.texts.vision;
  }

  if (data.members) {
    for (const ID in data.members) {
      const memberData = data.members[ID];

      const memberContent = document.createElement("div");
      memberContent.classList.add("members-content");

      const img = document.createElement("img");
      img.src = memberData.imgUrl;

      const memberInfo = document.createElement("div");
      memberInfo.classList.add("member-info");

      const h1 = document.createElement("h1");
      h1.textContent = memberData.name;

      const h3 = document.createElement("h3");
      h3.textContent = memberData.role;

      const p = document.createElement("p");
      p.textContent = memberData.description;

      memberInfo.appendChild(h1);
      memberInfo.appendChild(h3);
      memberInfo.appendChild(p);

      memberContent.appendChild(img);
      memberContent.appendChild(memberInfo);

      membersContainer.appendChild(memberContent);
    }
  }
}

document.addEventListener("headerLoaded", () => {
  // const btnAboutNav = document.querySelector(".menu-nav .btn-about");
  // btnAboutNav.style.background = "rgba(0, 0, 0, 0.5)";
  // btnAboutNav.style.color = "white";
  // document.querySelector(".header-nav .btn-about").style.textDecoration =
  //   "underline";

  document.querySelector(".header-nav .btn-about").style.color =
    "var(--color-main-purple-2)";
});
