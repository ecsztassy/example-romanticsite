/* =====================================================================
   KONFIGURASI CEPAT — GANTI DI SINI
   Semua hal yang perlu kamu edit (PIN, video, lagu, foto, pesan, peta)
   dikumpulkan di file ini supaya nggak perlu bongkar index.html/script.js.
   ===================================================================== */
const CONFIG = {
  // Nama pengirim dan penerima untuk tampilan halaman
  senderName: "Maboy",
  recipientName: "Rawr",

  // PIN 4 digit untuk buka lock screen
  correctPin: "0826",

  // Playlist untuk widget "Lagu Favorit Kita". Setiap item butuh file mp3
  // beneran di folder assets/music/ (WAJIB kamu tambahkan sendiri file
  // lagunya — lagu berlisensi/berbayar TIDAK bisa disertakan otomatis).
  // "cover" boleh dikosongkan "" untuk pakai cover placeholder 💿.
  playlist: [
    {
      title: "Stupid Song",
      artist: "Olivia Rodrigo",
      src: "assets/music/Olivia Rodrigo - stupid song .mp3",
      cover: "assets/cover/olivia.jpg"
    },
    {
      title: "What's wrong with me ",
      artist: "Olivia Rodrigo, Robert Smith",
      src: "assets/music/Olivia Rodrigo, Robert Smith - what’s wrong with me .mp3",
      cover: "assets/cover/olivia.jpg"
    },
    {
      title: "Drop Dead",
      artist: "Olivia Rodrigo",
      src: "assets/music/Olivia Rodrigo - drop dead.mp3",
      cover: "assets/cover/olivia.jpg"
    },
     {
      title: "u + me = 🩷",
      artist: "Olivia Rodrigo",
      src: "assets/music/Olivia Rodrigo - u + me = love.mp3",
      cover: "assets/cover/olivia.jpg"
    },
    {
      title: "Opalite",
      artist: "Taylor Swift",
      src: "assets/music/Taylor Swift - Opalite .mp3",
      cover: "assets/cover/opalite.jpg"
    },
    {
      title: "Super Far",
      artist: "Lany",
      src: "assets/music/LANY - Super Far .mp3",
      cover: "assets/cover/superfar.jpg"
    }
  ],

  // Link/file voice note (mp3). Kosongkan "" kalau belum ada.
  voiceNoteSrc: "VoiceNote.mp3",

  // Lama preloader bunga tampil sebelum lock screen muncul (milidetik)
  preloaderDuration: 1800,

  // Pesan romantis utama di kartu "Message". Kosongkan "" untuk pakai
  // teks default yang sudah ada di index.html.
  message: "HAPPY BIRTHDAY, SAYANG! 🎉💖Selamat datang di halaman kecil ini. Isinya memang sederhana, semoga kamu suka. Dengerin Voice Note dibawah ya! ❤️",

  // Pin peta kenangan: top/left dalam persen posisi di dalam kotak peta
  memories: [
    { top: "68%", left: "15%", text: "Discord 🎮" },
    { top: "30%", left: "48%", text: "Solo Square 🎬" },
    { top: "35%", left: "85%", text: "2 lor in 🏠" }
  ],

  // Warna placeholder 5 foto polaroid (dipakai sebagai background sebelum foto dimuat)
  polaroidColors: ["#cc4a22", "#B4E4D8", "#FFE3A3", "#D9C4F0", "#FFC9A8"],

  // URL atau path foto untuk tiap polaroid (masing-masing muncul setelah digosok).
  // Taruh file foto di folder yang sama, atau pakai URL langsung.
  // Kalau kosong (""), akan tampil emoji 📷 sebagai placeholder.
  polaroidPhotos: ["assets/momen/momen1.jpg", "assets/momen/momen2.jpg", "assets/momen/momen3.jpg", "assets/momen/momen4.jpg", "assets/momen/momen5.jpg"],

birthday:"2026-08-26",
  // Alasan sayang: bebas berapa banyak, muncul acak tiap kali kartu di-tap
  reasons: [
    "Karena entah kenapa, sesulit apa pun hariku, lihat kamu senyum rasanya selalu cukup buat bikin semuanya terasa lebih baik 🥹",
    "Karena kamu mau dengerin semua cerita random aku, bahkan hal-hal yang sebenarnya nggak penting, tapi tetap kamu dengerin sampai habis",
    "Karena cara kamu peduli selalu sederhana, tapi justru dari hal-hal kecil itu aku tahu kalau aku berarti buat kamu",
    "Karena sejak kenal kamu, aku jadi pengen memperbaiki diri, bukan karena kamu pernah minta, tapi karena aku pengen jadi seseorang yang pantas buat kamu",
    "Karena sama kamu, aku nggak harus selalu bicara. Bahkan dalam diam pun, rasanya tetap nyaman karena kamu ada di sana",
    "Karena di saat aku butuh seseorang, kamu sering kali ada tanpa aku harus bilang kalau aku lagi nggak baik-baik aja"
],

  // Kuis "Seberapa Kenal Kamu Sama Aku" — ganti pertanyaan & jawaban sesuai kalian.
  // "correct" = index jawaban benar (mulai dari 0)
  quiz: [
    { question: "Apa warna favoritku?", options: ["Putih", "Cream", "Abu", "Hitam"], correct: 0 },
    { question: "Negara apa yang ingin aku kunjungi?", options: ["Jepang", "Swiss", "UK", "Prancis"], correct: 1 },
    { question: "Makanan yang paling aku suka?", options: ["Bakso", "Mie", "Pecel", "Nasi Goreng"], correct: 3 },
    { question: "Pertama kali kita ketemu di mana?", options: ["Sekolah", "Kampus", "Kerja", "Media sosial"], correct: 3 },
    { question: "Hal yang paling aku takutin?", options: ["Ketinggian", "Kecoa", "Gelap", "Air"], correct: 2 }
  ],
};

