/* =====================================================================
   Semua logika interaktif ada di sini. Nilai yang bisa diedit (PIN,
   video, lagu, foto, peta) diambil dari config.js — jangan hardcode
   di file ini supaya gampang direvisi.
   ===================================================================== */

const petalLayer = document.getElementById('petalLayer');

/* ---------- FUNGSI KELOPAK BUNGA (dipakai preloader & transisi unlock) ----------
   Satu fungsi yang sama dipakai di dua tempat supaya animasinya konsisten. */
function spawnPetals(count = 24){
const emojis = [

'🌹',

'🌸',

'🌺',

'🌷',

'💮',

'🌼',

'❤️',

'🤍'

];
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'falling-petal';
    p.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    p.style.left = Math.random()*100 + '%';
    p.style.fontSize = (14 + Math.random()*16) + 'px';
    p.style.animationDuration = (1.8 + Math.random()*1.4) + 's';
    p.style.animationDelay = (Math.random()*0.35) + 's';
    petalLayer.appendChild(p);
    setTimeout(() => p.remove(), 4200);
  }
}
/* =====================================================
   FLOATING FLOWERS
===================================================== */

let dashboardFlowerInterval = null;

function startFloatingFlowers(){

    if(dashboardFlowerInterval) return;

    dashboardFlowerInterval = setInterval(() => {

        spawnPetals(2);

    }, 1800);

}

function stopFloatingFlowers(){

    clearInterval(dashboardFlowerInterval);

    dashboardFlowerInterval = null;

}
/* ---------- PRELOADER (bunga sebelum lock screen) ---------- */
const preloader = document.getElementById('preloader');
let preloaderPetalTimer;

function startPreloader(){
  // kelopak terus berjatuhan selama preloader tampil
  spawnPetals(14);
  preloaderPetalTimer = setInterval(() => spawnPetals(8), 500);

  setTimeout(() => {
    clearInterval(preloaderPetalTimer);
    preloader.classList.add('fade-out');
    setTimeout(() => { preloader.style.display = 'none'; }, 700);
  }, CONFIG.preloaderDuration);
}
window.addEventListener('DOMContentLoaded', startPreloader);

/* =====================================================================
   TRANSISI "BLOOM" — bunga mawar mekar dari tengah menutupi layar penuh,
   lalu surut lagi. Satu fungsi reusable dipakai di lock->amplop dan
   amplop->dashboard, supaya keduanya konsisten & gampang diubah bareng.
   ===================================================================== */
const roseSweepEl = document.getElementById('roseSweep');

function buildBloomRoses(){
  if(roseSweepEl.dataset.built) return;
  roseSweepEl.dataset.built = "1";
  // posisi kelopak/bunga tersebar di sekitar pusat layar, ukuran & delay
  // beda-beda supaya kelihatan "mekar" bertahap, bukan muncul serentak kaku
  const layout = [
    { top:'50%', left:'50%', rot:0,   delay:0,    size:'5.2rem' },
    { top:'30%', left:'35%', rot:-20, delay:.05,  size:'3.4rem' },
    { top:'30%', left:'65%', rot:20,  delay:.08,  size:'3.4rem' },
    { top:'68%', left:'32%', rot:15,  delay:.10,  size:'3.2rem' },
    { top:'68%', left:'68%', rot:-15, delay:.12,  size:'3.2rem' },
    { top:'50%', left:'18%', rot:-30, delay:.15,  size:'2.8rem' },
    { top:'50%', left:'82%', rot:30,  delay:.15,  size:'2.8rem' },
    { top:'18%', left:'50%', rot:0,   delay:.18,  size:'2.8rem' },
    { top:'82%', left:'50%', rot:0,   delay:.18,  size:'2.8rem' },
    { top:'40%', left:'50%', rot:10,  delay:.22,  size:'2.4rem' },
  ];
  layout.forEach(p => {
    const el = document.createElement('span');
    el.className = 'bloom-rose';
    el.textContent = '🌹';
    el.style.top = p.top;
    el.style.left = p.left;
    el.style.fontSize = p.size;
    el.style.setProperty('--rot', p.rot + 'deg');
    el.style.setProperty('--delay', p.delay + 's');
    roseSweepEl.appendChild(el);
  });
}

/**
 * Menjalankan transisi bloom: bunga mekar menutupi layar penuh, di titik
 * puncak (fullyCoveredCallback) kamu ganti konten di baliknya, lalu bunga
 * surut lagi membuka layar berikutnya.
 */
function bloomTransition(fullyCoveredCallback){
  buildBloomRoses();
  roseSweepEl.classList.remove('sweep-out');
  roseSweepEl.classList.add('sweep-in');

  setTimeout(() => {
    if(fullyCoveredCallback) fullyCoveredCallback();
    roseSweepEl.classList.remove('sweep-in');
    roseSweepEl.classList.add('sweep-out');
  }, 750);

  setTimeout(() => {
    roseSweepEl.classList.remove('sweep-out');
  }, 750 + 750);
}

/* ---------- helper: bersihkan ID YouTube/Spotify walau user paste URL lengkap ---------- */
function extractYoutubeId(input){
  if(!input) return "";
  // sudah berupa ID polos (11 karakter, tanpa slash/query)
  if(/^[a-zA-Z0-9_-]{6,15}$/.test(input) && !input.includes('/') && !input.includes('&') && !input.includes('?')) return input;
  try{
    const url = new URL(input.includes('://') ? input : 'https://' + input);
    if(url.searchParams.get('v')) return url.searchParams.get('v');
    if(url.hostname.includes('youtu.be')) return url.pathname.replace('/', '');
  }catch(e){ /* bukan URL valid, lanjut ke fallback di bawah */ }
  // fallback: ambil bagian sebelum "&" kalau user paste id+query tanpa domain
  return input.split('&')[0].split('?')[0].replace(/^v=/, '');
}
function extractSpotifyId(input){
  if(!input) return "";
  if(/^[a-zA-Z0-9]{10,25}$/.test(input)) return input; // sudah ID polos
  try{
    const url = new URL(input.includes('://') ? input : 'https://' + input);
    const parts = url.pathname.split('/').filter(Boolean); // ["track","407Lg..."]
    if(parts.length >= 2) return parts[1];
  }catch(e){ /* fallback di bawah */ }
  return input.split('?')[0].split('/').pop();
}

/* ---------- terapkan konfigurasi ke embed & audio ---------- */
window.addEventListener('DOMContentLoaded', () => {
  // Terapkan nama pengirim & penerima dari config.js
  const lockNames = document.getElementById('lockNamesLabel');
  if(lockNames) lockNames.innerHTML = `From: ${CONFIG.senderName} &middot; For: ${CONFIG.recipientName}`;

  const letterSender = document.getElementById('letterSender');
  if(letterSender) letterSender.textContent = `From: ${CONFIG.senderName}`;

  const letterRecipient = document.getElementById('letterRecipient');
  if(letterRecipient) letterRecipient.textContent = `For: ${CONFIG.recipientName}`;

const messageSig = document.getElementById("messageSignature");

if(messageSig){
    messageSig.innerHTML =
        `&mdash; untuk ${CONFIG.recipientName}, selalu 💌`;
}

  const va = document.getElementById('voiceAudio');
  if(va && CONFIG.voiceNoteSrc) va.src = CONFIG.voiceNoteSrc;

  // foto polaroid dari config.js
  document.querySelectorAll('.photo-under').forEach(el => {
    const idx = Number(el.dataset.photoIndex);
    if(CONFIG.polaroidColors[idx]) el.style.background = CONFIG.polaroidColors[idx];
    const photoSrc = CONFIG.polaroidPhotos && CONFIG.polaroidPhotos[idx];
    if(photoSrc){
      const img = document.createElement('img');
      img.src = photoSrc;
      img.alt = `Momen ${idx + 1}`;
      img.draggable = false;
      el.textContent = '';
      el.appendChild(img);
    }
  });

  // bangun pin peta kenangan dari config.js
  const mapPinsContainer = document.getElementById('mapPinsContainer');
  CONFIG.memories.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'map-pin';
    btn.style.top = m.top;
    btn.style.left = m.left;
    btn.dataset.memory = m.text;
    btn.textContent = '📍';
    mapPinsContainer.appendChild(btn);
  });
  bindMapPins();
});
const messageText = document.getElementById("romanticMessageText");

let typingTimer;

function typeMessage(text){

    if(!messageText) return;

    clearTimeout(typingTimer);

    messageText.textContent = "";

    let i = 0;

    function typing(){

        if(i < text.length){

            messageText.textContent += text.charAt(i);

            i++;

            typingTimer = setTimeout(typing,90);

        }

    }

    typing();

}
/* ---------- keypad logic ---------- */
let enteredPin = "";
const dots = document.querySelectorAll('.dot');
const dotsRow = document.getElementById('dotsRow');
const lockScreen = document.getElementById('lockScreen');
const dashboard = document.getElementById('dashboard');

document.querySelectorAll('.key-num').forEach(btn=>{
  btn.addEventListener('click', () => {
    if(enteredPin.length >= 4) return;
    enteredPin += btn.dataset.num;
    updateDots();
    if(enteredPin.length === 4){ setTimeout(checkPin, 220); }
  });
});
document.getElementById('keyDelete').addEventListener('click', () => {
  enteredPin = enteredPin.slice(0, -1);
  updateDots();
});
function updateDots(){
  dots.forEach((d,i) => d.classList.toggle('filled', i < enteredPin.length));
}
function checkPin(){
  if(enteredPin === CONFIG.correctPin){ unlockSuccess(); }
  else{ wrongPin(); }
}
function wrongPin(){
  dotsRow.classList.add('shake');
  setTimeout(() => {
    dotsRow.classList.remove('shake');
    enteredPin = "";
    updateDots();
  }, 500);
}
function unlockSuccess(){
  spawnPetals(24);
  bloomTransition(() => {
    lockScreen.style.display = 'none';
    envelopeScreen.classList.add('active');
  });
}

/* ---------- envelope (amplop) ---------- */
const envelopeScreen = document.getElementById('envelopeScreen');
const envelopeEl = document.getElementById('envelope');
const envelopeHint = document.getElementById('envelopeHint');
const waxSeal = document.getElementById('waxSeal');

function openEnvelope(){
updateBirthdayProgress();
    if(envelopeEl.classList.contains('open')) return;

    envelopeEl.classList.add('open');
    envelopeHint.style.opacity = '0';

    spawnPetals(20);

    // tunggu animasi surat selesai
    setTimeout(() => {

        bloomTransition(() => {

            // sembunyikan layar amplop
            envelopeScreen.classList.remove('active');
            envelopeScreen.style.display = "none";

            // tampilkan dashboard
dashboard.classList.add("show");
document.getElementById("musicToggle").classList.add("show");

setTimeout(() => {
    typeMessage(CONFIG.message);
}, 600);

document.body.classList.remove("locked");
document.body.style.overflowY = "auto";
document.body.style.height = "auto";

            // hilangkan transform setelah animasi selesai
            setTimeout(() => {
                dashboard.classList.add("settled");
            }, 900);

            // inisialisasi fitur dashboard
            initScratchCards();
            startFloatingFlowers();

            // putar musik
            try{
                autoPlayMusic();
            }catch(e){
                console.log(e);
            }

        });

    }, 1100);

}
envelopeEl.addEventListener('click', openEnvelope, { once:true });
if(waxSeal){ waxSeal.addEventListener('click', (e) => { e.stopPropagation(); openEnvelope(); }, { once:true }); }

/* ---------- scratch cards ---------- */
function initScratchCards(){
  document.querySelectorAll('.scratch-canvas').forEach(canvas => {
    if(canvas.dataset.inited) return;
    canvas.dataset.inited = "1";
    const ctx = canvas.getContext('2d');

    function resize(){
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawCover();
    }
    function drawCover(){
      const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
      grad.addColorStop(0,'#FDB8CE');
      grad.addColorStop(1,'#F988AE');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      for(let i=0;i<16;i++){
        ctx.beginPath();
        ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 1.5+Math.random()*2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff';
      ctx.font = `600 ${Math.round(canvas.width * 0.09)}px Quicksand, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨ Scratch me ✨', canvas.width/2, canvas.height/2);
    }
    resize();
    window.addEventListener('resize', resize);

    let scratching = false;
    let lastCheck = 0;
    function getPos(e){
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx-rect.left, y: cy-rect.top };
    }
    function scratchAt(x,y){
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x,y,26,0,Math.PI*2);
      ctx.fill();
    }
    function checkPercent(){
      const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let transparent = 0, sampled = 0;
      for(let i=3;i<data.length;i+=4*24){ sampled++; if(data[i]===0) transparent++; }
      const percent = (transparent/sampled)*100;
      if(percent > 50){
        canvas.style.transition = 'opacity .6s ease';
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
        // tandai foto sebagai revealed + pasang click handler langsung
        const photoEl = canvas.parentElement.querySelector('.photo-under');
        if(photoEl && !photoEl.classList.contains('revealed')){
          photoEl.classList.add('revealed');
          photoEl.addEventListener('click', () => {
            const img = photoEl.querySelector('img');
            if(img && img.src) openLightbox(img.src);
          });
        }
        if(typeof confetti === 'function'){
          confetti({ particleCount:60, spread:70, origin:{y:0.6}, colors:['#FF8FB1','#F4C95D','#fff'] });
        }
      }
    }
    function start(e){ scratching = true; const p = getPos(e); scratchAt(p.x,p.y); }
    function move(e){
      if(!scratching) return;
      e.preventDefault();
      const p = getPos(e);
      scratchAt(p.x,p.y);
      const now = Date.now();
      if(now-lastCheck > 200){ lastCheck = now; checkPercent(); }
    }
    function end(){ scratching = false; checkPercent(); }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive:true });
    canvas.addEventListener('touchmove', move, { passive:false });
    canvas.addEventListener('touchend', end);
  });
}

/* ---------- memory map tooltip ---------- */
function bindMapPins(){
  const mapTooltip = document.getElementById('mapTooltip');
  let ttTimer;
  document.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      mapTooltip.textContent = pin.dataset.memory;
      mapTooltip.style.left = pin.style.left;
      mapTooltip.style.top = `calc(${pin.style.top} - 14px)`;
      mapTooltip.classList.remove('hidden');
      clearTimeout(ttTimer);
      ttTimer = setTimeout(() => mapTooltip.classList.add('hidden'), 3000);
    });
  });
}

/* ---------- voice note player ---------- */
const voiceAudio = document.getElementById('voiceAudio');
const voiceBtn = document.getElementById('voiceBtn');
const voiceBars = document.getElementById('voiceBars');
let voicePlaying = false;
voiceBtn.addEventListener('click', () => {
  if(!voiceAudio.src || voiceAudio.getAttribute('src') === ''){
    voiceBtn.textContent = '🎙️';
    setTimeout(() => { voiceBtn.textContent = voicePlaying ? '⏸' : '▶'; }, 800);
    return;
  }
  if(voicePlaying){ voiceAudio.pause(); voiceBtn.textContent='▶'; voiceBars.classList.remove('playing'); }
  else{ voiceAudio.play(); voiceBtn.textContent='⏸'; voiceBars.classList.add('playing'); }
  voicePlaying = !voicePlaying;
});
voiceAudio.addEventListener('ended', () => {
  voicePlaying = false; voiceBtn.textContent='▶'; voiceBars.classList.remove('playing');
});
/* =====================================================
   AUTO PLAY MUSIC
===================================================== */
function autoPlayMusic(){

    const music = document.getElementById("bgMusic");

    if(!music) return;

    music.volume = 0.35;

    music.play().catch(err => {
        console.log("Autoplay diblokir:", err);
    });

}
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicToggle");

let musicPlaying = true;

musicBtn.addEventListener("click", () => {

    if(musicPlaying){

        bgMusic.pause();
        musicBtn.textContent = "🔇";

    }else{

        bgMusic.play().catch(()=>{});
        musicBtn.textContent = "🔊";

    }

    musicPlaying = !musicPlaying;

});

/* =====================================================================
   KARTU "ALASAN AKU SAYANG KAMU"
   ===================================================================== */
const reasonCard = document.getElementById('reasonCard');
const reasonFlipInner = document.getElementById('reasonFlipInner');
const reasonText = document.getElementById('reasonText');
const reasonNextBtn = document.getElementById('reasonNextBtn');
let usedReasonIndexes = [];

function pickNextReason(){
  let pool = CONFIG.reasons.map((_, i) => i).filter(i => !usedReasonIndexes.includes(i));
  if(pool.length === 0){ usedReasonIndexes = []; pool = CONFIG.reasons.map((_, i) => i); }
  const idx = pool[Math.floor(Math.random() * pool.length)];
  usedReasonIndexes.push(idx);
  return CONFIG.reasons[idx];
}
function showReason(){
  reasonText.textContent = pickNextReason();
  reasonFlipInner.classList.add('flipped');
}
reasonCard.addEventListener('click', showReason);
reasonNextBtn.addEventListener('click', (e) => { e.stopPropagation(); showReason(); });

/* =====================================================================
   KUIS "SEBERAPA KENAL KAMU SAMA AKU"
   ===================================================================== */
const quizBody = document.getElementById('quizBody');
const quizStartBtn = document.getElementById('quizStartBtn');
let quizIndex = 0, quizScore = 0;

function startQuiz(){
  quizIndex = 0; quizScore = 0;
  renderQuizQuestion();
}
function renderQuizQuestion(){
  const q = CONFIG.quiz[quizIndex];
  quizBody.innerHTML = `
    <p class="text-xs text-plum/50">Pertanyaan ${quizIndex + 1}/${CONFIG.quiz.length}</p>
    <p class="text-sm font-semibold text-plum mb-1">${q.question}</p>
    <div class="flex flex-col gap-2 w-full" id="quizOptions"></div>
  `;
  const optsWrap = document.getElementById('quizOptions');
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if(i === q.correct) quizScore++;
      quizIndex++;
      if(quizIndex < CONFIG.quiz.length){ renderQuizQuestion(); }
      else{ renderQuizResult(); }
    });
    optsWrap.appendChild(btn);
  });
}
function renderQuizResult(){
  const total = CONFIG.quiz.length;
  const pct = Math.round((quizScore / total) * 100);
  const msg = pct === 100
    ? "Sempurna! Kamu emang paling ngerti aku 🥹"
    : pct >= 60
    ? "Lumayan deket nih sama aku! 💕"
    : "Yah, masih banyak PR buat kenal aku lebih dalam nih 😝";
  quizBody.innerHTML = `
    <p class="text-3xl font-script text-rose-500">${quizScore}/${total}</p>
    <p class="text-sm text-plum/70 px-2">${msg}</p>
    <button id="quizRetryBtn" class="game-restart-btn mt-1">Coba Lagi</button>
  `;
  document.getElementById('quizRetryBtn').addEventListener('click', startQuiz);
}
quizStartBtn.addEventListener('click', startQuiz);

/* =====================================================================
   GAME "TANGKAP HATI"
   ===================================================================== */
const gameArea = document.getElementById('gameArea');
const gameStatus = document.getElementById('gameStatus');
let gameScore = 0, gameTimeLeft = 30, gameTimerId = null, gameSpawnerId = null, gameRunning = false;

function updateGameStatus(){
  gameStatus.textContent = `Skor: ${gameScore} · Waktu: ${gameTimeLeft}s`;
}
function spawnGameHeart(){
  const heart = document.createElement('div');
  heart.className = 'falling-heart-game';
  heart.textContent = ['💗','💕','💖','💘'][Math.floor(Math.random() * 4)];
  heart.style.left = Math.random() * 85 + '%';
  const duration = 2 + Math.random() * 1.5;
  heart.style.animationDuration = duration + 's';
  heart.addEventListener('click', () => {
    if(!gameRunning) return;
    gameScore++;
    updateGameStatus();
    heart.classList.add('heart-pop');
    setTimeout(() => heart.remove(), 300);
  });
  heart.addEventListener('animationend', () => heart.remove());
  gameArea.appendChild(heart);
}
function startCatchGame(){
  if(gameRunning) return;
  gameRunning = true;
  gameScore = 0; gameTimeLeft = 30;
  gameArea.innerHTML = '';
  updateGameStatus();
  gameSpawnerId = setInterval(spawnGameHeart, 700);
  gameTimerId = setInterval(() => {
    gameTimeLeft--;
    updateGameStatus();
    if(gameTimeLeft <= 0) endCatchGame();
  }, 1000);
}
function endCatchGame(){
  gameRunning = false;
  clearInterval(gameSpawnerId);
  clearInterval(gameTimerId);
  gameArea.querySelectorAll('.falling-heart-game').forEach(h => h.remove());
  const msg = gameScore >= 15 ? "Wih jago banget! 🏆" : gameScore >= 8 ? "Lumayan nih! 💪" : "Ayo coba lagi! 😆";
  gameArea.innerHTML = `
    <div class="text-center px-4">
      <p class="text-2xl font-script text-rose-500">Skor: ${gameScore}</p>
      <p class="text-xs text-plum/60 mt-1">${msg}</p>
      <button id="gameRestartBtn" class="game-restart-btn mt-3">Main Lagi</button>
    </div>
  `;
  document.getElementById('gameRestartBtn').addEventListener('click', startCatchGame);
}
document.getElementById('gameStartBtn').addEventListener('click', startCatchGame);

/* =====================================================================
   LIGHTBOX — klik foto polaroid yang sudah di-scratch untuk memperbesar
   ===================================================================== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src){
  lightboxImg.src = src;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// klik foto yang sudah revealed
document.addEventListener('click', (e) => {
  const photoEl = e.target.closest('.photo-under.revealed');
  if(!photoEl) return;
  const img = photoEl.querySelector('img');
  if(img && img.src){
    openLightbox(img.src);
  }
});

// tutup lightbox
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if(e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
});

function updateClock(){

    const now=new Date();

    const date=now.toLocaleDateString("id-ID",{

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    });

    const time=now.toLocaleTimeString("id-ID");

    document.getElementById("todayDate").textContent=date;

    document.getElementById("todayClock").textContent=time;

}

updateClock();

setInterval(updateClock,1000);
const relationshipDate=new Date("2026-01-24T00:00:00");

function updateLoveCounter(){

    const now=new Date();

    let diff=now-relationshipDate;

    const days=Math.floor(diff/86400000);

    diff%=86400000;

    const hours=Math.floor(diff/3600000);

    diff%=3600000;

    const minutes=Math.floor(diff/60000);

    diff%=60000;

    const seconds=Math.floor(diff/1000);

    daysTogether.textContent=days;

    hoursTogether.textContent=hours;

    minutesTogether.textContent=minutes;

    secondsTogether.textContent=seconds;

}

updateLoveCounter();

setInterval(updateLoveCounter,1000);
function updateBirthdayProgress(){

    const birthday = new Date(CONFIG.birthday);

    // mulai progress 30 hari sebelum ulang tahun
    const start = new Date(birthday);
    start.setDate(start.getDate() - 30);

    const now = new Date();

    const total = birthday - start;
    const current = now - start;

    let percent = (current / total) * 100;
    percent = Math.max(0, Math.min(percent,100));

    document.getElementById("journeyBar").style.width = percent + "%";

    const diff = birthday - now;
    
    // Menggunakan Math.floor dan menghitung selisih hari kalender dengan akurat
    const oneDay = 86400000;
    const daysLeft = Math.floor(diff / oneDay);

    const text = document.getElementById("journeyText");

    if(daysLeft > 1){

        text.textContent = `${daysLeft} hari lagi menuju hari spesialmu 🎂`;

    }else if(daysLeft === 1){

        text.textContent = "Besok hari spesialmu ❤️";

    }else{

        text.textContent = "🎉 Happy Birthday Sayang ❤️";

    }

}
const heartEmoji = ["💖","💕","💗","💘","❤️"];

function createFloatingHeart(x,y){

    const heart=document.createElement("div");

    heart.className="floating-heart";

    heart.textContent=heartEmoji[Math.floor(Math.random()*heartEmoji.length)];

    heart.style.left=x+"px";

    heart.style.top=y+"px";

    document.body.appendChild(heart);

    setTimeout(()=>heart.remove(),900);

}

let lastHeart=0;

document.addEventListener("mousemove",(e)=>{

    if(window.innerWidth<768) return;

    const now=Date.now();

    if(now-lastHeart<80) return;

    lastHeart=now;

    createFloatingHeart(e.clientX,e.clientY);

});

let lastTouchHeart = 0;

document.addEventListener("touchmove",(e)=>{

    const now = Date.now();

    if(now - lastTouchHeart < 70) return;

    lastTouchHeart = now;

    const touch = e.touches[0];

    createFloatingHeart(touch.clientX - 10, touch.clientY);
createFloatingHeart(touch.clientX + 10, touch.clientY);

},{passive:true});
/* =====================================================
   EASTER EGG KUCING
===================================================== */

const cat = document.getElementById("catEasterEgg");
const catBubble = document.getElementById("catBubble");

let catShown = false;

function showCatEasterEgg(){

    if(catShown) return;
    catShown = true;

    // suara meow (opsional)
    try{
        new Audio("meow.mp3").play();
    }catch(e){}

    // reset posisi
    cat.style.transition = "none";
    cat.style.left = "-140px";

    requestAnimationFrame(() => {

        // mulai jalan
        cat.style.transition = "left 10s linear";
        cat.style.left = "110vw";

    });

    // tampilkan bubble setelah 1.5 detik
    setTimeout(() => {

        catBubble.classList.add("show");

    },1500);

    // sembunyikan bubble
    setTimeout(() => {

        catBubble.classList.remove("show");

    },5500);

}

// muncul 60 detik setelah dashboard dibuka
setTimeout(showCatEasterEgg,10000);

/* =====================================================================
   MUSIC PLAYER — widget "Lagu Favorit Kita" (menggantikan YouTube).
   Daftar lagu diambil dari CONFIG.playlist. File mp3 harus ditaruh
   manual di assets/music/ sesuai path yang ditulis di config.js.
   ===================================================================== */
(function initMusicPlayer(){
  const playlist = CONFIG.playlist || [];
  const audio = document.getElementById('playerAudio');
  if(!audio || playlist.length === 0) return;

  const playBtn   = document.getElementById('playerPlay');
  const prevBtn   = document.getElementById('playerPrev');
  const nextBtn   = document.getElementById('playerNext');
  const seek      = document.getElementById('playerSeek');
  const curTimeEl = document.getElementById('playerCurrentTime');
  const durTimeEl = document.getElementById('playerDuration');
  const titleEl   = document.getElementById('playerTitle');
  const artistEl  = document.getElementById('playerArtist');
  const coverEl   = document.getElementById('playerCover');
  const listEl    = document.getElementById('playlistList');
  const numerals  = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨"];

  let currentIndex = 0;
  let isSeeking = false;

  function formatTime(sec){
    if(!isFinite(sec) || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }

  function renderPlaylist(){
    listEl.innerHTML = "";
    playlist.forEach((track, i) => {
      const li = document.createElement('li');
      li.className = 'playlist-item' + (i === currentIndex ? ' active' : '');
      li.innerHTML = `
        <span class="playlist-num">${numerals[i] || (i + 1)}</span>
        <span class="playlist-meta">
          <span class="playlist-title"></span>
          <span class="playlist-artist"></span>
        </span>`;
      li.querySelector('.playlist-title').textContent = track.title;
      li.querySelector('.playlist-artist').textContent = track.artist;
      li.addEventListener('click', () => loadTrack(i, true));
      listEl.appendChild(li);
    });
  }

  function loadTrack(index, autoplay){
    currentIndex = (index + playlist.length) % playlist.length;
    const track = playlist[currentIndex];

    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    audio.src = track.src;
    seek.value = 0;
    seek.style.setProperty('--seek-fill', '0%');
    curTimeEl.textContent = "00:00";
    durTimeEl.textContent = "00:00";

    if(track.cover){
      coverEl.style.backgroundImage = `url('${track.cover}')`;
    } else {
      coverEl.style.backgroundImage = '';
    }

    renderPlaylist();

    if(autoplay){
      audio.play().catch(() => {
        playBtn.textContent = '▶️';
        coverEl.classList.remove('spinning');
      });
    }
  }

  function togglePlay(){
    if(audio.paused){
      audio.play().catch(() => {
        alert('File lagu belum ditemukan. Tambahkan file mp3-nya di folder assets/music/ sesuai path di config.js.');
      });
    } else {
      audio.pause();
    }
  }

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => loadTrack(currentIndex - 1, true));
  nextBtn.addEventListener('click', () => loadTrack(currentIndex + 1, true));

  audio.addEventListener('play', () => {
    playBtn.textContent = '⏸️';
    coverEl.classList.add('spinning');
  });
  audio.addEventListener('pause', () => {
    playBtn.textContent = '▶️';
    coverEl.classList.remove('spinning');
  });
  audio.addEventListener('ended', () => loadTrack(currentIndex + 1, true));

  audio.addEventListener('loadedmetadata', () => {
    durTimeEl.textContent = formatTime(audio.duration);
    seek.max = audio.duration || 0;
  });
  audio.addEventListener('timeupdate', () => {
    if(isSeeking) return;
    curTimeEl.textContent = formatTime(audio.currentTime);
    seek.value = audio.currentTime;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    seek.style.setProperty('--seek-fill', pct + '%');
  });
  seek.addEventListener('input', () => {
    isSeeking = true;
    curTimeEl.textContent = formatTime(seek.value);
    const pct = seek.max > 0 ? (seek.value / seek.max) * 100 : 0;
    seek.style.setProperty('--seek-fill', pct + '%');
  });
  seek.addEventListener('change', () => {
    audio.currentTime = seek.value;
    isSeeking = false;
  });

  loadTrack(0, false);
})();