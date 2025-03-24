let map;
let markers = [];
let polylines = [];
let polylineCoordinates = [];
let currentPolyline = null;
let isDrawingPolyline = false;

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

    controlButtonMarker.addEventListener("click", () => {
        isDrawingPolyline = false;
        finishButton.style.display = "none";
        google.maps.event.addListener(map, "click", addMarker);
    });

    controlButtonPolyline.addEventListener("click", () => {
        isDrawingPolyline = true;
        finishButton.style.display = "block";
        google.maps.event.addListener(map, "click", addPolylinePoint);
    });

    finishButton.addEventListener("click", () => {
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
        finishButton.style.display = "none";
    });
}

function addMarker(event) {
    let marker = new google.maps.Marker({
        position: event.latLng,
        map: map,
    });
    markers.push(marker);
}

function addPolylinePoint(event) {
    polylineCoordinates.push(event.latLng);
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

function calculateTotalLength() {
    let totalLength = 0;
    polylines.forEach(polyline => {
        let path = polyline.getPath().getArray();
        for (let i = 0; i < path.length - 1; i++) {
            totalLength += google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
        }
    });
    return Math.round(totalLength);
}

document.addEventListener("DOMContentLoaded", () => {
    let saveButton = document.getElementById("saveProject");
    if (saveButton) {
        saveButton.addEventListener("click", () => {
            if (markers.length < 2) {
                alert("Minimal harus ada 2 tiang!");
                return;
            }
            
            let start = markers[0].getPosition().toJSON();
            let end = markers[markers.length - 1].getPosition().toJSON();
            
            // Ambil koordinat semua marker
            let markersData = markers.map(marker => marker.getPosition().toJSON());
            
            // Ambil koordinat semua polyline
            let polylineData = polylines.map(polyline => 
                polyline.getPath().getArray().map(point => point.toJSON())
            );

            let data = {
                tiang: markers.length,
                kabel: calculateTotalLength(),
                start: start,
                end: end,
                markers: markersData, // Simpan semua marker sebagai array lat lng
                polyline: polylineData // Simpan polyline ke localStorage
            };

            fetch("/save-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(result => {
                console.log("Respon dari server:", result);
    
                let tiangCount = document.getElementById("tiangCount");
                let kabelLength = document.getElementById("kabelLength");
                let longDistance = document.getElementById("longDistance");
    
                if (tiangCount) tiangCount.innerText = data.tiang;
                if (kabelLength) kabelLength.innerText = data.kabel + " m";
                if (longDistance) longDistance.innerText = data.kabel + " m";
    
                // Simpan data ke localStorage
                localStorage.setItem("boqData", JSON.stringify(data));
    
                alert("Data berhasil disimpan!");
                window.location.href = "boq.html";
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Gagal menyimpan proyek.");
            });
        });
    }
});


   
 