/**
 * GOOGLE APPS SCRIPT UPLOAD BRIDGE UNTUK SISTEM ARSIP LHP IRBAN III
 * 
 * Mengapa script ini dibutuhkan?
 * Google Cloud Service Account memiliki kuota penyimpanan 0 byte di Google Drive personal (@gmail.com).
 * Script ini bertindak sebagai jembatan yang berjalan menggunakan akun Google Drive pemilik (15 GB kuota),
 * sehingga upload file dari web aplikasi selalu berhasil 100% tanpa kendala kuota.
 * 
 * PANDUAN PEMASANGAN (HANYA 1 - 2 MENIT):
 * 1. Buka browser dan login ke akun Google pemilik Drive (misal: inspekturpembantuirban3@gmail.com).
 * 2. Buka link: https://script.google.com/home/start
 * 3. Klik tombol "+ Proyek Baru" (New Project).
 * 4. Beri nama proyek di kiri atas: "Bridge Sistem Arsip".
 * 5. Hapus semua teks di editor, lalu salin dan tempelkan seluruh kode di bawah ini.
 * 6. Klik ikon Disket / Simpan (Ctrl + S).
 * 7. Klik tombol biru "Terapkan" (Deploy) di kanan atas > pilih "Penerapan baru" (New deployment).
 * 8. Klik ikon gerigi di sebelah 'Pilih jenis' > pilih "Aplikasi web" (Web app).
 * 9. Konfigurasikan:
 *    - Deskripsi: Upload Bridge
 *    - Jalankan sebagai (Execute as): "Saya" / Me (akun email Anda)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" / Anyone
 * 10. Klik "Terapkan" (Deploy).
 * 11. Google akan meminta izin (Authorize access) -> Pilih akun Anda -> Klik Advanced / Lanjutan -> Klik "Buka Bridge Sistem Arsip (tidak aman)" -> Klik Izinkan / Allow.
 * 12. Salin URL Aplikasi Web yang berakhiran "/exec".
 * 13. Buka file `.env.local` pada aplikasi ini, dan tambahkan baris berikut:
 *     GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycb.../exec"
 * 14. Restart server (npm run dev), dan fitur upload akan langsung aktif dan lancar!
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Tidak ada data yang dikirim"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'upload';

    // 1. AKSI UPLOAD FILE
    if (action === 'upload') {
      var targetFolderId = data.folderId;
      var folder;
      
      if (targetFolderId) {
        try {
          folder = DriveApp.getFolderById(targetFolderId);
        } catch (fErr) {
          folder = DriveApp.getRootFolder();
        }
      } else {
        folder = DriveApp.getRootFolder();
      }

      var decodedBytes = Utilities.base64Decode(data.base64);
      var blob = Utilities.newBlob(decodedBytes, data.mimeType || 'application/octet-stream', data.fileName);
      var createdFile = folder.createFile(blob);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        id: createdFile.getId(),
        name: createdFile.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. AKSI HAPUS FILE (PINDAHKAN KE TRASH)
    if (action === 'delete') {
      var fileToDelete = DriveApp.getFileById(data.fileId);
      fileToDelete.setTrashed(true);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "File berhasil dipindahkan ke sampah"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. AKSI GANTI NAMA (RENAME)
    if (action === 'rename') {
      var fileToRename = DriveApp.getFileById(data.fileId);
      fileToRename.setName(data.newName);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        newName: data.newName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. AKSI PINDAH FOLDER (MOVE)
    if (action === 'move') {
      var fileToMove = DriveApp.getFileById(data.fileId);
      var destFolder = data.destinationFolderId ? DriveApp.getFolderById(data.destinationFolderId) : DriveApp.getRootFolder();
      fileToMove.moveTo(destFolder);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "File berhasil dipindahkan",
        destinationFolderId: destFolder.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. AKSI BUAT FOLDER BARU (CREATE FOLDER)
    if (action === 'createFolder') {
      var parentFolder = data.parentId ? DriveApp.getFolderById(data.parentId) : DriveApp.getRootFolder();
      var newFolder = parentFolder.createFolder(data.name);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        id: newFolder.getId(),
        name: newFolder.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Aksi tidak dikenali: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Sistem Arsip Upload Bridge"
  })).setMimeType(ContentService.MimeType.JSON);
}
