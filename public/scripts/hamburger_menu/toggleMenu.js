//sidebar navigation
const hamburgerIcon = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");

if (hamburgerIcon && sidebar) {
  hamburgerIcon.addEventListener("click", (e) => {
    e.stopPropagation();

    hamburgerIcon.classList.toggle("active");
    sidebar.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("is-open") && !sidebar.contains(e.target)) {
      sidebar.classList.remove("is-open");
      hamburgerIcon.classList.remove("active");
    }
  });
}

//user menu - logout button sidebar
const userMenu = document.querySelector(".user-menu");
const trigger = document.querySelector(".user-menu-trigger");

if (trigger) {
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    userMenu.classList.remove("open");
  });
}