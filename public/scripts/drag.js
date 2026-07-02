const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const files = e.dataTransfer.files;

  if (files.length > 3) {
    alert("You can only upload a maximum of 3 files.");
    return;
  }

  fileInput.files = files;
  showFileName(files);
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 3) {
    alert("You can only upload a maximum of 3 files.");
    fileInput.value = ""; 
    dropZone.textContent = "Drop files here or click to upload"; 
    return;
  }

  if (fileInput.files.length > 0) {
    showFileName(fileInput.files);
  }
});

function showFileName(files) {
  if (files.length === 1) {
    dropZone.textContent = files[0].name;
  } else {
    dropZone.textContent = `${files.length} files selected`;
  }
}
