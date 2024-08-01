document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");

  loadHeader();

  function loadHeader() {
    fetch("./../html/header.html")
      .then((response) => response.text())
      .then((data) => {
        headerContainer.innerHTML = data;
        document.dispatchEvent(new Event("headerLoaded"));

        document.getElementById("logo-img").addEventListener("click", () => {
          window.location.href = "./../index.html";
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }
});
