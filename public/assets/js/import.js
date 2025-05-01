function handleImport() {
        const file = document.getElementById("fileInput").files[0];

        if (!file || !file.name.endsWith(".kml")) {
            alert("Pilih file KML yang valid.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            parseKML(e.target.result);
        };
        reader.readAsText(file);
    }

    function parseKML(kmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlText, "application/xml");
        const placemarks = xmlDoc.getElementsByTagName("Placemark");

        markers = [];
        polylines = [];

        for (let placemark of placemarks) {
            const name = placemark.getElementsByTagName("name")[0]?.textContent || "";
            const point = placemark.getElementsByTagName("Point")[0];
            const lineString = placemark.getElementsByTagName("LineString")[0];

            if (point) {
                const coords = point.getElementsByTagName("coordinates")[0].textContent.trim();
                const [lng, lat] = coords.split(",").map(Number);
                const position = new google.maps.LatLng(lat, lng);

                const marker = new google.maps.Marker({ position, map, title: name });
                markers.push(marker);
            }

            if (lineString) {
                const coordsText = lineString.getElementsByTagName("coordinates")[0].textContent.trim();
                const path = coordsText.split(/\s+/).map(coord => {
                    const [lng, lat] = coord.split(",").map(Number);
                    return new google.maps.LatLng(lat, lng);
                });

                const polyline = new google.maps.Polyline({
                    path,
                    geodesic: true,
                    strokeColor: "#FFA500",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    map
                });

                polylines.push(polyline);
            }
        }

        if (markers.length > 0) {
            map.setCenter(markers[0].getPosition());
        }

        alert("KML berhasil diimpor.");
    }

    function calculatePolylineLength(polyline) {
        const path = polyline.getPath().getArray();
        let total = 0;
        for (let i = 0; i < path.length - 1; i++) {
            total += google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
        }
        return total; // in meters
    }

    function saveToDatabase() {
        const kabel = polylines.reduce((sum, pl) => sum + calculatePolylineLength(pl), 0);
        const tiang = markers.length;

        const data = {
            name: "Imported Project " + new Date().toISOString(),
            kabel,
            tiang,
            markers: markers.map(m => ({
                lat: m.getPosition().lat(),
                lng: m.getPosition().lng()
            })),
            polylines: polylines.map(pl => ({
                path: pl.getPath().getArray().map(p => ({
                    lat: p.lat(),
                    lng: p.lng()
                }))
            }))
        };

        fetch("/projects/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
            alert("Project berhasil disimpan. ID: " + res.projectId);
        })
        .catch(err => {
            console.error(err);
            alert("Gagal menyimpan ke database.");
        });
    }