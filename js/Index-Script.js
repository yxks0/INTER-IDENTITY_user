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

const intersexContent = document.querySelector(".intersex-ph-container p");

const variationImg = document.querySelector(".variations-section img");
const variationContent = document.querySelector(".variations-section p");

const video1Url = document.querySelector(".video-content-1 iframe");
const video1Content = document.querySelector(".video-content-1 p");
const video2Url = document.querySelector(".video-content-2 iframe");
const video2Content = document.querySelector(".video-content-2 p");
const video3Url = document.querySelector(".video-content-3 iframe");
const video3Content = document.querySelector(".video-content-3 p");

const communityImg = document.querySelector(".community-banner-container img");
const communityContent = document.querySelector(
  ".community-banner-container p"
);

const newsImg = document.querySelector(".news-banner-container img");
const newsContent = document.querySelector(".news-banner-container p");

const faqImg = document.querySelector(".faq-banner-container img");

async function displayContent() {
  const snapshot = await get(ref(database, "content/home"));
  const data = snapshot.val();

  if (data.intersex) {
    intersexContent.textContent = data.intersex.content;
  }

  if (data.variation) {
    variationImg.src = data.variation.imgUrl;
    variationContent.textContent = data.variation.content;
  }

  if (data.videos) {
    video1Url.src = data.videos.videoUrl1;
    video1Content.textContent = data.videos.videoTitle1;
    video2Url.src = data.videos.videoUrl2;
    video2Content.textContent = data.videos.videoTitle2;
    video3Url.src = data.videos.videoUrl3;
    video3Content.textContent = data.videos.videoTitle3;
  }

  if (data.community) {
    communityImg.src = data.community.imgUrl;
    communityContent.textContent = data.community.content;
  }

  if (data.news) {
    newsImg.src = data.news.imgUrl;
    newsContent.textContent = data.news.content;
  }

  if (data.faq) {
    faqImg.src = data.faq.imgUrl;
  }
}

displayContent();
