import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
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

auth.onAuthStateChanged((user) => {
  if (user) {
    const userID = user.uid;
    let userData;

    const userRef = ref(database, "users/" + user.uid);
    get(userRef).then(async (snapshot) => {
      if (snapshot.exists()) {
        userData = await snapshot.val();

        const landingContainer = document.querySelector(".landing-container");
        const chooseTopicContainer = document.querySelector(
          ".choose-topic-container"
        );
        const topicContainer = document.querySelector(".topic-section");
        const beginQuizContainer = document.querySelector(".begin-quiz");
        const quizContainer = document.querySelector(".quiz-section");
        const quizResultContainer = document.querySelector(".quiz-result");

        const topicTitle1 = document.getElementById("topic-title-1");
        const topicTitle2 = document.getElementById("topic-title-2");
        const topicText = document.getElementById("topic-text");

        const topicOverlay = document.querySelector(".topic-overlay");
        const finishVideo = document.querySelector(".finish-video-container");

        // ==================================================================================================================================================
        const number = document.getElementById("number");
        const questionContent = document.getElementById("question");
        const choicesContent = document.querySelectorAll(".choices-content");
        const choice1 = document.getElementById("choice-1");
        const choice1Content = document.querySelector("#choice-1 .choice-text");
        const choice2 = document.getElementById("choice-2");
        const choice2Content = document.querySelector("#choice-2 .choice-text");
        const choice3 = document.getElementById("choice-3");
        const choice3Content = document.querySelector("#choice-3 .choice-text");
        const choice4 = document.getElementById("choice-4");
        const choice4Content = document.querySelector("#choice-4 .choice-text");
        const correctAnswer = document.getElementById("correct-answer");
        const correctContent = correctAnswer.querySelector(".correct-content");
        const incorrectAnswer = document.getElementById("incorrect-answer");
        const incorrectContent =
          incorrectAnswer.querySelector(".incorrect-content");
        const btnSubmitContinue = document.querySelector(
          ".btn-submit-continue"
        );
        // ==================================================================================================================================================

        // BUTTONS NAV ==================================================================================================================================================
        document
          .querySelector(".btn-landing-next")
          .addEventListener("click", () => {
            landingContainer.style.display = "none";
            chooseTopicContainer.style.display = "block";

            sessionStorage.setItem("quiz-nav", "chooseTopicContainer");
          });

        document
          .querySelector(".btn-choose-topic-back")
          .addEventListener("click", () => {
            landingContainer.style.display = "block";
            chooseTopicContainer.style.display = "none";
            sessionStorage.setItem("quiz-nav", "landingContainer");
          });

        chooseTopicContainer
          .querySelectorAll(".container button")
          .forEach((btn) => {
            btn.addEventListener("click", () => {
              sessionStorage.setItem(
                "quiz-topic",
                btn.getAttribute("data-topic")
              );
              sessionStorage.setItem("quiz-nav", "topicContainer");
              displayTopic();
            });
          });

        function displayTopic() {
          chooseTopicContainer.style.display = "none";
          topicContainer.style.display = "block";

          const quizTopic = sessionStorage.getItem("quiz-topic");

          if (quizTopic === "intersex") {
            topicTitle1.textContent = "What is Intersex";
            topicTitle1.textContent = "What is Intersex";
            topicText.textContent = "Introduction to Intersex";
          } else if (quizTopic === "myths") {
            topicTitle1.textContent = "Myths and Misconceptions";
            topicTitle1.textContent = "Myths and Misconceptions";
            topicText.textContent = "Myths and Misconceptions";
          } else if (quizTopic === "variations") {
            topicTitle1.textContent = "Common Variations";
            topicTitle1.textContent = "Common Variations";
            topicText.textContent = "Common Variations";
          }
        }

        document
          .querySelector(".btn-topic-back")
          .addEventListener("click", () => {
            topicContainer.style.display = "none";
            chooseTopicContainer.style.display = "block";
            sessionStorage.setItem("quiz-nav", "chooseTopicContainer");
          });

        document
          .querySelector(".btn-done-watching")
          .addEventListener("click", () => {
            topicOverlay.style.display = "block";
            finishVideo.style.display = "block";
          });

        document
          .querySelector(".btn-close-finish")
          .addEventListener("click", () => {
            topicOverlay.style.display = "none";
            finishVideo.style.display = "none";
          });

        document
          .querySelector(".btn-take-quiz")
          .addEventListener("click", () => {
            topicOverlay.style.display = "none";
            finishVideo.style.display = "none";
            topicContainer.style.display = "none";
            beginQuizContainer.style.display = "block";
            sessionStorage.setItem("quiz-nav", "beginQuizContainer");
          });

        document
          .querySelector(".btn-begin-quiz-back")
          .addEventListener("click", () => {
            topicContainer.style.display = "block";
            beginQuizContainer.style.display = "none";
            sessionStorage.setItem("quiz-nav", "topicContainer");
          });

        document
          .querySelector(".btn-begin-quiz")
          .addEventListener("click", () => {
            beginQuizContainer.style.display = "none";
            quizContainer.style.display = "block";
            displayQuiz();
          });

        document
          .querySelector(".btn-take-other-quizzes")
          .addEventListener("click", () => {
            quizResultContainer.style.display = "none";
            chooseTopicContainer.style.display = "block";

            sessionStorage.setItem("quiz-nav", "chooseTopicContainer");
          });

        function handleQuizNav() {
          const quizNav = sessionStorage.getItem("quiz-nav");

          landingContainer.style.display = "none";
          chooseTopicContainer.style.display = "none";
          topicOverlay.style.display = "none";
          finishVideo.style.display = "none";
          topicContainer.style.display = "none";
          quizResultContainer.style.display = "none";

          if (quizNav === "chooseTopicContainer") {
            chooseTopicContainer.style.display = "block";
          } else if (quizNav === "topicContainer") {
            topicContainer.style.display = "block";
            displayTopic();
          } else if (quizNav === "beginQuizContainer") {
            beginQuizContainer.style.display = "block";
          } else {
            landingContainer.style.display = "block";
          }
        }

        handleQuizNav();
        // BUTTONS NAV END ==================================================================================================================================================

        let currentIndex = 0;
        let score = 0;
        let quizData = [];
        let selectedChoice = null;
        let isSubmitted = false;
        let currentCorrectAnswer = null;

        async function displayQuiz() {
          const quizTopic = sessionStorage.getItem("quiz-topic");
          const snapshot = await get(ref(database, `quiz/${quizTopic}`));
          const snapshotData = snapshot.val();

          if (!snapshotData) {
            return;
          }

          score = 0;
          quizData = Object.values(snapshotData);
          displayCurrentQuiz();
        }

        function displayCurrentQuiz() {
          if (currentIndex < quizData.length) {
            const data = quizData[currentIndex];

            number.textContent = currentIndex + 1;
            questionContent.textContent = data.question;
            choice1Content.textContent = data.option1;
            choice2Content.textContent = data.option2;
            choice3Content.textContent = data.option3 || "";
            choice4Content.textContent = data.option4 || "";
            correctContent.textContent = data.rightAnswer;
            incorrectContent.textContent = data.wrongAnswer;

            choice3.style.display = data.option3 ? "flex" : "none";
            choice4.style.display = data.option4 ? "flex" : "none";

            choicesContent.forEach((choice) => {
              choice.classList.remove(
                "highlight-selected",
                "highlight-wrong",
                "highlight-correct"
              );
              choice.style.opacity = 1;
              choice.addEventListener("click", handleChoiceClick);
            });

            correctAnswer.style.display = "none";
            incorrectAnswer.style.display = "none";
            btnSubmitContinue.textContent = "Submit Answer";
            btnSubmitContinue.disabled = true;
            isSubmitted = false;
            currentCorrectAnswer = data.selectedSpan;

            btnSubmitContinue.addEventListener("click", handleSubmitContinue);
          } else {
            quizContainer.style.display = "none";
            quizResultContainer.style.display = "flex";
            document.getElementById("total-score").textContent = score;
            document.getElementById("total-item").textContent = currentIndex;

            const quizData = {
              name: `${userData.fName} ${userData.lName}`,
              score: score,
              topic: sessionStorage.getItem("quiz-topic"),
            };

            set(push(ref(database, "quizScores")), quizData);
          }
        }

        function handleChoiceClick(event) {
          if (isSubmitted) return;

          selectedChoice = event.currentTarget;

          choicesContent.forEach((choice) => {
            if (choice === selectedChoice) {
              choice.classList.add("highlight-selected");
              choice.style.opacity = 1;
            } else {
              choice.classList.remove("highlight-selected");
              choice.style.opacity = 0.6;
            }
          });

          btnSubmitContinue.disabled = false;
        }

        function handleSubmitContinue() {
          if (!selectedChoice) return;

          if (!isSubmitted) {
            const userAnswerText = selectedChoice
              .querySelector(".choice-letter")
              .getAttribute("id");
            const correctAnswerParent = document.getElementById(
              `${currentCorrectAnswer}`
            ).parentElement;

            if (userAnswerText === currentCorrectAnswer) {
              selectedChoice.classList.remove("highlight-selected");
              selectedChoice.classList.add("highlight-correct");
              correctAnswer.style.display = "block";
              score++;
            } else {
              selectedChoice.classList.remove("highlight-selected");
              selectedChoice.classList.add("highlight-wrong");

              correctAnswerParent.classList.add("highlight-correct");
              correctAnswerParent.style.opacity = "1";
              incorrectAnswer.style.display = "block";
            }

            btnSubmitContinue.textContent = "Continue";
            isSubmitted = true;
          } else {
            currentIndex++;
            selectedChoice = null;
            displayCurrentQuiz();
          }
        }

        // displayQuiz();
      }
    });
  }
});
