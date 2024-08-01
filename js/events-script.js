import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  // set,
  // child,
  // push,
  // onValue,
  // query,
  // orderByChild,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
// import {
//   getStorage,
//   ref as storageRef,
//   getDownloadURL,
//   listAll,
//   deleteObject,
//   uploadBytes,
// } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

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
// const auth = getAuth(firebaseApp);
const database = getDatabase();
// const storage = getStorage(firebaseApp);

const newsMainContainer = document.querySelector(".news-main-container");
const mainContainer = document.querySelector(".main-container");
const newsArticle = document.querySelector(".news-article");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageButtonsContainer = document.getElementById("page-buttons");

let currentPage = sessionStorage.getItem("currentPage")
  ? parseInt(sessionStorage.getItem("currentPage"))
  : 1;
const itemsPerPage = 9;

prevPageButton.addEventListener("click", () => changePage(currentPage - 1));
nextPageButton.addEventListener("click", () => changePage(currentPage + 1));

async function displayNewsContent(page = 1) {
  newsMainContainer.innerHTML = "";

  const newsRef = ref(database, "events");
  const snapshot = await get(newsRef);
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    prevPageButton.style.display = "none";
    nextPageButton.style.display = "none";
    return;
  }

  const newsArray = Object.values(snapshotData);

  newsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(newsArray.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;

  const paginatedNews = newsArray.slice(startIndex, endIndex);

  paginatedNews.forEach((data) => {
    const newsContent = document.createElement("div");
    newsContent.classList.add("news-content");

    const img = document.createElement("img");
    if (data.imgUrl) {
      img.src = `${data.imgUrl}`;
    }

    const h1 = document.createElement("h1");
    h1.textContent = `${data.title}`;

    const p = document.createElement("p");
    p.textContent = `${data.content}`;

    newsContent.appendChild(img);
    newsContent.appendChild(h1);
    newsContent.appendChild(p);

    newsMainContainer.appendChild(newsContent);

    newsContent.addEventListener("click", () => {
      displayNewsArticle(data);
    });

    // h1.addEventListener("click", () => {
    //   displayNewsArticle(data);
    // });
  });

  updatePageButtons(totalPages);
  updateNavButtons(totalPages);
  sessionStorage.setItem("currentPage", currentPage);
}

function updatePageButtons(totalPages) {
  pageButtonsContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.style.fontWeight = "bold";
    }
    pageButton.addEventListener("click", () => changePage(i));
    pageButtonsContainer.appendChild(pageButton);
  }
}

function updateNavButtons(totalPages) {
  prevPageButton.style.display = currentPage > 1 ? "inline-block" : "none";
  nextPageButton.style.display =
    currentPage < totalPages ? "inline-block" : "none";
}

function changePage(page) {
  currentPage = page;
  displayNewsContent(currentPage);
}

displayNewsContent(currentPage);

function displayNewsArticle(data) {
  mainContainer.style.display = "none";
  newsArticle.style.display = "flex";

  const title = document.getElementById("news-title");
  const img = document.getElementById("news-img");
  const content = document.getElementById("news-content");

  title.textContent = `${data.title}`;

  if (data.imgUrl != false) {
    img.src = `${data.imgUrl}`;
  } else {
    img.style.display = "none";
  }

  content.textContent = `${data.content}`;

  document.getElementById("btn-news-back").addEventListener("click", () => {
    newsArticle.style.display = "none";
    mainContainer.style.display = "flex";
  });
}
