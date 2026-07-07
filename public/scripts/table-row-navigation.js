document.querySelectorAll(".clickable-row").forEach((row) => {
  row.addEventListener("click", (event) => {
    if (
      event.target.closest("button") ||
      event.target.closest("a") ||
      event.target.closest("form")
    ) {
      return;
    }

    window.location.href = row.dataset.href;
  });
});
