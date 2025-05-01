function sendToExcel() {
    console.log("Export Excel diklik!");

    let boqData = localStorage.getItem("boqData");

    if (!boqData) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak ada data!',
            text: 'Tidak ada data yang ditemukan!'
        });
        return;
    }

    let data = JSON.parse(boqData);
    console.log("Data BOQ:", data);

    if (!data.segments || data.segments.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak ada segment!',
            text: 'Data segment kosong!'
        });
        return;
    }

    let csvContent = "";

    data.segments.forEach((segment, index) => {
        const segmentLabel = `Segment ${String.fromCharCode(65 + index)}`; // A, B, C...

        // Markers
        csvContent += `${segmentLabel} - Markers:\n`;
        csvContent += "No, Latitude, Longitude\n";
        if (Array.isArray(segment.markers)) {
            segment.markers.forEach(([lat, lng], i) => {
                csvContent += `${i + 1}, ${lat}, ${lng}\n`;
            });
        } else {
            csvContent += "Tidak ada marker\n";
        }

        // Polyline
        csvContent += `\n${segmentLabel} - Polyline:\n`;
        csvContent += "No, Latitude, Longitude\n";
        if (Array.isArray(segment.polyline)) {
            segment.polyline.forEach(([lat, lng], j) => {
                csvContent += `${j + 1}, ${lat}, ${lng}\n`;
            });
        } else {
            csvContent += "Tidak ada polyline\n";
        }

        csvContent += "\n";
    });

    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${data.projectName || 'map_export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("Export Excel berhasil!");
}
