const deleteButtons = document.querySelectorAll(".file-list__delete");
const deletedFilesInput = document.querySelector("#deleted-files");

let deletedFiles = [];

deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const fileItem = button.closest(".file-list__item");
    const fileId = fileItem.dataset.fileId;

    const isDeleted = fileItem.classList.contains("file-list__item--deleted");

    if (!isDeleted) {
      fileItem.classList.add("file-list__item--deleted");

      deletedFiles.push(fileId);
      button.textContent = "Undo";
    } else {
      fileItem.classList.remove("file-list__item--deleted");

      deletedFiles = deletedFiles.filter((id) => id !== fileId);
      button.textContent = "X";
    }

    deletedFilesInput.value = JSON.stringify(deletedFiles);
  });
});
