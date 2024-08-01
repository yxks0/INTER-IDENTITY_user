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

const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");
const headerSection = document.querySelector(".main-header");
const headerImgContainer = document.querySelector(".header-img-container");
const indicatorContainer = document.querySelector(".indicator-container");

displayHeader();

async function displayHeader() {
  headerImgContainer.innerHTML = "";
  indicatorContainer.innerHTML = "";

  const dbRef = ref(database, "content/home/header");
  const snapshot = await get(dbRef);
  const urls = snapshot.val() || [];

  if (urls) {
    urls.forEach((imageUrl, index) => {
      const img = document.createElement("img");
      img.alt = "";
      img.src = imageUrl;

      headerImgContainer.appendChild(img);

      const indicator = document.createElement("span");
      indicator.classList.add("dot");
      if (index == 0) {
        indicator.classList.add("active");
      }

      indicatorContainer.appendChild(indicator);
    });
  }

  const images = document.querySelectorAll(".header-img-container img");
  const dots = indicatorContainer.querySelectorAll(".dot");

  let currentImageIndex = 0;
  let scrollAmount = 0;

  headerSection.scrollTo({
    top: 0,
    left: scrollAmount,
    behavior: "instant",
  });

  headerSection.addEventListener("scroll", function (e) {
    e.preventDefault();
  });

  function updateIndicator() {
    dots.forEach((dot, index) => {
      if (index === currentImageIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      scrollAmount -= headerSection.offsetWidth;
    } else {
      currentImageIndex = images.length - 1;
      scrollAmount = headerSection.offsetWidth * (images.length - 1);
    }
    headerSection.scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: "smooth",
    });
    updateIndicator();
  });

  nextButton.addEventListener("click", () => {
    if (currentImageIndex < images.length - 1) {
      currentImageIndex++;
      scrollAmount += headerSection.offsetWidth;
    } else {
      currentImageIndex = 0;
      scrollAmount = 0;
    }
    headerSection.scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: "smooth",
    });
    updateIndicator();
  });
}
