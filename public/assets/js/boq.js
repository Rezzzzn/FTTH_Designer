document.addEventListener("DOMContentLoaded", () => {
    let boqData = localStorage.getItem("boqData");

    if (boqData) {
        let data = JSON.parse(boqData);
        console.log("Data BOQ:", data);

        // Tampilkan di HTML
        document.getElementById("tiangCount").innerText = data.tiang;
        document.getElementById("kabelLength").innerText = data.kabel + " m";
        document.getElementById("longDistance").innerText = data.kabel + " m";
    } else {
        console.error("Tidak ada data BOQ ditemukan.");
    }
});
