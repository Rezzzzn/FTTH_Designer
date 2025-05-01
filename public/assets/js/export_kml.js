function sendToKML() {
    console.log("Export KML diklik!");

    const projectId = <%- JSON.stringify(project.project_id) %>; // Pastikan projectId sudah ada di template

    // Ambil data segmen dari API
    fetch(`/project/${projectId}/segments`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Gagal mengambil data segmen");
            }
            return res.json();
        })
        .then(data => {
            console.log("Data BOQ:", data);

            if (!data.segments || data.segments.length === 0) {
                alert("Tidak ada data segmen untuk diekspor!");
                return;
            }

            // Gabungkan semua markers dan polylines dari semua segmen
            let allMarkers = [];
            let allPolylines = [];

            data.segments.forEach(segment => {
                if (Array.isArray(segment.markers)) {
                    segment.markers.forEach(([lat, lng]) => {
                        allMarkers.push({ lat, lng });
                    });
                }

                if (Array.isArray(segment.polyline)) {
                    allPolylines.push(segment.polyline.map(([lat, lng]) => ({ lat, lng })));
                }
            });

            console.log("Semua Marker:", allMarkers);
            console.log("Semua Polyline:", allPolylines);

            // Membuat Placemark untuk setiap marker
            let placemarks = allMarkers.map((marker, index) => `
                <Placemark>
                    <name>Marker ${index + 1}</name>
                    <Point>
                        <coordinates>${marker.lng},${marker.lat},0</coordinates>
                    </Point>
                </Placemark>`).join("\n");

            // Membuat LineString untuk setiap polyline
            let lineStrings = allPolylines.map((polyline, index) => {
                let coordinates = polyline.map(point => `${point.lng},${point.lat},0`).join(" ");
                return `
                <Placemark>
                    <name>Polyline ${index + 1}</name>
                    <LineString>
                        <coordinates>${coordinates}</coordinates>
                    </LineString>
                </Placemark>`;
            }).join("\n");

            // Membuat konten KML
            let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    <name>${data.projectName || 'Exported Map Data'}</name>
                    ${placemarks}
                    ${lineStrings}
                </Document>
            </kml>`;

            // Mengunduh file KML
            let blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
            let a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${data.projectName || "map_export"}.kml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log("Export berhasil!");
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Terjadi kesalahan saat mengekspor data!");
        });
}
