function exportToExcel() {
    console.log("Export Excel diklik!");

    // Ambil data dari localStorage
    let boqData = localStorage.getItem("boqData");

    if (!boqData) {
        alert("Tidak ada data yang ditemukan!");
        return;
    }

    let data = JSON.parse(boqData);
    console.log("Data BOQ:", data);

    // Ambil start dan end sebagai marker
    let markers = [
        { Name: "Start", Latitude: data.start.lat, Longitude: data.start.lng, Description: "Titik awal" },
        { Name: "End", Latitude: data.end.lat, Longitude: data.end.lng, Description: "Titik akhir" }
    ];

    console.log("Markers:", markers);

    // Konversi ke format array untuk SheetJS
    let excelData = [
        ["Name", "Latitude", "Longitude", "Description"], // Header
        ...markers.map(m => [m.Name, m.Latitude, m.Longitude, m.Description])
    ];

    // Buat workbook dan worksheet
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(excelData);

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, "Map Data");

    // Simpan file Excel
    XLSX.writeFile(wb, "map_export.xlsx");

    console.log("Export berhasil!");
}