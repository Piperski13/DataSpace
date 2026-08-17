const visibilitySelect = document.getElementById("visibility");
const visibilityDescription = document.getElementById("visibility-description");

function updateVisibilityDescription() {
  if (visibilitySelect.value === "private") {
    visibilityDescription.textContent =
      "Private workspaces are only visible to you.";
  } else {
    visibilityDescription.textContent =
      "Public workspaces can be viewed by everyone, but only you can modify them.";
  }
}

visibilitySelect.addEventListener("change", updateVisibilityDescription);

updateVisibilityDescription();
