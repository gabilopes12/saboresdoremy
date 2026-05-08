window.audioCtxGlobal = new (window.AudioContext || window.webkitAudioContext)();
const audioCtxGlobal = window.audioCtxGlobal;

// Gain master — controla o volume de tudo
const masterGain = audioCtxGlobal.createGain();
masterGain.gain.value = 1;
masterGain.connect(audioCtxGlobal.destination);
window.masterGain = masterGain;

function carregarSom(url) {
    return fetch(url)
        .then(r => r.arrayBuffer())
        .then(data => audioCtxGlobal.decodeAudioData(data))
        .catch(err => { console.warn('Erro som:', url, err); return null; });
}

function tocarBuffer(buffer, volume = 0.7) {
    if (!buffer) return;
    const source = audioCtxGlobal.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtxGlobal.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(masterGain); // liga ao master em vez de destination
    source.start(0);
}

let dropBuffer = null;
let mixBuffer = null;
let revealBuffer = null;
let setaBuffer = null;

carregarSom('sons/drop.wav').then(b => dropBuffer = b);
carregarSom('sons/mix.wav').then(b => mixBuffer = b);
carregarSom('sons/reveal.wav').then(b => revealBuffer = b);
carregarSom('sons/setaIndex.wav').then(b => setaBuffer = b);

function tocarSomDrop()   { tocarBuffer(dropBuffer, 0.6); }
function tocarSomMix()    { tocarBuffer(mixBuffer, 0.7); }
function tocarSomReveal() { tocarBuffer(revealBuffer, 0.7); }
function tocarSomSeta()   { tocarBuffer(setaBuffer, 0.7); }

// ─── SOM VOLTAR ──────────────────────────────────

let voltarBuffer = null;
carregarSom('sons/voltar.wav').then(b => voltarBuffer = b);
function tocarSomVoltar() { tocarBuffer(voltarBuffer, 0.7); }

let salvarBuffer = null;
let guardarBuffer = null;
let limparBuffer = null;

carregarSom('sons/salvar.mp3').then(b => salvarBuffer = b);
carregarSom('sons/guardar.mp3').then(b => guardarBuffer = b);
carregarSom('sons/limpar.mp3').then(b => limparBuffer = b);

function tocarSomSalvar() { tocarBuffer(salvarBuffer, 0.7); }
function tocarSomGuardar() { tocarBuffer(guardarBuffer, 0.7); }
function tocarSomLimpar() { tocarBuffer(limparBuffer, 0.7); }

let puffBuffer = null;

carregarSom('sons/puff.wav').then(b => puffBuffer = b);
function tocarSomPuff() { tocarBuffer(puffBuffer, 0.7); }

let erroBuffer = null;
let infoBuffer = null;
let clicqueBuffer = null;
let playBuffer = null;
let colherBuffer = null;

carregarSom('sons/erro3Alimentos.mp3').then(b => erroBuffer = b);
carregarSom('sons/info.mp3').then(b => infoBuffer = b);
carregarSom('sons/clique.mp3').then(b => clicqueBuffer = b);
carregarSom('sons/play.mp3').then(b => playBuffer = b);
carregarSom('sons/colher.wav').then(b => colherBuffer = b);

function tocarSomErro() { tocarBuffer(erroBuffer, 0.7); }
function tocarSomInfo() { tocarBuffer(infoBuffer, 0.7); }
function tocarSomClique() { tocarBuffer(clicqueBuffer, 0.7); }
function tocarSomPlay() { tocarBuffer(playBuffer, 0.7); }
function tocarSomColher() { tocarBuffer(colherBuffer, 0.7); }

let fecharBuffer = null;
let cliquePapelBuffer = null;

carregarSom('sons/fechar.mp3').then(b => fecharBuffer = b);
carregarSom('sons/cliquePapel.wav').then(b => cliquePapelBuffer = b);

function tocarSomFechar() { tocarBuffer(fecharBuffer, 0.7); }
function tocarSomCliquePapel() { tocarBuffer(cliquePapelBuffer, 0.7); }


