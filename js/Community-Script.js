import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  child,
  push,
  onValue,
  query,
  orderByChild,
  remove,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  listAll,
  uploadBytes,
  deleteObject,
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
const database = getDatabase();
const storage = getStorage(firebaseApp);

const landingPage = document.getElementById("landing-container");
const mainContainer = document.getElementById("main-container");

auth.onAuthStateChanged((user) => {
  if (user) {
    const imageInput = document.querySelector(".inp-insert-img-post");

    // FIREBASE UPLOAD =================================================================================================================================
    const postContent = document.querySelector(
      ".insert-post-container .inp-insert-post"
    );
    const storyTitle = document.querySelector(
      ".story-post-container .inp-story-title"
    );
    const storyContent = document.querySelector(
      ".story-post-container .inp-story-content"
    );
    const userProfile = document.querySelectorAll(".post-user-profile");

    const btnInsertPost = document.querySelector(
      ".insert-post-container .btn-insert-post"
    );

    postContent.value = "";
    storyTitle.value = "";
    storyContent.value = "";
    const userID = user.uid;
    let userData;
    let withImg = false;

    landingPage.style.display = "none";
    mainContainer.style.display = "block";

    const userRef = ref(database, "users/" + user.uid);
    get(userRef).then(async (snapshot) => {
      if (snapshot.exists()) {
        userData = await snapshot.val();

        document.getElementById("community-profile-img").src =
          userData.profileUrl
            ? userData.profileUrl
            : "./../media/images/default-profile.png";
        document.getElementById(
          "community-profile-name"
        ).textContent = `${userData.fName} ${userData.lName}`;
        document.getElementById("community-profile-location").textContent =
          userData.province;
        document.getElementById("community-profile-contact").textContent =
          userData.contact;

        if (userData.profileImg != "none") {
          const imageRef = storageRef(
            storage,
            `profileImg/${userData.email}/${userData.profileImg}`
          );

          getDownloadURL(imageRef)
            .then((url) => {
              userProfile.forEach((img) => {
                img.setAttribute("src", url);
                img.style.objectFit = "cover";
                img.style.objectPosition = "center";
              });
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        }

        // BLOG =====================================================================================================================================
        btnInsertPost.addEventListener("click", () => {
          if (postContent.value != "" || imageInput.value != "") {
            const postRef = ref(database, "posts");
            const newPostRef = push(child(postRef, userID));
            const postID = newPostRef.key;

            if (imageInput.value != "") {
              withImg = true;
              const imgFiles = imageInput.files;

              for (let i = 0; i < imgFiles.length; i++) {
                const file = imgFiles[i];
                const imgStorageRef = storageRef(
                  storage,
                  `posts/${userID}/${postID}/${file.name}`
                );

                try {
                  const snapshot = uploadBytes(imgStorageRef, file);
                } catch (error) {
                  console.error(`Error uploading file: ${file.name}`, error);
                }
              }
            }

            let currentDate = new Date();
            let year = currentDate.getFullYear();
            let month = String(currentDate.getMonth() + 1).padStart(2, "0");
            let day = String(currentDate.getDate()).padStart(2, "0");

            let postDate = `${month}-${day}-${year}`;

            const currentUserFName = userData.fName;
            const currentUserLName = userData.lName;
            const currentUserEmail = userData.email;
            const currentUserProfileImg = userData.profileImg;

            set(child(postRef, `${userID}/${postID}`), {
              postID: postID,
              userFName: currentUserFName,
              userLName: currentUserLName,
              userEmail: currentUserEmail,
              userProfileImg: currentUserProfileImg,
              profileUrl: userData.profileUrl,
              postContent: postContent.value,
              withImg: withImg,
              postReacts: 0,
              postDate: postDate,
            });

            document.querySelector(".insert-post-container").style.display =
              "none";
            document.querySelector(".insert-post-overlay").style.display =
              "none";
            document.body.style.overflow = "auto";
          } else {
            alert("Please input something.");
          }
        });
        // BLOG END =====================================================================================================================================

        // STORY =====================================================================================================================================

        const btnInsertStory = document.querySelector(".btn-story-post");

        btnInsertStory.addEventListener("click", () => {
          if (storyContent.value != "" || storyTitle.value != "") {
            const storyRef = ref(database, "stories");
            const newStoryRef = push(child(storyRef, userID));
            const storyID = newStoryRef.key;

            let currentDate = new Date();
            let year = currentDate.getFullYear();
            let month = String(currentDate.getMonth() + 1).padStart(2, "0");
            let day = String(currentDate.getDate()).padStart(2, "0");

            let date = `${month}-${day}-${year}`;

            set(child(storyRef, `${userID}/${storyID}`), {
              storyID: storyID,
              title: storyTitle.value.trim(),
              content: storyContent.value.trim(),
              date: date,
            });
            alert("Story has been posted");

            document.querySelector(".story-post-container").style.display =
              "none";
            document.querySelector(".insert-story-overlay").style.display =
              "none";
            document.body.style.overflow = "auto";
          } else {
            alert("Please input something.");
          }
        });
        // STORY END =====================================================================================================================================

        // POLL  =====================================================================================================================================
        const btnInsertPoll = document.querySelector(
          ".poll-post-container .btn-poll-post"
        );
        const addOptionButton = document.getElementById("add-option-btn");
        const optionsContainer = document.getElementById("options-container");

        const pollInpQuestion = document.getElementById("poll-inp-question");

        pollInpQuestion.value = "";
        document
          .querySelectorAll(".poll-inp-option")
          .forEach((option) => (option.value = ""));

        btnInsertPoll.addEventListener("click", () => {
          const pollInpOptions = document.querySelectorAll(".poll-inp-option");

          const allInputsFilled = Array.from(pollInpOptions).every((option) => {
            return option.value.trim() !== "";
          });

          if (pollInpQuestion.value.trim() !== "" && allInputsFilled) {
            const pollRef = ref(database, "polls");
            const newPollRef = push(child(pollRef, userID));
            const pollID = newPollRef.key;

            let currentDate = new Date();
            let year = currentDate.getFullYear();
            let month = String(currentDate.getMonth() + 1).padStart(2, "0");
            let day = String(currentDate.getDate()).padStart(2, "0");

            let date = `${month}-${day}-${year}`;

            let options = [];
            pollInpOptions.forEach((option) => {
              options.push(option.value.trim());
            });

            set(child(pollRef, `${userID}/${pollID}`), {
              pollID: pollID,
              date: date,
              question: pollInpQuestion.value.trim(),
              options: options,
              pollReacts: 0,
            });

            document.querySelector(".poll-post-container").style.display =
              "none";
            document.querySelector(".insert-poll-overlay").style.display =
              "none";
            document.body.style.overflow = "auto";
          }
        });

        addOptionButton.addEventListener("click", () => {
          const allOptionInput =
            optionsContainer.querySelectorAll(".option-input");

          if (allOptionInput.length < 6) {
            const optionInput = document.createElement("div");
            optionInput.classList.add("option-input");

            const inputField = document.createElement("input");
            inputField.classList.add("poll-inp-option");
            inputField.type = "text";
            inputField.placeholder = "Poll option";

            const removeButton = document.createElement("button");
            removeButton.classList.add("remove-btn");
            removeButton.textContent = "\u00D7";
            removeButton.addEventListener("click", () => {
              optionsContainer.removeChild(optionInput);
            });

            optionInput.appendChild(inputField);
            optionInput.appendChild(removeButton);
            optionsContainer.appendChild(optionInput);
          }
        });

        document.querySelectorAll(".remove-btn").forEach((button) => {
          button.addEventListener("click", (event) => {
            const parent = event.target.parentNode;
            optionsContainer.removeChild(parent);
          });
        });
        // POLL END =====================================================================================================================================
      }
    });

    // FIREBASE UPLOAD END =================================================================================================================================

    // UPLOAD IMAGE =================================================================================================================================
    const previewContainer = document.querySelector(".preview-container");

    const handleUploadImage = () => {
      imageInput.value = "";
      previewContainer.value = "";
      const maxImages = 9;

      imageInput.addEventListener("change", () => {
        previewContainer.innerHTML = "";

        if (imageInput.files.length > maxImages) {
          alert("You can only upload up to 9 images.");

          const dataTransfer = new DataTransfer();

          Array.from(imageInput.files)
            .slice(0, maxImages)
            .forEach((file) => {
              dataTransfer.items.add(file);
              displayPreview(file);
            });

          imageInput.files = dataTransfer.files;
        } else {
          Array.from(imageInput.files).forEach((file) => {
            displayPreview(file);
          });
        }
      });

      const displayPreview = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgElement = document.createElement("img");
          imgElement.src = event.target.result;
          previewContainer.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
      };
    };

    handleUploadImage();
    // UPLOAD IMAGE END =================================================================================================================================

    // DISPLAY BLOGS =================================================================================================================================
    const displayPostComments = (event) => {
      const commentContainer = event.target
        .closest(".card-body")
        .querySelector(".post-content-container");
      commentContainer.classList.toggle("active");
    };

    let unsubscribeBlogs;

    const displayBlogs = () => {
      const cardContainer = document.querySelector(".card-container");

      const postsRef = ref(database, "posts");

      const sortedPostsQuery = query(postsRef, orderByChild("postDate"));

      unsubscribeBlogs = onValue(sortedPostsQuery, async (snapshot) => {
        if (unsubscribeBlogs) {
          unsubscribeBlogs();
        }

        let postsData = snapshot.val();
        cardContainer.innerHTML = "";

        if (localStorage.getItem("newsfeed") === "profile") {
          postsData = { [userID]: postsData[userID] };
        }

        const allPosts = [];

        for (let userId in postsData) {
          const userSnapshot = await get(ref(database, `users/${userId}`));
          const userSnapshotData = userSnapshot.val();

          if (!userSnapshotData.restricted) {
            for (let postId in postsData[userId]) {
              const post = postsData[userId][postId];

              let approveCondition;

              if (
                localStorage.getItem("profileNav") === "pending" &&
                localStorage.getItem("newsfeed") === "profile"
              ) {
                approveCondition = !post.approved && !post.archived;
              } else {
                approveCondition = post.approved && !post.archived;
              }

              if (approveCondition) {
                const commentsRef = ref(
                  database,
                  `posts/${userId}/${postId}/comments`
                );

                const commentsSnapshot = await get(commentsRef);
                const commentsData = commentsSnapshot.val();
                const commentsArray = [];

                if (commentsData) {
                  for (let commentId in commentsData) {
                    const repliesRef = ref(
                      database,
                      `posts/${userId}/${postId}/comments/${commentId}/replies`
                    );
                    const repliesSnapshot = await get(repliesRef);
                    const repliesData = repliesSnapshot.val();
                    const repliesArray = [];

                    if (repliesData) {
                      for (let replyID in repliesData) {
                        const replyUserSnapshot = await get(
                          ref(
                            database,
                            `users/${commentsData[commentId].replies[replyID].userID}`
                          )
                        );
                        const replyUserSnapshotData = replyUserSnapshot.val();

                        if (!replyUserSnapshotData.restricted) {
                          repliesArray.push({
                            replyID: replyID,
                            replyContent: repliesData[replyID].replyContent,
                            userEmail: repliesData[replyID].userEmail,
                            userFName: replyUserSnapshotData.fName,
                            userLName: replyUserSnapshotData.lName,
                            profileUrl: replyUserSnapshotData.profileUrl,
                          });
                        }
                      }
                    }

                    const commentUserSnapshot = await get(
                      ref(database, `users/${commentsData[commentId].userID}`)
                    );
                    const commentUserSnapshotData = commentUserSnapshot.val();

                    if (commentUserSnapshotData) {
                      if (!commentUserSnapshotData.restricted) {
                        commentsArray.push({
                          commentId: commentId,
                          commentContent:
                            commentsData[commentId].commentContent,
                          userEmail: commentsData[commentId].userEmail,
                          userFName: commentUserSnapshotData.fName,
                          userLName: commentUserSnapshotData.lName,
                          profileUrl: commentUserSnapshotData.profileUrl,
                          replies: repliesArray,
                        });
                      }
                    }
                  }
                }

                allPosts.push({
                  userId: userId,
                  postId: postId,
                  postContent: post.postContent,
                  postDate: post.postDate,
                  postReacts: post.postReacts,
                  // userEmail: post.userEmail,
                  userFName: userSnapshotData.fName,
                  userLName: userSnapshotData.lName,
                  // userProfileImg: post.userProfileImg,
                  profileUrl: userSnapshotData.profileUrl,
                  withImg: post.withImg,
                  comments: commentsArray,
                  reactsUsers: post.reactsUsers || {},
                });
              }
            }
          }
        }

        allPosts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        allPosts.forEach((post, index) => {
          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");

          const cardLeft = document.createElement("div");
          cardLeft.classList.add("card-left");

          const cardHeader = document.createElement("div");
          cardHeader.classList.add("card-header");

          const userImage = document.createElement("img");
          userImage.src = post.profileUrl
            ? post.profileUrl
            : "./../media/images/default-profile.png";

          const nameAndDate = document.createElement("div");
          nameAndDate.classList.add("name-date-container");
          nameAndDate.style.display = "flex";
          nameAndDate.style.flexDirection = "column";

          const username = document.createElement("h3");
          username.textContent = `${post.userFName} ${post.userLName}`;
          username.style.margin = "0";
          username.style.padding = "0";

          const dateIconContainer = document.createElement("div");
          dateIconContainer.style.display = "flex";

          const headerDate = document.createElement("p");
          headerDate.textContent = `${post.postDate}`;
          headerDate.style.margin = "0";
          headerDate.style.marginRight = "5px";
          headerDate.style.padding = "0";

          // const blogIcon = document.createElement("img");
          // blogIcon.src = "./../media/icons/icons8-goodnotes-100.png";
          // blogIcon.alt = "blog";
          // blogIcon.classList.add("indicator-icon");

          dateIconContainer.appendChild(headerDate);
          // dateIconContainer.appendChild(blogIcon);

          nameAndDate.appendChild(username);
          nameAndDate.appendChild(dateIconContainer);

          cardHeader.appendChild(userImage);
          cardHeader.appendChild(nameAndDate);

          const postContent = document.createElement("p");
          postContent.classList.add("post-content");
          postContent.textContent = post.postContent;
          postContent.style.whiteSpace = "pre-wrap";

          const postImgContainer = document.createElement("div");
          postImgContainer.classList.add("post-img-container", post.postId);

          const images = [];

          if (post.withImg) {
            const postImgRef = storageRef(
              storage,
              `posts/${post.userId}/${post.postId}`
            );

            listAll(postImgRef)
              .then((res) => {
                const downloadPromises = res.items.map((itemRef) => {
                  return getDownloadURL(itemRef)
                    .then((url) => {
                      images.push(url);
                    })
                    .catch((error) => {
                      console.error("Error getting download URL:", error);
                    });
                });

                return Promise.all(downloadPromises);
              })
              .then(() => {
                const handlePostImg = () => {
                  const imgContainer = document.querySelector(
                    `.${post.postId}`
                  );
                  const modal = document.querySelector(".modal");
                  const modalImg = document.querySelector(".modal-content");
                  const closeModal = document.querySelector(".btn-modal-close");
                  const prevModal = (document.querySelector(
                    ".btn-modal-prev"
                  ).style.display = "none");
                  const nextModal = (document.querySelector(
                    ".btn-modal-next"
                  ).style.display = "none");

                  let currentIndex = 0;

                  images.forEach((src, index) => {
                    const img = document.createElement("img");
                    img.src = src;
                    img.alt = "image";
                    img.dataset.index = index;
                    img.addEventListener("click", () => {
                      openModal(index);
                    });
                    imgContainer.appendChild(img);
                  });

                  const adjustGridColumns = () => {
                    const numImages = images.length;
                    if (numImages <= 1) {
                      imgContainer.style.gridTemplateColumns = "repeat(1, 1fr)";
                    } else if (numImages == 2) {
                      imgContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
                    } else {
                      imgContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
                    }
                  };

                  adjustGridColumns();

                  const openModal = (index) => {
                    currentIndex = index;
                    modal.style.display = "flex";
                    modalImg.src = images[currentIndex];
                  };

                  closeModal.onclick = () => {
                    modal.style.display = "none";
                  };

                  window.onclick = (event) => {
                    if (event.target == modal) {
                      modal.style.display = "none";
                    }
                  };
                };

                handlePostImg();
              })
              .catch((error) => {
                console.error("Error listing items:", error);
              });
          }

          const modal = document.createElement("div");
          modal.classList.add("modal");
          modal.id = "modal";

          const modalImage = document.createElement("img");
          modalImage.classList.add("modal-content");
          modalImage.id = "modalImage";

          const btnModalClose = document.createElement("span");
          btnModalClose.classList.add("btn-modal-close");
          btnModalClose.textContent = "×";

          const btnModalPrev = document.createElement("span");
          btnModalPrev.classList.add("btn-modal-prev");
          btnModalPrev.textContent = "‹";

          const btnModalNext = document.createElement("span");
          btnModalNext.classList.add("btn-modal-next");
          btnModalNext.textContent = "›";

          modal.appendChild(modalImage);
          modal.appendChild(btnModalClose);
          modal.appendChild(btnModalPrev);
          modal.appendChild(btnModalNext);

          cardLeft.appendChild(cardHeader);
          cardLeft.appendChild(postContent);
          cardLeft.appendChild(postImgContainer);
          cardLeft.appendChild(modal);

          const cardRight = document.createElement("div");
          cardRight.classList.add("post-bottom-container");

          const commentContentContainer = document.createElement("div");
          commentContentContainer.classList.add("post-content-container");

          // COMMENT CONTENT
          const createPostCommentCard = (comment) => {
            const commentContainer = document.createElement("div");
            commentContainer.classList.add("post-comment-card");

            const commentImg = document.createElement("img");
            commentImg.classList.add("comment-user-img");
            commentImg.src = comment.profileUrl
              ? comment.profileUrl
              : "./../media/images/default-profile.png";

            const commentContent = document.createElement("div");
            commentContent.classList.add("comment-content");

            const commentUserName = document.createElement("h4");
            commentUserName.classList.add("comment-user-name");
            commentUserName.textContent = `${comment.userFName} ${comment.userLName}`;

            const commentTextContainer = document.createElement("div");
            commentTextContainer.style.display = "flex";
            commentTextContainer.style.alignItems = "center";

            const commentP = document.createElement("p");
            commentP.style.marginRight = "10px";
            commentP.textContent = comment.commentContent;

            const replyIcon = document.createElement("img");
            replyIcon.src = "./../media/icons/icons8-left-2-100.png";
            replyIcon.alt = "reply";

            let replyInpContainer;

            replyIcon.addEventListener("click", () => {
              if (replyInpContainer) {
                replyInpContainer.remove();
                replyInpContainer = null;
              } else {
                replyInpContainer = document.createElement("div");
                replyInpContainer.classList.add("create-inp-container");
                replyInpContainer.style.display = "flex";
                replyInpContainer.style.height = "100px";

                const replyInput = document.createElement("input");
                replyInput.type = "text";
                replyInput.maxLength = "200";
                replyInput.placeholder = `Reply to ${comment.userFName} ${comment.userLName}`;

                const replySendIcon = document.createElement("img");
                replySendIcon.src = "./../media/icons/icons8-send-64.png";
                replySendIcon.alt = "send";

                replyInpContainer.appendChild(replyInput);
                replyInpContainer.appendChild(replySendIcon);
                commentContent.appendChild(replyInpContainer);

                replySendIcon.addEventListener("click", async () => {
                  const replyContent = replyInput.value.trim();

                  if (replyContent) {
                    const replyRef = ref(
                      database,
                      `posts/${post.userId}/${post.postId}/comments/${comment.commentId}/replies`
                    );
                    const newReplyRef = push(replyRef);
                    const replyID = newReplyRef.key;

                    const newReply = {
                      replyContent: replyContent,
                      userID: userID,
                      userFName: userData.fName,
                      userLName: userData.lName,
                      profileUrl: userData.profileUrl,
                    };

                    await set(newReplyRef, newReply);

                    displayBlogs();
                  }
                });
              }
            });

            commentTextContainer.appendChild(commentP);
            commentTextContainer.appendChild(replyIcon);

            commentContent.appendChild(commentUserName);
            commentContent.appendChild(commentTextContainer);

            commentContainer.appendChild(commentImg);
            commentContainer.appendChild(commentContent);

            commentContentContainer.appendChild(commentContainer);
          };

          if (post.comments) {
            post.comments.forEach((comment) => {
              createPostCommentCard(comment);

              if (comment.replies) {
                comment.replies.forEach((reply) => {
                  const replyCard = document.createElement("div");
                  replyCard.classList.add("post-reply-card");

                  const replyUserProfile = document.createElement("img");
                  replyUserProfile.style.objectFit = "cover";
                  replyUserProfile.style.objectPosition = "center";
                  replyUserProfile.src = reply.profileUrl
                    ? reply.profileUrl
                    : "./../media/images/default-profile.png";

                  const postReplyContent = document.createElement("div");
                  postReplyContent.classList.add("post-reply-content");

                  const replyUserName = document.createElement("h4");
                  replyUserName.classList.add("post-reply-user-name");
                  replyUserName.textContent = `${reply.userFName} ${reply.userLName}`;

                  const replyText = document.createElement("p");
                  replyText.textContent = reply.replyContent;

                  postReplyContent.appendChild(replyUserName);
                  postReplyContent.appendChild(replyText);

                  replyCard.appendChild(replyUserProfile);
                  replyCard.appendChild(postReplyContent);

                  commentContentContainer.appendChild(replyCard);
                });
              }
            });
          }
          // COMMENT CONTENT END

          cardRight.appendChild(commentContentContainer);

          const cardFooter = document.createElement("div");
          cardFooter.classList.add("card-footer");

          const iconContainer = document.createElement("div");

          const commentInput = document.createElement("input");
          commentInput.type = "text";
          commentInput.id = "inp-comment";
          commentInput.classList.add("inp-comment");
          commentInput.placeholder = "Add a comment";

          const sendIcon = document.createElement("img");
          sendIcon.src = "./../media/icons/icons8-send-32.png";
          sendIcon.alt = "send";
          sendIcon.classList.add("send-icon");

          iconContainer.appendChild(commentInput);
          iconContainer.appendChild(sendIcon);

          const postActions = document.createElement("div");
          postActions.classList.add("post-actions");

          const commentIcon = document.createElement("img");
          commentIcon.src = "./../media/icons/icons8-comment-96.png";
          commentIcon.alt = "comment";
          commentIcon.id = "post-comment-img";
          commentIcon.classList.add("post-comment-img");
          commentIcon.dataset.index = index;

          const commentLabel = document.createElement("label");
          commentLabel.htmlFor = "post-comment-img";
          commentLabel.textContent = post.comments.reduce(
            (total, comment) =>
              total + 1 + (comment.replies ? comment.replies.length : 0),
            0
          );

          const footerIcon = document.createElement("img");
          footerIcon.src =
            post.reactsUsers && userID && post.reactsUsers[userID]
              ? "./../media/icons/icons8-heart-50-red.png"
              : "./../media/icons/icons8-heart-50.png";
          footerIcon.alt = "icon";
          footerIcon.classList.add("footer-icon");
          footerIcon.id = "post-heart-img";

          const iconCount = document.createElement("label");
          iconCount.textContent = post.postReacts;
          iconCount.htmlFor = "post-heart-img";

          postActions.appendChild(commentIcon);
          postActions.appendChild(commentLabel);
          postActions.appendChild(footerIcon);
          postActions.appendChild(iconCount);

          cardFooter.appendChild(iconContainer);
          cardFooter.appendChild(postActions);

          cardRight.appendChild(cardFooter);

          cardBody.appendChild(cardLeft);
          cardBody.appendChild(cardRight);

          cardContainer.appendChild(cardBody);

          // ======================================================================================
          if (
            localStorage.getItem("profileNav") === "pending" &&
            localStorage.getItem("newsfeed") === "profile"
          ) {
            const zContainer = document.createElement("div");
            zContainer.classList.add("z");

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Delete";

            zContainer.appendChild(btnDelete);

            cardContainer.appendChild(zContainer);

            btnDelete.addEventListener("click", async () => {
              const c = confirm("Are you sure you want to delete this post?");
              if (!c) {
                return;
              }

              if (post.withImg) {
                const imgFolderRef = storageRef(
                  storage,
                  `posts/${post.userId}/${post.postId}`
                );
                const imgList = await listAll(imgFolderRef);
                const deletePromises = imgList.items.map((item) =>
                  deleteObject(item)
                );
                await Promise.all(deletePromises);
              }

              await remove(
                ref(database, `posts/${post.userId}/${post.postId}`)
              );

              cardContainer.removeChild(cardBody);
              cardContainer.removeChild(zContainer);

              // displayBlogs();
            });
          }
          // ======================================================================================

          sendIcon.addEventListener("click", async () => {
            const commentContent = commentInput.value.trim();
            if (commentContent) {
              const commentRef = ref(
                database,
                `posts/${post.userId}/${post.postId}/comments`
              );
              const newCommentRef = push(commentRef);
              const commentID = newCommentRef.key;

              const newComment = {
                commentContent: commentContent,
                userID: userID,
                userFName: userData.fName,
                userLName: userData.lName,
                profileUrl: userData.profileUrl,
              };

              await set(newCommentRef, newComment);

              createPostCommentCard(newComment);

              commentInput.value = "";
            }
          });

          footerIcon.addEventListener("click", () => {
            if (!userID) {
              alert("Please log in to react to posts.");
              return;
            }

            const postRef = ref(
              database,
              `posts/${post.userId}/${post.postId}`
            );

            get(postRef).then((snapshot) => {
              const postData = snapshot.val();
              const reactsUsers = postData.reactsUsers || {};
              const hasReacted = !!reactsUsers[userID];

              if (hasReacted) {
                postData.postReacts = postData.postReacts - 1;
                delete reactsUsers[userID];
              } else {
                postData.postReacts = postData.postReacts + 1;
                reactsUsers[userID] = true;
              }

              postData.reactsUsers = reactsUsers;

              set(postRef, postData)
                .then(() => {
                  footerIcon.src = hasReacted
                    ? "./../media/icons/icons8-heart-50.png"
                    : "./../media/icons/icons8-heart-50-red.png";
                  iconCount.textContent = postData.postReacts;
                })
                .catch((error) => {
                  console.error("Error updating post reacts:", error);
                });
            });
          });
        });

        document
          .querySelectorAll(".post-comment-img")
          .forEach((commentIcon) => {
            commentIcon.addEventListener("click", displayPostComments);
          });
        // adjustComment();
      });
    };
    // DISPLAY BLOGS END =================================================================================================================================

    // DISPLAY STORIES ===============================================================================================================================
    let unsubscribeStory;

    function displayStories() {
      const storyCardContainer = document.querySelector(
        ".story-card-container"
      );
      const storiesRef = ref(database, "stories");
      const sortedStoriesQuery = query(storiesRef, orderByChild("date"));

      unsubscribeStory = onValue(sortedStoriesQuery, async (snapshot) => {
        if (unsubscribeStory) {
          unsubscribeStory();
        }

        let storiesData = snapshot.val();
        storyCardContainer.innerHTML = "";

        if (localStorage.getItem("newsfeed") === "profile") {
          storiesData = { [userID]: storiesData[userID] };
        }

        const allStories = [];
        for (let userId in storiesData) {
          const userSnapshot = await get(ref(database, `users/${userId}`));
          const userSnapshotData = userSnapshot.val();

          if (!userSnapshotData.restricted) {
            for (let storyID in storiesData[userId]) {
              const story = storiesData[userId][storyID];

              let approveCondition;

              if (
                localStorage.getItem("profileNav") === "pending" &&
                localStorage.getItem("newsfeed") === "profile"
              ) {
                approveCondition = !story.approved && !story.archived;
              } else {
                approveCondition = story.approved && !story.archived;
              }

              if (approveCondition) {
                allStories.push({
                  userId: userId,
                  storyID: storyID,
                  title: story.title,
                  content: story.content,
                  date: story.date,
                  userFName: userSnapshotData.fName,
                  userLName: userSnapshotData.lName,
                  profileUrl: userSnapshotData.profileUrl
                    ? userSnapshotData.profileUrl
                    : "./../media/images/default-profile.png",
                });
              }
            }
          }
        }

        allStories.sort((a, b) => new Date(b.date) - new Date(a.date));

        allStories.forEach((story) => {
          const storyBodyContainer = document.createElement("div");
          storyBodyContainer.classList.add("story-body-container");

          const storyTopContainer = document.createElement("div");
          storyTopContainer.classList.add("story-top-container");

          const storyHeader = document.createElement("div");
          storyHeader.classList.add("story-header");

          const userImage = document.createElement("img");
          userImage.src = story.profileUrl;

          const userInfo = document.createElement("div");

          const userName = document.createElement("h3");
          userName.textContent = `${story.userFName} ${story.userLName}`;

          const dateIconContainer = document.createElement("div");
          dateIconContainer.style.display = "flex";

          const date = document.createElement("p");
          date.textContent = story.date;
          date.style.marginRight = "5px";

          dateIconContainer.appendChild(date);

          userInfo.appendChild(userName);
          userInfo.appendChild(dateIconContainer);

          storyHeader.appendChild(userImage);
          storyHeader.appendChild(userInfo);

          const storyTitle = document.createElement("h1");
          storyTitle.classList.add("story-title");
          storyTitle.textContent = story.title;

          const storyContent = document.createElement("p");
          storyContent.classList.add("story-content");
          storyContent.textContent = story.content;

          const showMoreButton = document.createElement("button");
          showMoreButton.classList.add("show-more-button");
          showMoreButton.textContent = "Show more";

          showMoreButton.addEventListener("click", () => {
            if (showMoreButton.textContent === "Show more") {
              storyContent.style.maxHeight = "none";
              showMoreButton.textContent = "Show less";
            } else {
              storyContent.style.maxHeight = "10.5em";
              showMoreButton.textContent = "Show more";
            }
          });

          function setInitialState() {
            let lineHeight = parseFloat(
              getComputedStyle(storyContent).lineHeight
            );

            if (isNaN(lineHeight)) {
              const tempElement = document.createElement("div");
              tempElement.style.position = "absolute";
              tempElement.style.visibility = "hidden";
              tempElement.style.whiteSpace = "nowrap";
              tempElement.style.lineHeight = "normal";
              tempElement.textContent = "A";

              document.body.appendChild(tempElement);
              lineHeight = tempElement.clientHeight;
              document.body.removeChild(tempElement);
            }

            const maxHeight = lineHeight * 7;

            if (storyContent.scrollHeight > maxHeight) {
              storyContent.style.maxHeight = `${maxHeight}px`;
              storyContent.style.overflow = "hidden";
              storyTopContainer.appendChild(showMoreButton);
            } else {
              storyContent.style.maxHeight = "none";
              showMoreButton.style.display = "none";
            }
          }

          storyTopContainer.appendChild(storyHeader);
          storyTopContainer.appendChild(storyTitle);
          storyTopContainer.appendChild(storyContent);
          storyBodyContainer.appendChild(storyTopContainer);

          storyCardContainer.appendChild(storyBodyContainer);

          // ======================================================================================
          if (
            localStorage.getItem("profileNav") === "pending" &&
            localStorage.getItem("newsfeed") === "profile"
          ) {
            const zContainer = document.createElement("div");
            zContainer.classList.add("z");

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Delete";

            zContainer.appendChild(btnDelete);

            storyCardContainer.appendChild(zContainer);

            btnDelete.addEventListener("click", async () => {
              const c = confirm("Are you sure you want to delete this story?");
              if (!c) {
                return;
              }

              await remove(
                ref(database, `stories/${story.userId}/${story.storyID}`)
              );

              storyCardContainer.removeChild(storyBodyContainer);
              storyCardContainer.removeChild(zContainer);
            });
          }
          // ======================================================================================

          setInitialState();
        });
      });
    }

    // DISPLAY STORIES END ===============================================================================================================================

    // DISPLAY POLLS ===============================================================================================================================
    const displayPollComments = (event) => {
      const commentContainer = event.target
        .closest(".card-body")
        .querySelector(".poll-content-container");
      commentContainer.classList.toggle("active");
    };

    const sanitizeKey = (key) => {
      return key
        .replace(/\./g, "_dot_")
        .replace(/#/g, "_hash_")
        .replace(/\$/g, "_dollar_")
        .replace(/\[/g, "_openBracket_")
        .replace(/\]/g, "_closeBracket_");
    };

    const desanitizeKey = (key) => {
      return key
        .replace(/_dot_/g, ".")
        .replace(/_hash_/g, "#")
        .replace(/_dollar_/g, "$")
        .replace(/_openBracket_/g, "[")
        .replace(/_closeBracket_/g, "]");
    };

    const handlePollVote = async (userId, pollId, selectedOption) => {
      const sanitizedOption = sanitizeKey(selectedOption);

      const userVoteRef = ref(
        database,
        `polls/${userId}/${pollId}/votes/${userID}`
      );

      const userVoteSnapshot = await get(userVoteRef);
      const previousVote = userVoteSnapshot.val();

      if (previousVote) {
        const sanitizedPreviousVote = sanitizeKey(previousVote);
        const previousOptionRef = ref(
          database,
          `polls/${userId}/${pollId}/options/${sanitizedPreviousVote}`
        );
        const previousOptionSnapshot = await get(previousOptionRef);
        const previousOptionCount = previousOptionSnapshot.val();
        await set(previousOptionRef, previousOptionCount - 1);

        const previousOptionSpan = document.querySelector(
          `#option-${CSS.escape(sanitizedPreviousVote)} .poll-votes`
        );
        previousOptionSpan.textContent = previousOptionCount - 1;
      }

      const selectedOptionRef = ref(
        database,
        `polls/${userId}/${pollId}/options/${sanitizedOption}`
      );
      const selectedOptionSnapshot = await get(selectedOptionRef);
      const selectedOptionCount = selectedOptionSnapshot.val();
      await set(selectedOptionRef, selectedOptionCount + 1);

      const selectedOptionSpan = document.querySelector(
        `#option-${CSS.escape(sanitizedOption)} .poll-votes`
      );
      selectedOptionSpan.textContent = selectedOptionCount + 1;

      await set(userVoteRef, selectedOption);
    };

    let unsubscribe;

    const displayPolls = () => {
      const pollCardContainer = document.querySelector(".poll-card-container");

      const pollsRef = ref(database, "polls");

      const sortedPollsQuery = query(pollsRef, orderByChild("date"));

      unsubscribe = onValue(sortedPollsQuery, async (snapshot) => {
        if (unsubscribe) {
          unsubscribe();
        }

        let pollsData = snapshot.val();
        pollCardContainer.innerHTML = "";

        if (localStorage.getItem("newsfeed") === "profile") {
          pollsData = { [userID]: pollsData[userID] };
        }

        const allPolls = [];

        for (let userId in pollsData) {
          const userSnapshot = await get(ref(database, `users/${userId}`));
          const userSnapshotData = userSnapshot.val();

          if (!userSnapshotData.restricted) {
            for (let pollId in pollsData[userId]) {
              const poll = pollsData[userId][pollId];

              let approveCondition;

              if (
                localStorage.getItem("profileNav") === "pending" &&
                localStorage.getItem("newsfeed") === "profile"
              ) {
                approveCondition = !poll.approved && !poll.archived;
              } else {
                approveCondition = poll.approved && !poll.archived;
              }

              if (approveCondition) {
                const commentsRef = ref(
                  database,
                  `polls/${userId}/${pollId}/comments`
                );

                const commentsSnapshot = await get(commentsRef);
                const commentsData = commentsSnapshot.val();
                const commentsArray = [];

                if (commentsData) {
                  for (let commentId in commentsData) {
                    const repliesRef = ref(
                      database,
                      `polls/${userId}/${pollId}/comments/${commentId}/replies`
                    );
                    const repliesSnapshot = await get(repliesRef);
                    const repliesData = repliesSnapshot.val();
                    const repliesArray = [];

                    if (repliesData) {
                      for (let replyID in repliesData) {
                        const replyUserSnapshot = await get(
                          ref(
                            database,
                            `users/${commentsData[commentId].replies[replyID].userID}`
                          )
                        );
                        const replyUserSnapshotData = replyUserSnapshot.val();

                        if (!replyUserSnapshotData.restricted) {
                          repliesArray.push({
                            replyID: replyID,
                            replyContent: repliesData[replyID].replyContent,
                            userEmail: repliesData[replyID].userEmail,
                            userFName: replyUserSnapshotData.fName,
                            userLName: replyUserSnapshotData.lName,
                            profileUrl: replyUserSnapshotData.profileUrl,
                          });
                        }
                      }
                    }

                    const commentUserSnapshot = await get(
                      ref(database, `users/${commentsData[commentId].userID}`)
                    );
                    const commentUserSnapshotData = commentUserSnapshot.val();

                    if (!commentUserSnapshotData.restricted) {
                      commentsArray.push({
                        commentId: commentId,
                        commentContent: commentsData[commentId].commentContent,
                        userFName: commentUserSnapshotData.fName,
                        userLName: commentUserSnapshotData.lName,
                        profileUrl: commentUserSnapshotData.profileUrl,
                        replies: repliesArray,
                      });
                    }
                  }
                }

                const optionSnapshot = await get(
                  ref(database, `polls/${userId}/${pollId}/options`)
                );
                const optionData = optionSnapshot.val();
                const content = [];
                const voteCounts = {};

                for (let key in optionData) {
                  if (isNaN(key)) {
                    voteCounts[key] = optionData[key];
                  } else {
                    content.push(optionData[key]);
                  }
                }

                const votesRef = await get(
                  ref(database, `polls/${userId}/${pollId}/votes`)
                );
                const votesData = votesRef.val();
                const votes = {};

                if (votesData) {
                  for (const key in votesData) {
                    if (votesData.hasOwnProperty(key)) {
                      votes[key] = votesData[key];
                    }
                  }
                }

                allPolls.push({
                  userId: userId,
                  pollId: pollId,
                  question: poll.question,
                  content: content,
                  date: poll.date,
                  pollReacts: poll.pollReacts,
                  userFName: userSnapshotData.fName,
                  userLName: userSnapshotData.lName,
                  profileUrl: userSnapshotData.profileUrl,
                  withImg: poll.withImg,
                  comments: commentsArray,
                  reactsUsers: poll.reactsUsers || {},
                  votes: votes,
                });
              }
            }
          }
        }

        allPolls.sort((a, b) => new Date(b.pollDate) - new Date(a.pollDate));

        allPolls.forEach((poll, index) => {
          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");

          const cardLeft = document.createElement("div");
          cardLeft.classList.add("card-left");

          const cardHeader = document.createElement("div");
          cardHeader.classList.add("card-header");

          const userImage = document.createElement("img");
          userImage.src = poll.profileUrl
            ? poll.profileUrl
            : "./../media/images/default-profile.png";

          const nameAndDate = document.createElement("div");
          nameAndDate.classList.add("name-date-container");
          nameAndDate.style.display = "flex";
          nameAndDate.style.flexDirection = "column";

          const username = document.createElement("h3");
          username.textContent = `${poll.userFName} ${poll.userLName}`;
          username.style.margin = "0";
          username.style.padding = "0";

          const dateIconContainer = document.createElement("div");
          dateIconContainer.style.display = "flex";

          const headerDate = document.createElement("p");
          headerDate.textContent = poll.date;
          headerDate.style.margin = "0";
          headerDate.style.marginRight = "5px";
          headerDate.style.padding = "0";

          dateIconContainer.appendChild(headerDate);

          nameAndDate.appendChild(username);
          nameAndDate.appendChild(dateIconContainer);

          cardHeader.appendChild(userImage);
          cardHeader.appendChild(nameAndDate);

          cardLeft.appendChild(cardHeader);

          // OPTIONS CONTENT ============================================================================================================
          const pollCard = document.createElement("div");

          const pollQuestion = document.createElement("h3");
          pollQuestion.classList.add("poll-question");
          pollQuestion.textContent = poll.question;

          pollCard.appendChild(pollQuestion);

          const updatePollVotes = async (userId, pollId, option, span) => {
            const sanitizedOption = sanitizeKey(option);
            const optionRef = ref(
              database,
              `polls/${userId}/${pollId}/options/${sanitizedOption}`
            );
            const optionSnapshot = await get(optionRef);
            const optionVotes = optionSnapshot.val();
            span.textContent = optionVotes || 0;
          };

          poll.content.forEach((option) => {
            const sanitizedOption = sanitizeKey(option);
            const pollOption = document.createElement("div");
            pollOption.classList.add("poll-option");
            pollOption.id = `option-${sanitizedOption}`;

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.id = sanitizedOption;
            radio.classList.add("poll-radio");
            radio.name = `poll-${poll.pollId}`;
            radio.value = option;

            if (poll.votes[userID] === option) {
              radio.checked = true;
            }

            const label = document.createElement("label");
            label.htmlFor = sanitizedOption;
            label.textContent = option;

            const span = document.createElement("span");
            span.classList.add("poll-votes");

            updatePollVotes(poll.userId, poll.pollId, option, span);

            pollOption.appendChild(radio);
            pollOption.appendChild(label);
            pollOption.appendChild(span);

            pollCard.appendChild(pollOption);

            radio.addEventListener("change", () =>
              handlePollVote(poll.userId, poll.pollId, option)
            );
          });

          cardLeft.appendChild(pollCard);

          // OPTIONS CONTENT END  ============================================================================================================

          const cardRight = document.createElement("div");
          cardRight.classList.add("poll-bottom-container");

          const commentContentContainer = document.createElement("div");
          commentContentContainer.classList.add("poll-content-container");

          // COMMENT CONTENT
          const createCommentCard = (comment) => {
            const commentContainer = document.createElement("div");
            commentContainer.classList.add("poll-comment-card");

            const commentImg = document.createElement("img");
            commentImg.classList.add("comment-user-img");
            commentImg.src = comment.profileUrl
              ? comment.profileUrl
              : "./../media/images/default-profile.png";

            const commentContent = document.createElement("div");
            commentContent.classList.add("comment-content");

            const commentUserName = document.createElement("h4");
            commentUserName.classList.add("comment-user-name");
            commentUserName.textContent = `${comment.userFName} ${comment.userLName}`;

            const commentTextContainer = document.createElement("div");
            commentTextContainer.style.display = "flex";
            commentTextContainer.style.alignItems = "center";

            const commentP = document.createElement("p");
            commentP.style.marginRight = "10px";
            commentP.textContent = comment.commentContent;

            const replyIcon = document.createElement("img");
            replyIcon.src = "./../media/icons/icons8-left-2-100.png";
            replyIcon.alt = "reply";

            let replyInpContainer;

            replyIcon.addEventListener("click", () => {
              if (replyInpContainer) {
                replyInpContainer.remove();
                replyInpContainer = null;
              } else {
                replyInpContainer = document.createElement("div");
                replyInpContainer.classList.add("create-inp-container");
                replyInpContainer.style.display = "flex";
                replyInpContainer.style.height = "100px";

                const replyInput = document.createElement("input");
                replyInput.type = "text";
                replyInput.maxLength = "200";
                replyInput.placeholder = `Reply to ${comment.userFName} ${comment.userLName}`;

                const replySendIcon = document.createElement("img");
                replySendIcon.src = "./../media/icons/icons8-send-64.png";
                replySendIcon.alt = "send";

                replyInpContainer.appendChild(replyInput);
                replyInpContainer.appendChild(replySendIcon);
                commentContent.appendChild(replyInpContainer);

                replySendIcon.addEventListener("click", async () => {
                  const replyContent = replyInput.value.trim();

                  if (replyContent) {
                    const replyRef = ref(
                      database,
                      `polls/${poll.userId}/${poll.pollId}/comments/${comment.commentId}/replies`
                    );
                    const newReplyRef = push(replyRef);
                    const replyID = newReplyRef.key;

                    const newReply = {
                      replyContent: replyContent,
                      userID: userID,
                      userFName: userData.fName,
                      userLName: userData.lName,
                      profileUrl: userData.profileUrl,
                    };

                    await set(newReplyRef, newReply);

                    displayPolls();
                  }
                });
              }
            });

            commentTextContainer.appendChild(commentP);
            commentTextContainer.appendChild(replyIcon);

            commentContent.appendChild(commentUserName);
            commentContent.appendChild(commentTextContainer);

            commentContainer.appendChild(commentImg);
            commentContainer.appendChild(commentContent);

            commentContentContainer.appendChild(commentContainer);
          };

          if (poll.comments) {
            poll.comments.forEach((comment) => {
              createCommentCard(comment);

              if (comment.replies) {
                comment.replies.forEach((reply) => {
                  const replyCard = document.createElement("div");
                  replyCard.classList.add("poll-reply-card");

                  const replyUserProfile = document.createElement("img");
                  replyUserProfile.style.objectFit = "cover";
                  replyUserProfile.style.objectPosition = "center";
                  replyUserProfile.src = reply.profileUrl
                    ? reply.profileUrl
                    : "./../media/images/default-profile.png";

                  const pollReplyContent = document.createElement("div");
                  pollReplyContent.classList.add("poll-reply-content");

                  const replyUserName = document.createElement("h4");
                  replyUserName.classList.add("poll-reply-user-name");
                  replyUserName.textContent = `${reply.userFName} ${reply.userLName}`;

                  const replyText = document.createElement("p");
                  replyText.textContent = reply.replyContent;

                  pollReplyContent.appendChild(replyUserName);
                  pollReplyContent.appendChild(replyText);

                  replyCard.appendChild(replyUserProfile);
                  replyCard.appendChild(pollReplyContent);

                  commentContentContainer.appendChild(replyCard);
                });
              }
            });
          }
          // COMMENT CONTENT END

          cardRight.appendChild(commentContentContainer);

          const cardFooter = document.createElement("div");
          cardFooter.classList.add("card-footer");

          const iconContainer = document.createElement("div");

          const commentInput = document.createElement("input");
          commentInput.type = "text";
          commentInput.id = "inp-comment";
          commentInput.classList.add("inp-comment");
          commentInput.placeholder = "Add a comment";

          const sendIcon = document.createElement("img");
          sendIcon.src = "./../media/icons/icons8-send-32.png";
          sendIcon.alt = "send";
          sendIcon.classList.add("send-icon");

          iconContainer.appendChild(commentInput);
          iconContainer.appendChild(sendIcon);

          const pollActions = document.createElement("div");
          pollActions.classList.add("poll-actions");

          const commentIcon = document.createElement("img");
          commentIcon.src = "./../media/icons/icons8-comment-96.png";
          commentIcon.alt = "comment";
          commentIcon.id = "poll-comment-img";
          commentIcon.classList.add("poll-comment-img");
          commentIcon.dataset.index = index;

          const commentLabel = document.createElement("label");
          commentLabel.htmlFor = "poll-comment-img";
          commentLabel.textContent = poll.comments.reduce(
            (total, comment) =>
              total + 1 + (comment.replies ? comment.replies.length : 0),
            0
          );

          const footerIcon = document.createElement("img");
          footerIcon.src =
            poll.reactsUsers && userID && poll.reactsUsers[userID]
              ? "./../media/icons/icons8-heart-50-red.png"
              : "./../media/icons/icons8-heart-50.png";
          footerIcon.alt = "icon";
          footerIcon.classList.add("footer-icon");
          footerIcon.id = "poll-heart-img";

          const iconCount = document.createElement("label");
          iconCount.textContent = poll.pollReacts;
          iconCount.htmlFor = "poll-heart-img";

          pollActions.appendChild(commentIcon);
          pollActions.appendChild(commentLabel);
          pollActions.appendChild(footerIcon);
          pollActions.appendChild(iconCount);

          cardFooter.appendChild(iconContainer);
          cardFooter.appendChild(pollActions);

          cardRight.appendChild(cardFooter);

          cardBody.appendChild(cardLeft);
          cardBody.appendChild(cardRight);

          pollCardContainer.appendChild(cardBody);

          // ======================================================================================
          if (
            localStorage.getItem("profileNav") === "pending" &&
            localStorage.getItem("newsfeed") === "profile"
          ) {
            const zContainer = document.createElement("div");
            zContainer.classList.add("z");

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Delete";

            zContainer.appendChild(btnDelete);

            pollCardContainer.appendChild(zContainer);

            btnDelete.addEventListener("click", async () => {
              const c = confirm("Are you sure you want to delete this poll?");
              if (!c) {
                return;
              }

              await remove(
                ref(database, `polls/${poll.userId}/${poll.pollId}`)
              );

              pollCardContainer.removeChild(cardBody);
              pollCardContainer.removeChild(zContainer);
            });
          }
          // ======================================================================================

          sendIcon.addEventListener("click", async () => {
            const commentContent = commentInput.value.trim();
            if (commentContent) {
              const commentRef = ref(
                database,
                `polls/${poll.userId}/${poll.pollId}/comments`
              );
              const newCommentRef = push(commentRef);
              const commentID = newCommentRef.key;

              const newComment = {
                commentContent: commentContent,
                userID: userID,
                userFName: userData.fName,
                userLName: userData.lName,
                profileUrl: userData.profileUrl,
              };

              await set(newCommentRef, newComment);

              createCommentCard(newComment);

              commentInput.value = "";
            }
          });

          footerIcon.addEventListener("click", () => {
            if (!userID) {
              alert("Please log in to react to polls.");
              return;
            }

            const pollRef = ref(
              database,
              `polls/${poll.userId}/${poll.pollId}`
            );

            get(pollRef).then((snapshot) => {
              const pollData = snapshot.val();
              const reactsUsers = pollData.reactsUsers || {};
              const hasReacted = !!reactsUsers[userID];

              if (hasReacted) {
                pollData.pollReacts = pollData.pollReacts - 1;
                delete reactsUsers[userID];
              } else {
                pollData.pollReacts = pollData.pollReacts + 1;
                reactsUsers[userID] = true;
              }

              pollData.reactsUsers = reactsUsers;

              set(pollRef, pollData)
                .then(() => {
                  footerIcon.src = hasReacted
                    ? "./../media/icons/icons8-heart-50.png"
                    : "./../media/icons/icons8-heart-50-red.png";
                  iconCount.textContent = pollData.pollReacts;
                })
                .catch((error) => {
                  console.error("Error updating poll reacts:", error);
                });
            });
          });
        });

        document
          .querySelectorAll(".poll-comment-img")
          .forEach((commentIcon) => {
            commentIcon.addEventListener("click", displayPollComments);
          });
      });
    };
    // DISPLAY POLLS END ===============================================================================================================================

    const btnProfile = document.querySelector(".btn-community-profile");
    const btnBlogs = document.querySelector(".btn-blogs");
    const btnStory = document.querySelector(".btn-story");
    const btnPolls = document.querySelector(".btn-polls");

    const cardContainer = document.querySelector(".card-container");
    const storyCardContainer = document.querySelector(".story-card-container");
    const pollCardContainer = document.querySelector(".poll-card-container");
    const profileContainer = document.querySelector(
      ".community-profile-container"
    );

    const btnAddContainer = document.querySelector(".add-btn-container");
    const btnAddBlog = document.querySelector(".btn-add-blog");
    const btnAddStory = document.querySelector(".add-container .btn-add-story");
    const btnAddPoll = document.querySelector(".add-container .btn-add-poll");

    const btnProfilePosts = document.getElementById("community-profile-posts");
    const btnProfilePending = document.getElementById(
      "community-profile-pending"
    );

    const handleNewsfeed = () => {
      const newsfeed = localStorage.getItem("newsfeed") || "blogs";

      profileContainer.style.display = "none";
      cardContainer.innerHTML = "";
      storyCardContainer.innerHTML = "";
      pollCardContainer.innerHTML = "";

      btnProfile.style.color = "#fff";
      btnBlogs.style.color = "#fff";
      btnStory.style.color = "#fff";
      btnPolls.style.color = "#fff";

      btnAddContainer.style.display = "block";
      btnAddBlog.style.display = "none";
      btnAddStory.style.display = "none";
      btnAddPoll.style.display = "none";

      if (newsfeed === "polls") {
        btnPolls.style.color = "var(--color-main-black)";
        btnAddPoll.style.display = "block";
        if (btnAddContainer.classList.contains("active")) {
          btnAddContainer.classList.toggle("active");
        }
        displayPolls();
      } else if (newsfeed === "stories") {
        btnStory.style.color = "var(--color-main-black)";
        btnAddStory.style.display = "block";
        if (btnAddContainer.classList.contains("active")) {
          btnAddContainer.classList.toggle("active");
        }
        displayStories();
      } else if (newsfeed === "profile") {
        const profileNav = localStorage.getItem("profileNav") || "posts";

        if (profileNav === "pending") {
          btnProfilePosts.style.color = "#000";
          btnProfilePending.style.color = "var(--color-main-purple-2)";
        } else {
          btnProfilePending.style.color = "#000";
          btnProfilePosts.style.color = "var(--color-main-purple-2)";
        }

        btnProfile.style.color = "var(--color-main-black)";
        profileContainer.style.display = "block";
        btnAddContainer.style.display = "none";
        displayBlogs();
        displayStories();
        displayPolls();
      } else {
        btnBlogs.style.color = "var(--color-main-black)";
        btnAddBlog.style.display = "block";
        if (btnAddContainer.classList.contains("active")) {
          btnAddContainer.classList.toggle("active");
        }
        displayBlogs();
      }
    };

    handleNewsfeed();

    document
      .getElementById("btn-community-profile-edit")
      .addEventListener(
        "click",
        () => (window.location.href = "./profile.html")
      );

    btnProfilePosts.addEventListener("click", () => {
      localStorage.setItem("profileNav", "posts");
      handleNewsfeed();
    });

    btnProfilePending.addEventListener("click", () => {
      localStorage.setItem("profileNav", "pending");
      handleNewsfeed();
    });

    btnProfile.addEventListener("click", () => {
      localStorage.setItem("newsfeed", "profile");
      handleNewsfeed();
    });

    btnBlogs.addEventListener("click", () => {
      localStorage.setItem("newsfeed", "blogs");
      handleNewsfeed();
    });

    btnStory.addEventListener("click", () => {
      localStorage.setItem("newsfeed", "stories");
      handleNewsfeed();
    });

    btnPolls.addEventListener("click", () => {
      localStorage.setItem("newsfeed", "polls");
      handleNewsfeed();
    });
    // });

    // INSERT BUTTON NAV =================================================================================================================================
    const insertButtonNav = () => {
      const newPostContainer = document.querySelector(".insert-post-container");
      const newPostOverlay = document.querySelector(".insert-post-overlay");
      const newStoryOverlay = document.querySelector(".insert-story-overlay");
      const newPollOverlay = document.querySelector(".insert-poll-overlay");

      const newStoryContainer = document.querySelector(".story-post-container");
      const newPollContainer = document.querySelector(".poll-post-container");

      const imageInput = document.querySelector(".inp-insert-img-post");
      const postContent = document.querySelector(".inp-insert-post");

      btnAddBlog.addEventListener("click", () => {
        newPostContainer.style.display = "block";
        newPostOverlay.style.display = "block";
        imageInput.value = "";
        postContent.value = "";
        document.body.style.overflow = "hidden";
      });

      document
        .querySelector(".insert-post-container .btn-post-close")
        .addEventListener("click", () => {
          newPostContainer.style.display = "none";
          newPostOverlay.style.display = "none";
          document.body.style.overflow = "auto";
        });

      btnAddStory.addEventListener("click", () => {
        newStoryContainer.style.display = "block";
        newStoryOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
        document.body.style.overflow = "auto";
      });

      document
        .querySelector(".story-post-container .btn-post-close")
        .addEventListener("click", () => {
          newStoryContainer.style.display = "none";
          newStoryOverlay.style.display = "none";
          document.body.style.overflow = "hidden";
          document.body.style.overflow = "auto";
        });

      btnAddPoll.addEventListener("click", () => {
        newPollContainer.style.display = "block";
        newPollOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
        document.body.style.overflow = "auto";
      });

      document
        .querySelector(".poll-post-container .btn-poll-close")
        .addEventListener("click", () => {
          newPollContainer.style.display = "none";
          newPollOverlay.style.display = "none";
          document.body.style.overflow = "hidden";
          document.body.style.overflow = "auto";
        });

      document.querySelector(".btn-add").addEventListener("click", () => {
        document.querySelector(".add-btn-container").classList.toggle("active");
      });
    };

    insertButtonNav();
  } else {
    landingPage.style.display = "flex";
    mainContainer.style.display = "none";

    console.log(1234234);

    landingPage
      .querySelector(".btn-join-community")
      .addEventListener("click", () => {
        window.location.href = "./login-signup.html";
      });
  }
});

// INSERT BUTTON NAV END =================================================================================================================================

document.addEventListener("headerLoaded", () => {
  // const btnNav = document.querySelector(".menu-nav .btn-community");
  // btnNav.style.background = "rgba(0, 0, 0, 0.5)";
  // btnNav.style.color = "white";
  document.querySelector(".header-nav .btn-community").style.color =
    "var(--color-main-purple-2)";
});
