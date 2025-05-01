let map;
let markers = [];
let polylines = [];
let polylineCoordinates = [];
let currentPolyline = null;
let isDrawingPolyline = false;
let mapClickListener = null;
let projectSegments = [];
let finishedMarkers = [];

fetch('/get-google-maps-api')
    .then(response => response.json())
    .then(data => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    })
    .catch(console.error);

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -7.9666204, lng: 112.6326321 },
        zoom: 12,
    });
    window.importKML = function (kmlText) {
        const parsedSegments = parseKML(kmlText);
        parsedSegments.forEach(seg => projectSegments.push(seg));
    
        // Gambar semua polyline & marker
        parsedSegments.forEach(seg => {
            // Draw polyline
            const polyline = new google.maps.Polyline({
                path: seg.polyline.map(([lat, lng]) => ({ lat, lng })),
                geodesic: true,
                strokeColor: "#FFA500",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });
            polyline.setMap(map);
            polylines.push(polyline);
    
            // Draw markers
            seg.markers.forEach(([lat, lng]) => {
                const marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map
                });
                finishedMarkers.push(marker);
            });
        });
    
        Swal.fire({ icon: "success", title: "Sukses!", text: "Import KML berhasil." });
    }
        

    let controlDiv = document.createElement("div");
    controlDiv.classList.add("map-control-container");

    let controlButtonMarker = document.createElement("button");
    controlButtonMarker.innerHTML = '<i class="material-icons">place</i>';
    controlButtonMarker.classList.add("map-control-button");
    controlButtonMarker.title = "Add Marker";
  
    let controlButtonPolyline = document.createElement("button");
    controlButtonPolyline.innerHTML = '<i class="material-icons">timeline</i>';
    controlButtonPolyline.classList.add("map-control-button");
    controlButtonPolyline.title = "Draw Polyline";
    
    let finishButton = document.createElement("button");
    finishButton.innerHTML = "Finish Polyline";
    finishButton.id = "finishButton";
    finishButton.style.display = "none";
    finishButton.classList.add("finish-button-container");

    controlDiv.appendChild(controlButtonMarker);
    controlDiv.appendChild(controlButtonPolyline);
    controlDiv.appendChild(finishButton);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    let currentClickListener = null;

function clearClickListener() {
    if (currentClickListener) {
        google.maps.event.removeListener(currentClickListener);
        currentClickListener = null;
    }
}

controlButtonMarker.addEventListener("click", () => {
    clearClickListener();
    isDrawingPolyline = false;
    finishButton.style.display = "none";
    mmapClickListener = google.maps.event.addListener(map, "click", (event) => {
        addMarker(event);
    });
});

controlButtonPolyline.addEventListener("click", () => {
    clearClickListener();
    isDrawingPolyline = true;
    finishButton.style.display = "block";

    // Reset kondisi sebelumnya biar gak double
    polylineCoordinates = [];
    if (currentPolyline) {
        currentPolyline.setMap(null);
        currentPolyline = null;
    }
    markers = [];

    currentClickListener = google.maps.event.addListener(map, "click", (event) => {
        addPolylinePoint(event.latLng);
    });
});

    function calculateLength(pathArray) {
        let length = 0;
        for (let i = 0; i < pathArray.length - 1; i++) {
            length += google.maps.geometry.spherical.computeDistanceBetween(pathArray[i], pathArray[i + 1]);
        }
        return length;
    }
    
    finishButton.addEventListener("click", () => {
        if (markers.length < 2 || polylineCoordinates.length < 2) {
            Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Minimal harus ada 2 tiang & polyline!' });
            return;
        }
    
        // Create the segment, checking that markers and polyline are unique
        const segment = {
            markers: markers.map(m => [m.getPosition().lat(), m.getPosition().lng()]),
            polyline: polylineCoordinates.map(p => [p.lat(), p.lng()]),
            tiang: markers.length,
            kabel: Math.round(calculateLength(polylineCoordinates))
        };
    
        projectSegments.push(segment);
    
        // Continue with your polyline creation
        const finishedPolyline = new google.maps.Polyline({
            path: polylineCoordinates,
            geodesic: true,
            strokeColor: "#FFA500",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        finishedPolyline.setMap(map);
        polylines.push(finishedPolyline);
    
        // Make markers permanent and avoid duplication
        markers.forEach(marker => finishedMarkers.push(marker));
    
        // Reset for next polyline
        polylineCoordinates = [];
        currentPolyline = null;
        markers = [];
        isDrawingPolyline = false;
        finishButton.style.display = "none";
    });
       
}

function addMarker(event) {
    let markerPosition = event.latLng;
    
    // Cek apakah marker sudah ada di posisi ini
    let exists = markers.some(marker => marker.getPosition().equals(markerPosition));
    
    if (exists) return;

    let marker = new google.maps.Marker({
        position: markerPosition,
        map: map,
    });

    marker.addListener("click", function () {
        if (!finishedMarkers.includes(marker)) {
            removeMarker(marker);
        }
    });

    markers.push(marker);
    updatePolylineFromMarkers();
}




function addPolylinePoint(position) {
    polylineCoordinates.push(position);

    if (currentPolyline) {
        currentPolyline.setPath(polylineCoordinates);
    } else {
        currentPolyline = new google.maps.Polyline({
            path: polylineCoordinates,
            geodesic: true,
            strokeColor: "#FFA500",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        currentPolyline.setMap(map);
    }
}

function finishPolyline() {
    if (polylineCoordinates.length > 1) {
        let polyline = new google.maps.Polyline({
            path: polylineCoordinates,
            geodesic: true,
            strokeColor: "#FFA500",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        polyline.setMap(map);
        polylines.push(polyline);
    }
    polylineCoordinates = [];
    isDrawingPolyline = false;
    currentPolyline = null;
    document.getElementById("finishButton").style.display = "none";
}


function removeMarker(marker) {
    const index = markers.indexOf(marker);
    if (index > -1) {
        marker.setMap(null);
        markers.splice(index, 1);
        updatePolylineFromMarkers();
    }
}

function updatePolylineFromMarkers() {
    // Kalau markers berubah, update polylineCoordinates
    polylineCoordinates = markers.map(marker => marker.getPosition());

    if (currentPolyline) {
        if (polylineCoordinates.length > 0) {
            currentPolyline.setPath(polylineCoordinates);
        } else {
            currentPolyline.setMap(null);
            currentPolyline = null;
        }
    }

    // Kalau mau juga hapus polylines yang sudah jadi
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = [];
}



document.addEventListener("DOMContentLoaded", () => {
    let saveButton = document.getElementById("saveProject");
    if (saveButton) {
        saveButton.addEventListener("click", () => {
            const projectName = document.getElementById("projectName").value.trim();
            if (!projectName) {
                Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Nama project harus diisi!' });
                return;
            }

            if (projectSegments.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Belum ada data proyek yang diselesaikan!' });
                return;
            }

            // Buat salinan dan pastikan setiap segment memiliki properti lengkap
            const fixedSegments = projectSegments.map(s => ({
                tiang: s.tiang || 0,
                kabel: s.kabel || 0,
                markers: Array.isArray(s.markers) ? s.markers : [],
                polyline: Array.isArray(s.polyline) ? s.polyline : []
            }));

            const totalTiang = fixedSegments.reduce((sum, s) => sum + (s.tiang || 0), 0);
            const totalKabel = fixedSegments.reduce((sum, s) => sum + (s.kabel || 0), 0);

            const data = {
                projectName,
                totalTiang,
                totalKabel,
                segments: fixedSegments
            };

            console.log('Data yang dikirim ke server:', data);

            fetch("/save-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(result => {
                console.log("Respon dari server:", result);
                localStorage.setItem("boqData", JSON.stringify(data));
                localStorage.setItem("latestProjectName", data.projectName);

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data berhasil disimpan!',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = "/boq";
                });
            })
            .catch(error => {
                console.error("Error:", error);
                Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal menyimpan proyek.' });
            });
        });
    }
});
