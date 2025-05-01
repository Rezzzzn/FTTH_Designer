document.addEventListener("DOMContentLoaded", async () => {
    let boqData = localStorage.getItem("boqData");

    if (boqData) {
        let data = JSON.parse(boqData);
        console.log("Data BOQ:", data);

        // Set the project name
        document.getElementById("projectNameDisplay").innerText = `Project: ${data.projectName}`;

        // Fetch material prices from the server
        let tiangPrice = 0, kabelPrice = 0;
        try {
            const response = await fetch('/get-material-prices');
            const materials = await response.json();

            const tiangData = materials.find(m => m.name.toLowerCase() === "tiang");
            const kabelData = materials.find(m => m.name.toLowerCase() === "kabel");

            tiangPrice = tiangData?.price || 0;
            kabelPrice = kabelData?.price || 0;

            document.getElementById("tiangPrice").innerText = `Rp ${tiangPrice.toLocaleString()}`;
            document.getElementById("kabelPrice").innerText = `Rp ${kabelPrice.toLocaleString()}`;
        } catch (err) {
            console.error("Gagal ambil harga material:", err);
        }

        // Total gabungan
        let totalTiang = 0;
        let totalKabel = 0;

        // Container tabel-tabel
        const container = document.getElementById("tablesContainer");
        container.innerHTML = "";

        data.segments.forEach((segment, index) => {
            const segmentTiang = segment.tiang || 0;
            const segmentKabel = segment.kabel || 0;

            const segmentTotalTiang = segmentTiang * tiangPrice;
            const segmentTotalKabel = segmentKabel * kabelPrice;

            totalTiang += segmentTiang;
            totalKabel += segmentKabel;

            const segmentLabel = `Segment ${String.fromCharCode(65 + index)}`; // A, B, C...

            const card = document.createElement("div");
            card.classList.add("card", "mb-4");
            card.innerHTML = `
                <div class="card-header bg-secondary text-white">
                    <strong>${segmentLabel}</strong>
                </div>
                <div class="card-body p-0">
                    <table class="table table-bordered mb-0">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Material</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Tiang</td>
                                <td>${segmentTiang}</td>
                                <td>Pcs</td>
                                <td>Rp ${tiangPrice.toLocaleString()}</td>
                                <td>Rp ${segmentTotalTiang.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Kabel</td>
                                <td>${segmentKabel} m</td>
                                <td>Meter</td>
                                <td>Rp ${kabelPrice.toLocaleString()}</td>
                                <td>Rp ${segmentTotalKabel.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            container.appendChild(card);
        });

        // Tampilkan total keseluruhan di elemen global
        document.getElementById("tiangCount").innerText = totalTiang;
        document.getElementById("kabelLength").innerText = `${totalKabel} m`;
        document.getElementById("longDistance").innerText = `${totalKabel} m`;

        document.getElementById("tiangTotal").innerText = `Rp ${(totalTiang * tiangPrice).toLocaleString()}`;
        document.getElementById("kabelTotal").innerText = `Rp ${(totalKabel * kabelPrice).toLocaleString()}`;
    }
});
