const hamburgerIcon = document.querySelector(".hamburger");
let sidebar = document.querySelector(".sidebar");

hamburgerIcon.addEventListener("click", () => {
  hamburgerIcon.classList.toggle("active");
  sidebar.classList.toggle("is-open");
});

const userMenu = document.querySelector(".user-menu");
const trigger = document.querySelector(".user-menu-trigger");

trigger.addEventListener("click", (e) => {
  e.stopPropagation();
  userMenu.classList.toggle("open");
});

document.addEventListener("click", () => {
  userMenu.classList.remove("open");
});
