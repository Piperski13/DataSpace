window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  window.location.reload();
});
