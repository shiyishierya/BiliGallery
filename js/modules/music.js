// js/modules/music.js
const SONG = { title: "At The End", artist: "Tech Demo", cover: "https://p3-sign.douyinpic.com/tos-cn-i-0813/oU2k4AABQCA9yA.jpeg?x-expires=1735689600&x-signature=k2%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B%2B", src: "https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/music/audio.mp3" };

const style = document.createElement('style');
style.textContent = `
    .music-player { position: fixed; bottom: 25px; left: 25px; z-index: 9999; display: flex; align-items: center; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 12px 15px 15px 12px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.6); width: 260px; transition: 0.3s; user-select: none; font-family: sans-serif; }
    .music-player:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(0, 174, 236, 0.25); background: rgba(255, 255, 255, 0.95); }
    .music-cover { width: 50px; height: 50px; border-radius: 50%; background-color: #222; background-size: cover; background-position: center; position: relative; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2); animation: spin 8s linear infinite; animation-play-state: paused; }
    .music-cover::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #f4f5f7; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); }
    .music-cover.playing { animation-play-state: running; }
    .music-info { margin-left: 12px; margin-right: 10px; display: flex; flex-direction: column; justify-content: center; flex: 1; overflow: hidden; height: 40px; }
    .music-title { font-size: 14px; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .music-artist { font-size: 11px; color: #888; margin-top: 2px; }
    .play-btn { width: 36px; height: 36px; background: #00aeec; border-radius: 50%; border: none; color: white; font-size: 16px; box-shadow: 0 4px 10px rgba(0, 174, 236, 0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .play-btn:hover { background: #00a1d6; transform: scale(1.1); }
    .progress-hit-area { position: absolute; bottom: 0; left: 0; width: 100%; height: 20px; cursor: pointer; z-index: 20; display: flex; align-items: flex-end; }
    .progress-bg { width: 100%; height: 3px; background: #eee; position: absolute; bottom: 0; left: 16px; right: 16px; width: auto; border-radius: 0 0 16px 16px; transition: height 0.2s; pointer-events: none; }
    .progress-fill { height: 100%; background: #00aeec; width: 0%; border-radius: 2px; position: relative; }
    .progress-fill::after { content: ''; position: absolute; right: -5px; top: -3.5px; width: 10px; height: 10px; background: #00aeec; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3); opacity: 0; transform: scale(0); transition: transform 0.2s, opacity 0.2s; }
    .progress-hit-area:hover .progress-bg { height: 5px; }
    .progress-hit-area:hover .progress-fill::after { opacity: 1; transform: scale(1); }
    @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

const playerHTML = `<div class="music-player" id="musicPlayerBox"><div class="music-cover" id="musicCover"></div><div class="music-info"><div class="music-title" id="musicTitle">Loading...</div><div class="music-artist" id="musicArtist">Music</div></div><button class="play-btn" id="musicPlayBtn">▶</button><div class="progress-hit-area" id="musicHitArea"><div class="progress-bg" id="musicTrack"><div class="progress-fill" id="musicPFill"></div></div></div><audio id="musicAudioEl" loop></audio></div>`;
const old = document.getElementById('musicPlayerBox'); if(old) old.remove(); const div = document.createElement('div'); div.innerHTML = playerHTML; document.body.appendChild(div);

let isPlaying = false; let isDragging = false; 
const audio = document.getElementById('musicAudioEl'); const playBtn = document.getElementById('musicPlayBtn'); const cover = document.getElementById('musicCover');
const titleEl = document.getElementById('musicTitle'); const artistEl = document.getElementById('musicArtist'); const fill = document.getElementById('musicPFill');
const hitArea = document.getElementById('musicHitArea'); const track = document.getElementById('musicTrack');

function initSong() { titleEl.innerText = SONG.title; artistEl.innerText = SONG.artist; cover.style.backgroundImage = `url(https://api.dicebear.com/7.x/shapes/svg?seed=music)`; audio.src = SONG.src; }
function togglePlay() { if (isPlaying) { audio.pause(); playBtn.innerText = '▶'; cover.classList.remove('playing'); } else { const playPromise = audio.play(); if (playPromise !== undefined) { playPromise.then(() => { playBtn.innerText = '⏸'; cover.classList.add('playing'); }).catch(error => { console.error("播放失败:", error); alert("自动播放受限，请再点一次播放按钮！"); }); } } isPlaying = !isPlaying; }
function getPercent(e) { const rect = track.getBoundingClientRect(); const width = rect.width; let clickX = e.clientX - rect.left; if(clickX < 0) clickX = 0; if(clickX > width) clickX = width; return clickX / width; }
hitArea.addEventListener('mousedown', (e) => { if (!audio.duration || isNaN(audio.duration)) return; isDragging = true; const p = getPercent(e); fill.style.width = `${p * 100}%`; });
document.addEventListener('mousemove', (e) => { if (isDragging) { e.preventDefault(); const p = getPercent(e); fill.style.width = `${p * 100}%`; } });
document.addEventListener('mouseup', (e) => { if (isDragging) { const p = getPercent(e); if (audio.duration && !isNaN(audio.duration)) { audio.currentTime = p * audio.duration; } isDragging = false; } });
audio.addEventListener('timeupdate', () => { if (!isDragging && audio.duration) { const p = (audio.currentTime / audio.duration) * 100; fill.style.width = `${p}%`; } });
playBtn.addEventListener('click', togglePlay); initSong();