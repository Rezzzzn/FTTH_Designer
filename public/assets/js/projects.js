document.addEventListener("DOMContentLoaded", () => {
    const projectName = localStorage.getItem("latestProjectName");
    const displayElement = document.getElementById("projectNameDisplay");

    if (projectName && displayElement) {
        displayElement.textContent = `Project: ${projectName}`;
    } else {
        displayElement.textContent = "Project: (tidak ditemukan)";
    }
});