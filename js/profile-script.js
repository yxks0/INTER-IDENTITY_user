import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  listAll,
  deleteObject,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

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
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

document.addEventListener("DOMContentLoaded", function () {
  const inputFields = document.querySelectorAll("input");
  inputFields.forEach((input) => (input.value = ""));
});

document.querySelector(".btn-logout").addEventListener("click", () => {
  console.log("logout");
});

const headerName = document.getElementById("header-name");
const headerEmail = document.getElementById("header-email");

const fName = document.querySelector("#fName");
const lName = document.querySelector("#lName");
const email = document.querySelector("#email");
const newPWord = document.querySelector("#newPWord");
const currentPWord = document.querySelector("#currentPWord");
const age = document.querySelector("#age");
const gender = document.querySelector("#gender");
const province = document.querySelector("#province");
const contact = document.querySelector("#contact");

const imgInput = document.querySelector("input[type='file']");
const personalImg = document.querySelector(".personal-img");

const btnChangeProfile = document.querySelector(".btn-change-profile");
const btnChange = document.querySelector(".btn-change");

let userData;
let userID;
let file;
let fileName;

window.onload = function () {
  if (!sessionStorage.getItem("isLoggedIn")) {
    window.location.href = "./../index.html";
  }
};

btnChangeProfile.addEventListener("click", () => {
  imgInput.click();
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    userID = user.uid;

    const userRef = ref(database, "users/" + user.uid);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        userData = snapshot.val();

        if (userData.profileImg != "none") {
          const imageRef = storageRef(
            storage,
            `profileImg/${userData.email}/${userData.profileImg}`
          );
          try {
            const url = await getDownloadURL(imageRef);
            personalImg.setAttribute("src", url);
          } catch (error) {
            console.error("Error getting download URL:", error);
          }
        }

        headerName.textContent = userData.fName + " " + userData.lName;
        headerEmail.textContent = userData.email;

        fName.placeholder = userData.fName;
        lName.placeholder = userData.lName;
        email.placeholder = userData.email;
        age.placeholder = userData.age;
        gender.placeholder = userData.gender;
        province.placeholder = userData.province;
        contact.placeholder = userData.contact;

        imgInput.addEventListener("change", (e) => {
          file = e.target.files[0];
          fileName = file.name;

          const reader = new FileReader();

          reader.onload = (event) => {
            personalImg.setAttribute("src", event.target.result);
          };

          reader.readAsDataURL(file);
        });
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  }
});

btnChange.addEventListener("click", async () => {
  const user = auth.currentUser;
  const updates = {};

  if (fName.value) {
    updates["users/" + userID + "/fName"] = fName.value;
  }
  if (lName.value) {
    updates["users/" + userID + "/lName"] = lName.value;
  }
  if (email.value) {
    await updateEmailHandle();
  }
  if (age.value) {
    updates["users/" + userID + "/age"] = age.value;
  }
  if (gender.value) {
    updates["users/" + userID + "/gender"] = gender.value;
  }
  if (province.value) {
    updates["users/" + userID + "/province"] = province.value;
  }
  if (contact.value) {
    updates["users/" + userID + "/contact"] = contact.value;
  }
  if (fileName) {
    updates["users/" + userID + "/profileImg"] = fileName;

    const profileRef = storageRef(storage, `profileImg/${userData.email}`);
    try {
      const res = await listAll(profileRef);
      const deletePromises = res.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deletePromises);

      const imgStorageRef = storageRef(
        storage,
        `profileImg/${userData.email}/${fileName}`
      );
      const uploadTask = await uploadBytes(imgStorageRef, file);

      updates["users/" + userID + "/profileUrl"] = await getDownloadURL(
        imgStorageRef
      );
    } catch (error) {
      console.error("Error deleting previous images:", error);
    }
  }

  try {
    await update(ref(database), updates);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
  }

  if (newPWord.value) {
    try {
      await updatePassword(user, newPWord.value);
      console.log("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
    }
  }

  window.location.reload();
});

async function updateEmailHandle() {
  const user = auth.currentUser;
  const newEmail = email.value;

  console.log("current Email", userData.email);

  if (newEmail && currentPWord.value) {
    const credential = EmailAuthProvider.credential(
      userData.email,
      currentPWord.value
    );

    try {
      await reauthenticateWithCredential(user, credential);
      try {
        await verifyBeforeUpdateEmail(user, newEmail);
        console.log(
          "Verification email sent to the new email address. Please verify and then log in again."
        );
        alert(
          "Verification email sent to the new email address. Please verify and then log in again."
        );

        const emailUpdate = {};
        emailUpdate["users/" + userID + "/email"] = newEmail;

        try {
          await update(ref(database), emailUpdate);
          console.log("Email in database updated successfully");
          await logout();
        } catch (error) {
          console.error("Error updating email in database:", error);
        }
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    } catch (error) {
      console.error("Error reauthenticating:", error);
      alert("Error reauthenticating: " + error.message);
    }
  } else {
    alert("Please enter your current password and the new email.");
  }
}

async function logout() {
  try {
    await signOut(auth);
    sessionStorage.clear();
    window.location.reload();
  } catch (error) {
    const errorMessage = error.message;
    alert(errorMessage);
  }
}
