function sendToKML() {
    console.log("Export KML diklik!");

    let boqData = localStorage.getItem("boqData");

    if (!boqData) {
        alert("Tidak ada data yang ditemukan!");
        return;
    }

    let data = JSON.parse(boqData);
    console.log("Data BOQ:", data);

    // Ambil semua marker dari data yang tersimpan
    let markers = data.markers || [];
    let polylines = data.polyline || [];

    if (markers.length === 0) {
        alert("Tidak ada marker yang tersimpan!");
        return;
    }

    console.log("Markers:", markers);
    console.log("Polylines:", polylines);

    let placemarks = markers.map((marker, index) => `
        <Placemark>
            <name>Marker ${index + 1}</name>
            <Point>
                <coordinates>${marker.lng},${marker.lat},0</coordinates>
            </Point>
        </Placemark>`).join("\n");

    let lineStrings = polylines.map((polyline, index) => {
        let coordinates = polyline.map(point => `${point.lng},${point.lat},0`).join(" ");
        return `
        <Placemark>
            <name>Polyline ${index + 1}</name>
            <LineString>
                <coordinates>${coordinates}</coordinates>
            </LineString>
        </Placemark>`;
    }).join("\n");

    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
            <name>Exported Map Data</name>
            ${placemarks}
            ${lineStrings}
        </Document>
    </kml>`;

    let blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "map_export.kml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("Export berhasil!");
}