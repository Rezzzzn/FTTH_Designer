$(document).ready(function () {
  // Saat tombol save project diklik, modal harus muncul
  $('#saveProjectlock').click(function () {
      $('#projectModal').modal('show'); 
  });

  // Saat tombol submit di dalam modal ditekan
  $('#submitProject').click(function () {
      var projectName = $('#projectName').val().trim(); // Ambil nilai dari input modal

      if (projectName) {
          alert('Project "' + projectName + '" telah disimpan!');
          $('#projectModal').modal('hide'); // Tutup modal setelah berhasil
      } else {
          alert('Harap masukkan nama project.');
      }
  });
});
