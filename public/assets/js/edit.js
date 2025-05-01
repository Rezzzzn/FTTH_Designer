document.getElementById('profileImageInput').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
        const response = await fetch('/update-profile-picture', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Foto berhasil diperbarui, lakukan refresh halaman
            
            window.location.reload();  // Halaman akan refresh secara otomatis
        } else {
            alert("Gagal update foto profil.");
        }
    } catch (error) {
        console.error("Error during profile picture update:", error);
        alert("Terjadi kesalahan saat memperbarui foto profil.");
    }
});
