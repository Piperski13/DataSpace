document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("file-list__delete")) return;

  const fileId = e.target.dataset.fileId;
  if (!fileId) return;

  const confirmed = confirm("Obrisati dokument?");
  if (!confirmed) return;

  try {
    const res = await fetch(`/records/delete-file/${fileId}`, {
      method: "POST",
    });

    if (res.ok) {
      e.target.closest("li").remove();
    } else {
      alert("Greška pri brisanju fajla.");
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
});
