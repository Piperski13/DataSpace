window.addEventListener("pageshow", async (event) => {
  if (!event.persisted) return;

  const response = await fetch("/auth/status", {
    credentials: "same-origin",
  });

  const { authenticated } = await response.json();

  if (!authenticated) {
    window.location.replace("/auth/login");
  }
});
