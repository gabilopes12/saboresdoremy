const canvas = document.getElementById('canvas-lanterna');
const ctx = canvas.getContext('2d');
const escuridao = document.getElementById('escuridao');
const textoMisterio = document.getElementById('texto-misterio');
const remySilhueta = document.getElementById('remy-silhueta');
const titulo = document.getElementById('titulo');
const btnWrapper = document.getElementById('btn-wrapper');
const btnPlay = document.getElementById('btn-play');
const somPassos = new Audio('sons/suspense.wav');
somPassos.volume = 0.7;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let tempoNoChapeu = 0;
let revelado = false;
let expansaoCompleta = false;

let lanternaAtiva = false;
const DELAY_LANTERNA = 3000;
const RAIO_LUZ_INICIAL = 30;
const RAIO_LUZ_FINAL = 80;
let raioAtual = RAIO_LUZ_INICIAL;

// ─── ECRÃ INICIAL ────────────────────────────────

const styleTag = document.createElement('style');
styleTag.textContent = `
    @keyframes piscar {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    #ecra-inicio {
        position: fixed;
        inset: 0;
        z-index: 999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.92);
        transition: opacity 0.7s ease;
    }
    #ecra-inicio .clica-inicio {
        font-family: 'Poppins', sans-serif;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.25em;
        text-transform: lowercase;
        color: rgba(255, 255, 255, 0.75);
        opacity: 0;
        user-select: none;
        transition: opacity 1s ease;
    }
`;
document.head.appendChild(styleTag);

const ecraInicio = document.createElement('div');
ecraInicio.id = 'ecra-inicio';
ecraInicio.innerHTML = `
    <div class="ecra-info" id="ecra-info" style="opacity:0; transition: opacity 1s ease;">
        <h1 class="ecra-titulo">Sabores do Remy</h1>
        <p class="ecra-subtitulo">O que acontece quando dois sabores se encontram?<br>Combina ingredientes e descobre a tua criação visual.</p>
    </div>
    <p class="clica-inicio" id="clica-inicio" style="opacity:0; transition: opacity 1s ease;">clique para começar</p>
`;
document.body.appendChild(ecraInicio);

setTimeout(() => {
    document.getElementById('ecra-info').style.opacity = '1';
}, 2000);

setTimeout(() => {
    const clica = document.getElementById('clica-inicio');
    clica.style.opacity = '1';
    setTimeout(() => {
        clica.style.animation = 'piscar 2.2s ease-in-out infinite';
    }, 1000);
}, 4000);

// ─── SOM AMBIENTE ────────────────────────────────

let audioCtx = null;
let gainNode = null;
let sourceNode = null;
let audioBuffer = null;
let somTocando = false;
let remyDetectado = false;

const fetchPromise = fetch('sons/ambiente.mp3')
    .then(r => r.arrayBuffer())
    .catch(err => { console.warn('Erro fetch som:', err); return null; });

function tocarSom() {
    if (somTocando || !audioCtx || !audioBuffer) return;
    somTocando = true;

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.connect(gainNode);
    sourceNode.start(0);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 3);
}

function diminuirSom() {
    if (!audioCtx || !gainNode) return;
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1);
}

// ─── FADE OUT DO SUSPENSE ────────────────────────
// Remy é detetado pela primeira vez
// Faz fade-out suave em 1.5s e para o som no final

function pararSomSuspense() {
    if (somPassos.paused) return;
    const duracaoFade = 1500;
    const inicio = performance.now();
    const volumeInicial = somPassos.volume;

    function tick(agora) {
        const t = Math.min((agora - inicio) / duracaoFade, 1);
        somPassos.volume = volumeInicial * (1 - t);
        if (t < 1) {
            requestAnimationFrame(tick);
        } else {
            somPassos.pause();
            somPassos.currentTime = 0;
        }
    }
    requestAnimationFrame(tick);
}

// Diminui o suspense quando o mouse se aproxima do chapéu
// (chamado a cada frame de desenhar enquanto está perto)
let suspenseDiminuido = false;
function diminuirSomSuspense(distancia, limiar) {
    if (suspenseDiminuido || somPassos.paused) return;
    // Começa a diminuir quando está a menos de 2x o limiar de deteção
    const proximidade = Math.max(0, 1 - distancia / (limiar * 2));
    somPassos.volume = Math.max(0.05, 0.7 * (1 - proximidade * 0.8));
}

// ─── CLIQUE PARA COMEÇAR ─────────────────────────

ecraInicio.addEventListener('click', () => {
    const videoPegadas = document.getElementById('video-pegadas');
    if (videoPegadas) {
        videoPegadas.currentTime = 0;
        videoPegadas.play();
    }
    somPassos.currentTime = 0;
    somPassos.play().catch(err => console.log('Erro passos:', err));

    if (videoPegadas) {
        videoPegadas.style.transition = 'opacity 0.8s ease';
        videoPegadas.style.opacity = '0';
        setTimeout(() => videoPegadas.remove(), 800);
    }
    ecraInicio.style.opacity = '0';

    if (window.audioCtxGlobal && window.audioCtxGlobal.state === 'suspended') {
        window.audioCtxGlobal.resume();
    }
    tocarSomClique();

    setTimeout(() => {
        ecraInicio.remove();

        document.getElementById('escuridao').classList.add('visivel');

        setTimeout(() => {
            document.querySelector('.bg-azulejos').classList.add('visivel');
            document.querySelector('.bg-bancada').classList.add('visivel');
            document.querySelector('.bg-panela').classList.add('visivel');
            document.querySelector('.titulo').classList.add('visivel');
        }, 200);

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(audioCtx.destination);

        fetchPromise.then(data => {
            if (!data) return;
            audioCtx.decodeAudioData(data.slice(0), buffer => {
                audioBuffer = buffer;
            });
        });

        iniciarLanterna();

    }, 700);

}, { once: true });

// ─────────────────────────────────────────────────

function redimensionar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
redimensionar();
window.addEventListener('resize', redimensionar);

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function iniciarLanterna() {
    setTimeout(() => {
        textoMisterio.style.transition = 'opacity 1.5s ease';
        textoMisterio.style.opacity = '0';
        setTimeout(() => textoMisterio.classList.add('escondido'), 1500);

        setTimeout(() => {
            lanternaAtiva = true;
            const inicio = performance.now();
            const duracao = 800;
            function expandirRaio(agora) {
                const t = Math.min((agora - inicio) / duracao, 1);
                raioAtual = RAIO_LUZ_INICIAL + (RAIO_LUZ_FINAL - RAIO_LUZ_INICIAL) * t;
                if (t < 1) requestAnimationFrame(expandirRaio);
            }
            requestAnimationFrame(expandirRaio);
        }, 1500);
    }, DELAY_LANTERNA);

    desenhar();
}

function obterAreaChapeu() {
    return {
        x: window.innerWidth * 0.55,
        y: window.innerHeight * 0.44,
        raio: window.innerWidth * 0.035
    };
}

function desenhar() {
    if (expansaoCompleta) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.99)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'destination-out';
    const gradiente = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, raioAtual);
    gradiente.addColorStop(0,   'rgba(0,0,0,0.99)');
    gradiente.addColorStop(0.6, 'rgba(0,0,0,0.99)');
    gradiente.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gradiente;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, raioAtual, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    if (lanternaAtiva) {
        const chapeu = obterAreaChapeu();
        const dist = Math.hypot(mouseX - chapeu.x, mouseY - chapeu.y);
        const limiar = chapeu.raio + raioAtual * 0.5;

        // Diminui o suspense gradualmente conforme o mouse se aproxima
        if (!remyDetectado) diminuirSomSuspense(dist, limiar);

        if (dist < limiar) {
            if (!remyDetectado) {
                remyDetectado = true;
                suspenseDiminuido = true;
                // Fade-out completo do suspense quando o Remy é detetado
                pararSomSuspense();
                // Arrancar o som ambiente
                if (audioBuffer) {
                    tocarSom();
                } else {
                    const intervalo = setInterval(() => {
                        if (audioBuffer) {
                            tocarSom();
                            clearInterval(intervalo);
                        }
                    }, 100);
                }
            }
            remySilhueta.classList.add('visivel');
            tempoNoChapeu++;
            if (tempoNoChapeu > 90) revelar();
        } else {
            remySilhueta.classList.remove('visivel');
            tempoNoChapeu = 0;
        }
    }

    requestAnimationFrame(desenhar);
}

function revelar() {
    if (revelado) return;
    revelado = true;

    remySilhueta.classList.remove('visivel');
    remySilhueta.style.display = 'none';

    const maxDist = Math.sqrt(
        Math.max(mouseX, window.innerWidth - mouseX) ** 2 +
        Math.max(mouseY, window.innerHeight - mouseY) ** 2
    );

    const duracao = 1200;
    const inicio = performance.now();
    const raioInicial = raioAtual;

    function expandir(agora) {
        const t = Math.min((agora - inicio) / duracao, 1);
        const easing = 1 - Math.pow(1 - t, 3);
        raioAtual = raioInicial + (maxDist - raioInicial) * easing;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradiente = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, raioAtual);
        gradiente.addColorStop(0,   'rgba(0,0,0,1)');
        gradiente.addColorStop(0.6, 'rgba(0,0,0,1)');
        gradiente.addColorStop(1,   'rgba(0,0,0,0)');

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, raioAtual, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        const videoPegadas = document.getElementById('video-pegadas');
        if (videoPegadas) {
            videoPegadas.style.transition = 'opacity 0.8s ease';
            videoPegadas.style.opacity = '0';
            setTimeout(() => videoPegadas.remove(), 800);
        }

        if (t < 1) {
            requestAnimationFrame(expandir);
        } else {
            expansaoCompleta = true;
            escuridao.classList.add('desaparecendo');
            setTimeout(() => escuridao.remove(), 600);
            titulo.classList.add('animar');
            btnWrapper.classList.add('visivel');
        }
    }

    requestAnimationFrame(expandir);
}

btnPlay.addEventListener('click', () => {
    tocarSomPlay();
    titulo.style.transition = 'opacity 0.6s ease';
    titulo.style.opacity = '0';
    btnWrapper.style.transition = 'opacity 0.4s ease';
    btnWrapper.style.opacity = '0';

    document.querySelector('.bg-azulejos').style.transition = 'filter 0.6s ease';
    document.querySelector('.bg-azulejos').style.filter = 'blur(8px)';
    document.querySelector('.bg-bancada').style.transition = 'filter 0.6s ease';
    document.querySelector('.bg-bancada').style.filter = 'blur(8px)';
    document.querySelector('.bg-panela').style.transition = 'filter 0.6s ease';
    document.querySelector('.bg-panela').style.filter = 'blur(8px)';

    diminuirSom();

    setTimeout(() => {
        document.getElementById('secao-intro').classList.add('secao-escondida');
        document.getElementById('secao-jogo').classList.remove('secao-escondida');
        iniciarJogo();
    }, 650);
});