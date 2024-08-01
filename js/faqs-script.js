import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
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
const auth = getAuth(firebaseApp);
const database = getDatabase();

const btnSubmit = document.getElementById("btn-submit-question");
const questionInp = document.getElementById("question-inp");

btnSubmit.addEventListener("click", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userID = user.uid;

      const userRef = ref(database, "users/" + user.uid);
      get(userRef).then(async (snapshot) => {
        if (snapshot.exists()) {
          // const userData = await snapshot.val();

          if (!questionInp.value) {
            alert("Please fill the question field.");
            return;
          }

          set(push(ref(database, `questions`)), {
            userID: userID,
            question: questionInp.value,
            archived: false,
          }).then(() => {
            alert(
              "Your question has been submitted. You will receive an answer via email soon."
            );
          });
        }
      });
    } else {
      alert("Please login first.");
    }
  });
});

var faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function (question) {
  question.addEventListener("click", function () {
    var answer = question.nextElementSibling;
    var questionImg = question.querySelector("img");

    var isCurrentlyVisible = answer.style.display === "block";

    document.querySelectorAll(".faq-answer").forEach(function (answer) {
      answer.style.display = "none";
    });
    document.querySelectorAll(".faq-question img").forEach(function (img) {
      img.style.removeProperty("transform");
    });
    faqQuestions.forEach(function (q) {
      q.classList.remove("active");
    });

    if (!isCurrentlyVisible) {
      answer.style.display = "block";
      questionImg.style.transform = "rotate(180deg)";
      question.classList.add("active");
    }
  });
});
