// ─── VARIÁVEIS GLOBAIS ───────────────────────────
window.combinacoesGuardadas = window.combinacoesGuardadas || [];

// ─── INICIAR JOGO ────────────────────────────────

function iniciarJogo() {
    const CORES_INGREDIENTES = {
        morango:   { c1: '#e82c3e', c2: '#e54958', c3: '#e57781' },
        chocolate: { c1: '#3c1f0d', c2: '#462b1a', c3: '#533d30' },
        caju:      { c1: '#d4b483', c2: '#d2b68b', c3: '#d1b995' },
        brie:      { c1: '#f5d76e', c2: '#f0eaa0', c3: '#fffce0' },
        uva:       { c1: '#a8d44f', c2: '#b0d368', c3: '#bbd489' },
        noz:       { c1: '#8b5e3c', c2: '#c08040', c3: '#e8c080' },
        tomate:    { c1: '#c0392b', c2: '#bd4b3f', c3: '#d96053' },
        cenoura:   { c1: '#ef7d2c', c2: '#ed8a43', c3: '#ed9a5f' },
    };

    window.limparPanela = limparPanela;
    let ingredientesNaPanela = [];
    let temperosAtivos = [];
    let colherAtiva = false;
    let anguloAcumulado = 0;
    let ultimoAngulo = null;
    let jaMisturou = false;
    let combinacaoCompleta = false;

    const hitbox = document.getElementById('hitbox-panela');
    const divReais = document.getElementById('ingredientes-na-panela');
    const btnColher = document.getElementById('btn-colher');
    const imgColher = document.getElementById('img-colher');
    const imgGuardar = document.getElementById('img-guardar');
    const imgLimpar = document.getElementById('img-limpar');
    const balaoTexto = document.getElementById('balao-fala');
    const imgRemy = document.getElementById('remy');
    const remyContainer = document.querySelector('.remy-container');
    const setaGaleria = document.querySelector('.seta-subir');

    // ─── CARROSSEL ───────────────────────────────────

    const paginas = [
        [
            { id: 'caju',      src: 'images/ingredientes/caju.png',      alt: 'Caju',      classe: '' },
            { id: 'morango',   src: 'images/ingredientes/morango.png',   alt: 'Morango',   classe: 'ingredienteM' },
            { id: 'brie',      src: 'images/ingredientes/brie.png',      alt: 'Queijo Brie', classe: 'ingredienteB' },
            { id: 'chocolate', src: 'images/ingredientes/chocolate.png', alt: 'Chocolate', classe: '' },
        ],
        [
            { id: 'uva',      src: 'images/ingredientes/uva.png',      alt: 'Uva',      classe: '' },
            { id: 'noz',      src: 'images/ingredientes/noz.png',      alt: 'Noz',      classe: '' },
            { id: 'tomate',   src: 'images/ingredientes/tomate.png',   alt: 'Tomate',   classe: '' },
            { id: 'cenoura',  src: 'images/ingredientes/cenoura.png',  alt: 'Cenoura',  classe: '' },
        ]
    ];

    let paginaAtual = 0;
    const carrossel = document.getElementById('carrossel');
    const setaDireita = document.querySelector('.seta-carrossel-direita');
    const setaEsquerda = document.querySelector('.seta-carrossel-esquerda');

    function renderizarPagina(index) {
        carrossel.innerHTML = '';
        paginas[index].forEach(item => {
            const div = document.createElement('div');
            div.className = 'ingrediente item-arrastavel';
            div.dataset.id = item.id;
            div.draggable = true;

            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.draggable = false;
            if (item.classe) img.className = item.classe;

            if (ingredientesNaPanela.includes(item.id)) img.style.opacity = '0.35';

            div.appendChild(img);
            carrossel.appendChild(div);

            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('id', item.id);
                e.dataTransfer.setData('tipo', 'comida');
                e.dataTransfer.setData('src', item.src);
                e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
            });
        });

        setaEsquerda.style.visibility = index === 0 ? 'hidden' : 'visible';
        setaDireita.style.visibility = index === paginas.length - 1 ? 'hidden' : 'visible';
    }

    setaDireita.addEventListener('click', () => {
        if (paginaAtual < paginas.length - 1) {
            tocarSomSeta();
            paginaAtual++;
            renderizarPagina(paginaAtual);
        }
    });

    setaEsquerda.addEventListener('click', () => {
        if (paginaAtual > 0) {
            tocarSomSeta();
            paginaAtual--;
            renderizarPagina(paginaAtual);
        }
    });

    renderizarPagina(0);

    if (window.combinacoesGuardadas.length === 0) {
        setaGaleria.style.visibility = 'hidden';
    } else {
        setaGaleria.style.visibility = 'visible';
    }

    const falasRemy = {
        umIngrediente: 'Hmm… interessante! <br> Vamos combinar com <br> mais um?',
        doisIngredientes: 'Boa escolha! Mistura <br> os ingredientes ou <br> adiciona um tempero!',
        cheio: 'Dois ingredientes chegam! <br> Agora é hora de misturar.',
        temperoSal: 'Sal… os sabores <br> vão brilhar!',
        temperoPimenta: 'Pimenta! Prepara-te <br> para a velocidade...',
        temporoOregaos: 'Oregãos… vai ficar <br> tudo mais suave.',
        misturar: 'Devagar… deixa <br> os sabores <br> encontrarem-se.',
        misturarPimenta: 'É agora! <br> Deixa explodir os sabores!',
        misturarOregaos: 'Devagar… <br> com calma e suavidade.',
        combinacaoFinal: 'Isto… isto é incrível! <br> Tens de guardar isto.',
    };

    // ─── BOTÕES TOPO ─────────────────────────────────

    const btnInfo = document.getElementById('btn-info');
    const popupInfo = document.getElementById('popup-info-overlay');
    const btnFecharInfo = document.getElementById('btn-fechar-info');

    btnInfo.addEventListener('click', () => {
        tocarSomInfo();
        popupInfo.classList.remove('escondido');
    });

    btnFecharInfo.addEventListener('click', () => {
        tocarSomFechar();
        popupInfo.classList.add('escondido');
    });

    popupInfo.addEventListener('click', (e) => {
        if (e.target === popupInfo) {
            tocarSomFechar();
            popupInfo.classList.add('escondido');
        }
    });

    // ─── DRAG AND DROP ───────────────────────────

    document.querySelectorAll('.item-arrastavel').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('id', e.currentTarget.dataset.id || '');
            e.dataTransfer.setData('tipo', e.currentTarget.classList.contains('tempero') ? 'tempero' : 'comida');
            e.dataTransfer.setData('src', e.currentTarget.querySelector('img').src);
            const img = e.currentTarget.querySelector('img');
            e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
        });
    });

    hitbox.addEventListener('dragover', e => e.preventDefault());

    hitbox.addEventListener('drop', e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('id');
        const tipo = e.dataTransfer.getData('tipo');
        const src = e.dataTransfer.getData('src');

        if (tipo === 'colher') {
            tocarSomColher();
            colherAtiva = true;
            document.getElementById('panela').style.cursor = "url('images/botoes/cursor-colher.png') 16 16, auto";
            mostrarSinalMistura();
            if (temperosAtivos[0] === 'pimenta') atualizarRemy('misturarPimenta');
            else if (temperosAtivos[0] === 'oregaos') atualizarRemy('misturarOregaos');
            else atualizarRemy('misturar');
            return;
        }

        if (tipo === 'comida' && ingredientesNaPanela.length < 2 && !ingredientesNaPanela.includes(id)) {
            ingredientesNaPanela.push(id);
            tocarSomDrop();

            const itemUsado = document.querySelector(`.item-arrastavel[data-id="${id}"]`);
            if (itemUsado) itemUsado.querySelector('img').style.opacity = '0.35';

            const img = document.createElement('img');
            img.src = src;
            img.className = 'ingrediente-caido';
            img.dataset.ingredienteId = id;
            img.style.left = `${Math.random() * 40 + 30}%`;
            img.style.top = `${Math.random() * 40 + 30}%`;
            divReais.appendChild(img);

            atualizarEstado();

        } else if (tipo === 'comida' && ingredientesNaPanela.length >= 2) {
            tocarSomErro();
            atualizarRemy('cheio');

        } else if (tipo === 'tempero') {
            if (temperosAtivos.length < 1) {
                temperosAtivos.push(id);
                tocarSomDrop();

                const temperoUsado = document.querySelector(`.barra-temperos .item-arrastavel[data-id="${id}"] img`);
                if (temperoUsado) temperoUsado.style.opacity = '0.35';

                const img = document.createElement('img');
                img.src = `images/temperos/${id}.png`;
                img.className = 'ingrediente-caido';
                img.dataset.ingredienteId = id;
                img.style.left = `${Math.random() * 40 + 30}%`;
                img.style.top = `${Math.random() * 40 + 30}%`;
                divReais.appendChild(img);

                if (id === 'sal') atualizarRemy('temperoSal');
                else if (id === 'pimenta') atualizarRemy('temperoPimenta');
                else if (id === 'oregaos') atualizarRemy('temporoOregaos');
            } else {
                tocarSomErro();
            }
        }
    });

    // ─── ESTADO ──────────────────────────────────
    function atualizarEstado() {
        if (ingredientesNaPanela.length === 1) {
            remyContainer.classList.add('visivel');
            atualizarRemy('umIngrediente');
            btnColher.disabled = true;
            imgColher.src = 'images/botoes/colher-inativa.png';
            imgLimpar.src = 'images/botoes/limpar-ativo.png';
            imgGuardar.src = 'images/botoes/guardar-inativo.png';
        } else if (ingredientesNaPanela.length === 2) {
            atualizarRemy('doisIngredientes');
            btnColher.disabled = false;
            imgColher.src = 'images/botoes/colher-ativa.png';
        }
    }

    function atualizarRemy(estado) {
        balaoTexto.innerHTML = falasRemy[estado];
        const remyEstados = {
            umIngrediente: 'images/remy/remyCurioso.png',
            doisIngredientes: 'images/remy/remyEntusiasmado.png',
            cheio: 'images/remy/remyChateado.png',
            misturar: 'images/remy/remySatisfeito.png',
            misturarPimenta: 'images/remy/remyEntusiasmado.png',
            misturarOregaos: 'images/remy/remySatisfeito.png',
            temperoSal: 'images/remy/remyEntusiasmado.png',
            temperoPimenta: 'images/remy/remyEntusiasmado.png',
            temporoOregaos: 'images/remy/remySatisfeito.png',
            combinacaoFinal: 'images/remy/remySatisfeito.png',
        };
        imgRemy.src = remyEstados[estado];
    }

    // ─── EFEITOS DOS TEMPEROS ─────────────────────

    function aplicarEfeitoTempero(video) {
        const tempero = temperosAtivos[0];
        if (!tempero) return;

        const aplicar = () => {
            if (tempero === 'sal') {
                video.style.filter = 'brightness(1.8) saturate(2) contrast(1.2)';
            } else if (tempero === 'oregaos') {
                video.playbackRate = 0.6;
            } else if (tempero === 'pimenta') {
                video.playbackRate = 1.4;
            }
        };

        aplicar();
        video.addEventListener('loadedmetadata', aplicar);
        video.addEventListener('canplay', aplicar);
        video.addEventListener('play', aplicar);
    }

    // ─── COLHER ──────────────────────────────────

    btnColher.setAttribute('draggable', true);

    btnColher.addEventListener('dragstart', (e) => {
        if (btnColher.disabled) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('tipo', 'colher');
        const img = btnColher.querySelector('img');
        e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    });

    // ─── SINALÉTICA MISTURA ──────────────────────

    function mostrarSinalMistura() {
        if (document.getElementById('sinal-mistura')) return;
        const sinal = document.createElement('div');
        sinal.id = 'sinal-mistura';
        sinal.innerHTML = `
    <div class="anel-mistura">
        <svg viewBox="0 0 220 220" width="220" height="220" fill="none">
            <!-- Arco 1: canto superior esquerdo -->
            <path d="M 30 110 A 80 80 0 0 1 110 30" 
                  stroke="rgba(255,255,255,0.5)" stroke-width="5" stroke-linecap="round"/>
            <!-- Ponta da seta 1: no início do arco (lado esquerdo) -->
            <polygon points="30,125 20,108 40,108" 
                     fill="rgba(255,255,255,0.5)"/>
            
            <!-- Arco 2: canto inferior direito -->
            <path d="M 190 110 A 80 80 0 0 1 110 190" 
                  stroke="rgba(255,255,255,0.5)" stroke-width="5" stroke-linecap="round"/>
            <!-- Ponta da seta 2: no início do arco (lado direito) -->
            <polygon points="190,95 200,112 180,112" 
                     fill="rgba(255,255,255,0.5)"/>
        </svg>
    </div>
`;

        document.getElementById('panela').appendChild(sinal);
    }

    // ─── MISTURAR ────────────────────────────────

    hitbox.addEventListener('mousemove', e => {
        if (!colherAtiva || ingredientesNaPanela.length < 2 || jaMisturou) return;

        const rect = hitbox.getBoundingClientRect();
        const anguloAtual = Math.atan2(
            e.clientY - (rect.top + rect.height / 2),
            e.clientX - (rect.left + rect.width / 2)
        ) * (180 / Math.PI);

        if (ultimoAngulo !== null) {
            let diff = Math.abs(anguloAtual - ultimoAngulo);
            if (diff < 180) anguloAcumulado += diff;
            if (anguloAcumulado > 800) {
                jaMisturou = true;
                mostrarAnimacaoFinal();
            }
        }
        ultimoAngulo = anguloAtual;
    });

    // ─── ANIMAÇÃO FINAL ──────────────────────────

    function mostrarAnimacaoFinal() {
        const panela = document.getElementById('panela');
        const sinal = document.getElementById('sinal-mistura');
        if (sinal) sinal.remove();

        const imgs = divReais.querySelectorAll('.ingrediente-caido');
        imgs.forEach(img => {
            img.style.transition = 'opacity 0.8s';
            img.style.opacity = '0';
        });

        setTimeout(() => {
            iniciarSinestesiaExterna();
            divReais.classList.add('escondido');

            const vinheta = document.createElement('div');
            vinheta.id = 'vinheta-panela';
            vinheta.style.cssText = `
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 50;
                opacity: 0;
                background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%);
                transition: opacity 2s ease;
            `;
            document.body.appendChild(vinheta);
            requestAnimationFrame(() => requestAnimationFrame(() => { vinheta.style.opacity = '1'; }));

            panela.querySelectorAll('.video-combinacao, .video-puff').forEach(v => v.remove());
            colherAtiva = false;
            panela.style.cursor = 'default';

            if (temperosAtivos[0] === 'pimenta') atualizarRemy('misturarPimenta');
            else if (temperosAtivos[0] === 'oregaos') atualizarRemy('misturarOregaos');
            else atualizarRemy('misturar');

            if (ingredientesNaPanela.length === 0) return;

            const id0 = ingredientesNaPanela[0];
            const video0 = criarVideoAnimacao(id0, 8);
            panela.appendChild(video0);
            video0.load();
            video0.play().catch(err => console.log('Erro v0:', err));
            aplicarEfeitoTempero(video0);
            tocarSomMix();

            let video1 = null;
            if (ingredientesNaPanela.length >= 2) {
                const id1 = ingredientesNaPanela[1];
                video1 = criarVideoAnimacao(id1, 9);
                video1.style.opacity = '0';
                panela.appendChild(video1);
                video1.load();

                video0.addEventListener('loadedmetadata', () => {
                    const metade = (video0.duration / 2) * 1000;
                    setTimeout(() => {
                        video1.play().catch(err => console.log('Erro v1:', err));
                        aplicarEfeitoTempero(video1);
                        video1.style.transition = 'opacity 0.4s';
                        video1.style.opacity = '1';
                    }, metade);
                });
            }

            // ── Vídeo do tempero ──
            if (temperosAtivos.length > 0) {
                const mapaAnimacoesTemperos = {
                    'sal': 'sal',
                    'pimenta': 'pimentaPreta',
                    'oregaos': 'oregaos'
                };
                const idTempero = mapaAnimacoesTemperos[temperosAtivos[0]];
                const videoTempero = criarVideoAnimacao(idTempero, 10);
                panela.appendChild(videoTempero);
                videoTempero.load();
                videoTempero.play().catch(err => console.log('Erro tempero:', err));

                panela.addEventListener('puff-iniciado', () => {
                    videoTempero.style.transition = 'opacity 0.5s';
                    videoTempero.style.opacity = '0';
                    setTimeout(() => videoTempero.remove(), 500);
                });
            }

            const videoRef = video1 || video0;
            const antecipacaoSegundos = 0.6;

            videoRef.addEventListener('loadedmetadata', () => {
                const tempoParaPuff = Math.max(0, (videoRef.duration - antecipacaoSegundos) * 1000);

                if (video1 && videoRef === video1) {
                    video0.addEventListener('loadedmetadata', () => {
                        const inicioVideo1 = (video0.duration / 2) * 1000;
                        const delayTotal = inicioVideo1 + tempoParaPuff;
                        setTimeout(() => mostrarPuff(panela, [video0, video1].filter(Boolean)), delayTotal);
                    });
                } else {
                    setTimeout(() => mostrarPuff(panela, [video0]), tempoParaPuff);
                }
            });

            video0.addEventListener('ended', () => {
                if (!panela.querySelector('.video-puff')) {
                    mostrarPuff(panela, [video0, video1].filter(Boolean));
                }
            });

        }, 800);
    }

    function criarVideoAnimacao(id, zIndex) {
        const video = document.createElement('video');
        video.className = 'video-animacao video-combinacao';
        video.autoplay = false;
        video.muted = true;
        video.playsInline = true;
        video.style.zIndex = zIndex;

        const source = document.createElement('source');
        source.src = `images/animacoes/${id}.webm`;
        source.type = 'video/webm';
        video.appendChild(source);

        return video;
    }

    function mostrarPuff(panela, videosCombinacao) {
        if (panela.querySelector('.video-puff')) return;
        panela.dispatchEvent(new Event('puff-iniciado'));
        tocarSomReveal();
        tocarSomPuff();

        const vinheta = document.getElementById('vinheta-panela');
        if (vinheta) {
            vinheta.style.transition = 'opacity 1.5s ease';
            vinheta.style.opacity = '0';
            setTimeout(() => vinheta.remove(), 1500);
        }

        videosCombinacao.forEach(v => {
            v.style.transition = 'opacity 0.5s';
            v.style.opacity = '0';
            setTimeout(() => v.remove(), 500);
        });

        const mapa = {
            'caju+brie': 'cajuBrie',             'brie+caju': 'cajuBrie',
            'caju+chocolate': 'cajuChocolate',   'chocolate+caju': 'cajuChocolate',
            'chocolate+brie': 'chocolateBrie',   'brie+chocolate': 'chocolateBrie',
            'morango+brie': 'morangoBrie',       'brie+morango': 'morangoBrie',
            'morango+caju': 'morangoCaju',       'caju+morango': 'morangoCaju',
            'morango+chocolate': 'morangoChocolate', 'chocolate+morango': 'morangoChocolate',
            'morango+cenoura': 'morangoCenoura', 'cenoura+morango': 'morangoCenoura',
            'morango+noz': 'nozMorango',         'noz+morango': 'nozMorango',
            'morango+tomate': 'tomateMorango',   'tomate+morango': 'tomateMorango',
            'morango+uva': 'uvaMorango',         'uva+morango': 'uvaMorango',
            'cenoura+brie': 'cenouraBrie',       'brie+cenoura': 'cenouraBrie',
            'tomate+brie': 'tomateBrie',         'brie+tomate': 'tomateBrie',
            'noz+brie': 'nozBrie',               'brie+noz': 'nozBrie',
            'uva+brie': 'uvaBrie',               'brie+uva': 'uvaBrie',
            'caju+tomate': 'cajuTomate',         'tomate+caju': 'cajuTomate',
            'caju+noz': 'nozCaju',               'noz+caju': 'nozCaju',
            'caju+uva': 'uvaCaju',               'uva+caju': 'uvaCaju',
            'caju+cenoura': 'cajuCenoura',       'cenoura+caju': 'cajuCenoura',
            'chocolate+tomate': 'chocolateTomate', 'tomate+chocolate': 'chocolateTomate',
            'chocolate+uva': 'uvaChocolate',       'uva+chocolate': 'uvaChocolate',
            'chocolate+cenoura': 'cenouraChocolate', 'cenoura+chocolate': 'cenouraChocolate',
            'noz+chocolate': 'chocolateNoz',       'chocolate+noz': 'chocolateNoz',
            'tomate+noz': 'tomateNoz',           'noz+tomate': 'tomateNoz',
            'tomate+uva': 'uvaTomate',           'uva+tomate': 'uvaTomate',
            'tomate+cenoura': 'cenouraTomate',   'cenoura+tomate': 'cenouraTomate',
            'noz+uva': 'uvaNoz',                 'uva+noz': 'uvaNoz',
            'noz+cenoura': 'nozCenoura',         'cenoura+noz': 'nozCenoura',
            'uva+cenoura': 'cenouraUva',         'cenoura+uva': 'cenouraUva',
        };

        const chave = ingredientesNaPanela[0] + '+' + ingredientesNaPanela[1];
        const idCombinacao = mapa[chave];

        const imgCombinacao = document.createElement('img');
        imgCombinacao.src = `images/combinacoes/${idCombinacao}.png`;
        imgCombinacao.className = 'imagem-combinacao';
        imgCombinacao.style.opacity = '0';
        imgCombinacao.style.position = 'absolute';
        imgCombinacao.style.top = '11px';
        imgCombinacao.style.left = '46%';
        imgCombinacao.style.transform = 'translateX(-50%)';
        imgCombinacao.style.width = '68%';
        imgCombinacao.style.height = '65%';
        imgCombinacao.style.objectFit = 'fill';
        imgCombinacao.style.zIndex = '19';
        panela.appendChild(imgCombinacao);

        const puff = document.createElement('video');
        puff.className = 'video-animacao video-puff';
        puff.autoplay = true;
        puff.muted = true;
        puff.playsInline = true;
        puff.style.zIndex = '20';

        const sourcePuff = document.createElement('source');
        sourcePuff.src = 'images/animacoes/puff.webm';
        sourcePuff.type = 'video/webm';
        puff.appendChild(sourcePuff);

        panela.appendChild(puff);
        puff.load();
        puff.play().catch(err => console.log('Erro puff:', err));

        puff.addEventListener('loadedmetadata', () => {
            const metade = (puff.duration / 2) * 1000;
            setTimeout(() => {
                imgCombinacao.style.transition = 'opacity 0.4s';
                imgCombinacao.style.opacity = '1';
                atualizarRemy('combinacaoFinal');
                combinacaoCompleta = true;
                imgGuardar.src = 'images/botoes/guardar-ativo.png';
            }, metade);
        });

        puff.addEventListener('ended', () => {
            puff.style.transition = 'opacity 0.5s';
            puff.style.opacity = '0';
            setTimeout(() => puff.remove(), 500);
        });
    }

    // ─── SINESTESIA EXTERNA (bokeh estilo cena do filme) ──────────

    function iniciarSinestesiaExterna() {
        const canvas = document.getElementById('canvas-panela');
        const ctx = canvas.getContext('2d');
        const panelaEl = document.getElementById('panela');

        const estilosOriginais = {
            position: canvas.style.position,
            top: canvas.style.top,
            left: canvas.style.left,
            width: canvas.style.width,
            height: canvas.style.height,
            borderRadius: canvas.style.borderRadius,
            zIndex: canvas.style.zIndex,
            pointerEvents: canvas.style.pointerEvents,
        };

        const panelaRect = panelaEl.getBoundingClientRect();
        const expansao = 700;
        const W = panelaRect.width + expansao * 2;
        const H = panelaRect.height + expansao * 2;

        canvas.width = W;
        canvas.height = H;
        canvas.style.position = 'absolute';
        canvas.style.left = `${-expansao}px`;
        canvas.style.top = `${-expansao}px`;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        canvas.style.borderRadius = '0';
        canvas.style.zIndex = '15';
        canvas.style.pointerEvents = 'none';

        const cx = W / 2 - 15;
        const cy = H / 2 - 30;
        const pRadius = (527 * 0.30);

        const cA = CORES_INGREDIENTES[ingredientesNaPanela[0]] || { c1: '#ffffff', c2: '#aaaaaa', c3: '#eeeeee' };
        const cB = CORES_INGREDIENTES[ingredientesNaPanela[1]] || cA;

        let bokehBalls = [];
        let particles = [];
        let frameCount = 0;
        let animId;
        let ativo = true;

        // ── Bokeh —──
        class BokehBall {
            constructor() {
                let valido = false;
                while (!valido) {
                    this.x = Math.random() * W;
                    this.y = Math.random() * H;
                    const dx = this.x - cx;
                    const dy = this.y - cy;
                    if (Math.sqrt(dx * dx + dy * dy) > pRadius + 60) valido = true;
                }

                this.raioBase = 15 + Math.random() * 80;
                this.raio = this.raioBase;

                if (Math.random() < 0.2) {
                    this.raioBase = 80 + Math.random() * 120;
                    this.alphaMax = 0.3 + Math.random() * 0.2;
                }

                this.fase = Math.random() * Math.PI * 2;
                this.velPulso = 0.01 + Math.random() * 0.02;

                const corObj = Math.random() < 0.5 ? cA : cB;
                this.cor = [corObj.c1, corObj.c2, corObj.c3][Math.floor(Math.random() * 3)];

                const angMov = Math.random() * Math.PI * 2;
                const vel = 0.2 + Math.random() * 0.5;
                this.vx = Math.cos(angMov) * vel;
                this.vy = Math.sin(angMov) * vel;

                this.vida = 0;
                this.vidaMax = 180 + Math.random() * 240;
                this.alphaMax = 0.5 + Math.random() * 0.4;
            }

            update() {
                this.fase += this.velPulso;
                this.raio = this.raioBase * (0.95 + Math.sin(this.fase) * 0.05);
                this.x += this.vx;
                this.y += this.vy;
                this.vida++;
            }

            get alpha() {
                const p = this.vida / this.vidaMax;
                if (p < 0.15) return (p / 0.15) * this.alphaMax;
                if (p > 0.75) return ((1 - p) / 0.25) * this.alphaMax;
                return this.alphaMax;
            }

            get morta() { return this.vida >= this.vidaMax; }

            draw() {
                const grad = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.raio
                );

                const hex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');

                grad.addColorStop(0,   this.cor + hex(this.alpha));
                grad.addColorStop(0.5, this.cor + hex(this.alpha * 0.6));
                grad.addColorStop(0.8, this.cor + hex(this.alpha * 0.2));
                grad.addColorStop(1,   this.cor + '00');

                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // ── Partículas: círculos, ondulantes e losangos ──
        class Particula {
            constructor() {
                const angulo = Math.random() * Math.PI * 2;
                const dist = pRadius + 5 + Math.random() * 15;
                this.x = cx + Math.cos(angulo) * dist;
                this.y = cy + Math.sin(angulo) * dist;
                this.vx = Math.cos(angulo) * (0.6 + Math.random() * 2.2);
                this.vy = Math.sin(angulo) * (0.6 + Math.random() * 2.2);
                this.vida = 0;
                this.vidaMax = 90 + Math.random() * 130;
                this.tamanho = 4 + Math.random() * 10;
                const corObj = Math.random() < 0.5 ? cA : cB;
                this.cor = [corObj.c1, corObj.c2, corObj.c3][Math.floor(Math.random() * 3)];
                this.forma = Math.floor(Math.random() * 3);
                this.rotacao = Math.random() * Math.PI * 2;
                this.velRot = (Math.random() - 0.5) * 0.06;
                this.fase = Math.random() * Math.PI * 2;
                this.amplitude = 2 + Math.random() * 4;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotacao += this.velRot;
                this.fase += 0.12;
                if (this.forma === 1) {
                    const perp = Math.atan2(this.vy, this.vx) + Math.PI / 2;
                    this.x += Math.cos(perp) * Math.sin(this.fase) * this.amplitude * 0.3;
                    this.y += Math.sin(perp) * Math.sin(this.fase) * this.amplitude * 0.3;
                }
                this.vida++;
            }

            get alpha() {
                const p = this.vida / this.vidaMax;
                if (p < 0.2) return p / 0.2;
                if (p > 0.65) return (1 - p) / 0.35;
                return 1;
            }

            get morta() { return this.vida >= this.vidaMax; }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha * 0.9;
                ctx.fillStyle = this.cor;
                ctx.strokeStyle = this.cor;
                ctx.lineWidth = 2;
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotacao);

                if (this.forma === 0) {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.tamanho, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.forma === 1) {
                    const comprimento = this.tamanho * 3;
                    const passos = 20;
                    ctx.beginPath();
                    for (let i = 0; i <= passos; i++) {
                        const px = -comprimento/2 + (i / passos) * comprimento;
                        const py = Math.sin((i / passos) * Math.PI * 2 + this.fase) * this.amplitude;
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                } else {
                    const s = this.tamanho;
                    ctx.beginPath();
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.6, 0);
                    ctx.lineTo(0, s);
                    ctx.lineTo(-s * 0.6, 0);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        function loop() {
            if (!ativo) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frameCount++;

            // Bokeh: aparecem com frequência moderada, várias em simultâneo
            if (frameCount % 6 === 0) {
                bokehBalls.push(new BokehBall());
                if (Math.random() < 0.3) bokehBalls.push(new BokehBall());
            }

            // Partículas saem da panela
            if (frameCount % 3 === 0) particles.push(new Particula());

            // Desenhar bokeh primeiro (camada de fundo)
            bokehBalls.forEach(b => { b.update(); b.draw(); });
            // Partículas por cima
            particles.forEach(p => { p.update(); p.draw(); });

            bokehBalls = bokehBalls.filter(b => !b.morta);
            particles = particles.filter(p => !p.morta);

            animId = requestAnimationFrame(loop);
        }

        loop();

        panela.addEventListener('puff-iniciado', () => {
            ativo = false;
            cancelAnimationFrame(animId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            canvas.style.position = estilosOriginais.position;
            canvas.style.top = estilosOriginais.top;
            canvas.style.left = estilosOriginais.left;
            canvas.style.width = estilosOriginais.width;
            canvas.style.height = estilosOriginais.height;
            canvas.style.borderRadius = estilosOriginais.borderRadius;
            canvas.style.zIndex = estilosOriginais.zIndex;
            canvas.style.pointerEvents = estilosOriginais.pointerEvents;
        }, { once: true });


    }

    // ─── RESET ───────────────────────────────────

    document.getElementById('btn-limpar').addEventListener('click', () => {
        tocarSomLimpar();
        limparPanela();
    });

    function limparPanela() {
        ingredientesNaPanela = [];
        temperosAtivos = [];
        anguloAcumulado = 0;
        ultimoAngulo = null;
        jaMisturou = false;
        colherAtiva = false;
        combinacaoCompleta = false;
        const sinal = document.getElementById('sinal-mistura');
        if (sinal) sinal.remove();

        document.querySelectorAll('.item-arrastavel img').forEach(img => {
            img.style.opacity = '1';
        });

        const vinheta = document.getElementById('vinheta-panela');
        if (vinheta) vinheta.remove();

        divReais.innerHTML = '';
        divReais.classList.remove('escondido');

        const videoTemperoAtivo = document.getElementById('video-tempero-ativo');
        if (videoTemperoAtivo) videoTemperoAtivo.remove();

        document.querySelectorAll('.video-animacao').forEach(v => v.remove());
        document.querySelectorAll('.imagem-combinacao').forEach(v => v.remove());

        const canvas = document.getElementById('canvas-panela');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        btnColher.disabled = true;
        imgColher.src = 'images/botoes/colher-inativa.png';
        imgGuardar.src = 'images/botoes/guardar-inativo.png';
        imgLimpar.src = 'images/botoes/limpar-inativo.png';

        document.getElementById('panela').style.cursor = 'default';
        remyContainer.classList.remove('visivel');

        paginaAtual = 0;
        renderizarPagina(0);
    }

    // ─── GUARDAR ─────────────────────────────────

    const popupOverlay = document.getElementById('popup-overlay');
    const popupInput = document.getElementById('popup-input');

    document.getElementById('btn-guardar').addEventListener('click', () => {
        if (ingredientesNaPanela.length < 2 || !combinacaoCompleta) return;
        tocarSomSalvar();
        popupOverlay.classList.remove('escondido');
        popupInput.value = '';
        popupInput.focus();
    });

    document.getElementById('popup-cancelar').addEventListener('click', () => {
        tocarSomVoltar();
        popupOverlay.classList.add('escondido');
    });

    document.getElementById('popup-confirmar').addEventListener('click', () => {
        tocarSomGuardar();
        const nome = popupInput.value.trim() || 'Sem nome';
        popupOverlay.classList.add('escondido');

        if (window.combinacoesGuardadas.length < 8) {
            const mapa = {
                'caju+brie': 'cajuBrie',             'brie+caju': 'cajuBrie',
                'caju+chocolate': 'cajuChocolate',   'chocolate+caju': 'cajuChocolate',
                'chocolate+brie': 'chocolateBrie',   'brie+chocolate': 'chocolateBrie',
                'morango+brie': 'morangoBrie',       'brie+morango': 'morangoBrie',
                'morango+caju': 'morangoCaju',       'caju+morango': 'morangoCaju',
                'morango+chocolate': 'morangoChocolate', 'chocolate+morango': 'morangoChocolate',
                'morango+cenoura': 'morangoCenoura', 'cenoura+morango': 'morangoCenoura',
                'morango+noz': 'nozMorango',         'noz+morango': 'nozMorango',
                'morango+tomate': 'tomateMorango',   'tomate+morango': 'tomateMorango',
                'morango+uva': 'uvaMorango',         'uva+morango': 'uvaMorango',
                'cenoura+brie': 'cenouraBrie',       'brie+cenoura': 'cenouraBrie',
                'tomate+brie': 'tomateBrie',         'brie+tomate': 'tomateBrie',
                'noz+brie': 'nozBrie',               'brie+noz': 'nozBrie',
                'uva+brie': 'uvaBrie',               'brie+uva': 'uvaBrie',
                'caju+tomate': 'cajuTomate',         'tomate+caju': 'cajuTomate',
                'caju+noz': 'nozCaju',               'noz+caju': 'nozCaju',
                'caju+uva': 'uvaCaju',               'uva+caju': 'uvaCaju',
                'caju+cenoura': 'cajuCenoura',       'cenoura+caju': 'cajuCenoura',
                'chocolate+tomate': 'chocolateTomate', 'tomate+chocolate': 'chocolateTomate',
                'chocolate+uva': 'uvaChocolate',       'uva+chocolate': 'uvaChocolate',
                'chocolate+cenoura': 'cenouraChocolate', 'cenoura+chocolate': 'cenouraChocolate',
                'noz+chocolate': 'chocolateNoz',       'chocolate+noz': 'chocolateNoz',
                'tomate+noz': 'tomateNoz',           'noz+tomate': 'tomateNoz',
                'tomate+uva': 'uvaTomate',           'uva+tomate': 'uvaTomate',
                'tomate+cenoura': 'cenouraTomate',   'cenoura+tomate': 'cenouraTomate',
                'noz+uva': 'uvaNoz',                 'uva+noz': 'uvaNoz',
                'noz+cenoura': 'nozCenoura',         'cenoura+noz': 'nozCenoura',
                'uva+cenoura': 'cenouraUva',         'cenoura+uva': 'cenouraUva',
            };
            const chave = ingredientesNaPanela[0] + '+' + ingredientesNaPanela[1];
            window.combinacoesGuardadas.push({
                id: mapa[chave],
                nome: nome,
                ingredientes: [...ingredientesNaPanela],
                tempero: temperosAtivos[0] || null
            });
            setaGaleria.style.visibility = 'visible';
        }

        const transicao = document.getElementById('transicao-galeria');
        transicao.classList.add('ativa');
        setTimeout(() => {
            transicao.classList.remove('ativa');
            document.getElementById('secao-jogo').classList.add('secao-escondida');
            document.getElementById('secao-galeria').classList.remove('secao-escondida');
            iniciarGaleria();
        }, 500);
    });

    document.querySelector('.seta-subir').addEventListener('click', () => {
        tocarSomSeta();
        const transicao = document.getElementById('transicao-galeria');
        transicao.classList.add('ativa');
        setTimeout(() => {
            transicao.classList.remove('ativa');
            document.getElementById('secao-jogo').classList.add('secao-escondida');
            document.getElementById('secao-galeria').classList.remove('secao-escondida');
            iniciarGaleria();
        }, 500);
    });
}