// ─── INICIAR GALERIA ─────────────────────────────

function iniciarGaleria() {
    const combinacoes = [...(window.combinacoesGuardadas || [])].reverse();
    const grid = document.getElementById('cards-grid');

    grid.innerHTML = '';

    const mapaIcones = {
        'caju': 'cajus',
        'morango': 'morango',
        'chocolate': 'chocolate',
        'brie': 'brie'
    };

    const papeis = ['papel1', 'papel2', 'papel3', 'papel4'];

    for (let i = 0; i < 8; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        const papel = papeis[i % 4];

        if (combinacoes[i]) {
            const c = combinacoes[i];

            const papelImg = document.createElement('img');
            papelImg.src = `images/papeis/${papel}.png`;
            papelImg.className = 'card-papel';
            card.appendChild(papelImg);

            const img = document.createElement('img');
            img.src = `images/combinacoes/${c.id}Card.png`;
            img.className = 'card-imagem';
            card.appendChild(img);

            const nome = document.createElement('p');
            nome.className = 'card-nome';
            nome.textContent = c.nome;
            card.appendChild(nome);

            const rodape = document.createElement('div');
            rodape.className = 'card-rodape';

            const icones = document.createElement('div');
            icones.className = 'card-icones';
            c.ingredientes.forEach(ing => {
                const icone = document.createElement('img');
                icone.src = `images/icones/${mapaIcones[ing] || ing}.png`;
                icone.alt = ing;
                icones.appendChild(icone);
            });
            rodape.appendChild(icones);

            const btnPartilhar = document.createElement('button');
            btnPartilhar.className = 'card-partilhar';
            btnPartilhar.innerHTML = `<img src="images/botoes/transferir.png" alt="Transferir">`;
            btnPartilhar.addEventListener('click', (e) => {
                e.stopPropagation();
                partilharCard(c, papel);
            });
            rodape.appendChild(btnPartilhar);

            const btnImprimir = document.createElement('button');
            btnImprimir.className = 'card-partilhar';
            btnImprimir.innerHTML = `<img src="images/botoes/imprimir.png" alt="Imprimir">`;
            btnImprimir.addEventListener('click', (e) => {
                e.stopPropagation();
                imprimirCarimbo(c);
            });
            rodape.appendChild(btnImprimir);
            card.appendChild(rodape);

            card.addEventListener('click', () => {
                tocarSomCliquePapel();
                abrirModal(c, papel, i);
            });

        } else {
            card.classList.add('card-vazia');
            const papelImg = document.createElement('img');
            papelImg.src = `images/papeis/${papel}.png`;
            papelImg.className = 'card-papel';
            card.appendChild(papelImg);
        }

        grid.appendChild(card);
    }

    // ── Modal ──
    const modalOverlay = document.getElementById('modal-overlay');
    const modalPapel = document.getElementById('modal-papel');
    const modalNome = document.getElementById('modal-nome');
    const modalIcones = document.getElementById('modal-icones');
    const btnFechar = document.getElementById('btn-fechar');
    const elementos = document.getElementById('modal-elementos');

    const mapaAnimacoesMix = {
        'cajuBrie':          'cajuBrieMix',
        'cajuChocolate':     'cajuChocolateMix',
        'chocolateBrie':     'chocolateBrieMix',
        'morangoBrie':       'morangoBrieMix',
        'morangoCaju':       'cajuMorangoMix',
        'morangoChocolate':  'morangoChocolateMix',
        'morangoCenoura':    'morangoCenouraMix',
        'nozMorango':        'nozMorangoMix',
        'tomateMorango':     'tomateMorangoMix',
        'uvaMorango':        'uvaMorangoMix',
        'cenouraBrie':       'cenouraBrieMix',
        'tomateBrie':        'tomateBrieMix',
        'nozBrie':           'nozBrieMix',
        'uvaBrie':           'uvaBrieMix',
        'cajuTomate':        'cajuTomateMix',
        'nozCaju':           'nozCajuMix',
        'uvaCaju':           'uvaCajuMix',
        'cajuCenoura':       'cajuCenouraMix',
        'chocolateTomate':   'chocolateTomateMix',
        'uvaChocolate':      'uvaChocolateMix',
        'cenouraChocolate':  'cenouraChocolateMix',
        'chocolateNoz':      'chocolateNozMix',
        'tomateNoz':         'tomateNozMix',
        'uvaTomate':         'uvaTomateMix',
        'cenouraTomate':     'cenouraTomateMix',
        'uvaNoz':            'uvaNozMix',
        'cenouraUva':        'cenouraUvaMix',
        'nozCenoura':        'nozCenouraMix',
    };

    function abrirModal(c, papel, index) {
        const isGrande = (index % 4 === 3);
        modalPapel.classList.toggle('grande', isGrande);
        document.querySelector('.modal-conteudo').classList.toggle('grande', isGrande);
        modalPapel.src = `images/papeis/${papel}Big.png`;
        modalNome.textContent = c.nome;

        modalIcones.innerHTML = '';
        c.ingredientes.forEach(ing => {
            const icone = document.createElement('img');
            icone.src = `images/icones/${mapaIcones[ing] || ing}.png`;
            icone.alt = ing;
            modalIcones.appendChild(icone);
        });

        const wrapperAnterior = document.getElementById('modal-video-wrapper');
        if (wrapperAnterior) {
            const imgAntiga = wrapperAnterior.querySelector('img');
            if (imgAntiga) elementos.insertBefore(imgAntiga, wrapperAnterior);
            wrapperAnterior.remove();
        }

        let modalImagem = elementos.querySelector('.modal-imagem');
        if (!modalImagem) {
            modalImagem = document.createElement('img');
            modalImagem.className = 'modal-imagem';
            elementos.insertBefore(modalImagem, elementos.firstChild);
        }
        modalImagem.src = `images/combinacoes/${c.id}Card.png`;

        const videoWrapper = document.createElement('div');
        videoWrapper.id = 'modal-video-wrapper';
        videoWrapper.style.cssText = `
            position: relative;
            width: 160px;
            height: 160px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
        `;

        const video = document.createElement('video');
        video.id = 'modal-video';
        video.muted = true;
        video.playsInline = true;
        video.style.cssText = `
            position: absolute;
            top: -120px; left: -160px;
            width: 520px; height: 520px;
            object-fit: cover;
            opacity: 0;
            pointer-events: none;
            z-index: 2;
        `;
        const source = document.createElement('source');
        source.src = `images/animacoes/${mapaAnimacoesMix[c.id]}.webm`;
        source.type = 'video/webm';
        video.appendChild(source);

        modalImagem.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 160px; height: 160px;
            object-fit: contain;
            border-radius: 50%;
            cursor: pointer;
        `;

        videoWrapper.appendChild(modalImagem);
        videoWrapper.appendChild(video);
        elementos.insertBefore(videoWrapper, elementos.firstChild);

        modalImagem.addEventListener('mouseenter', () => {
            modalImagem.style.transition = 'opacity 0.4s ease';
            video.style.transition = 'opacity 0.4s ease';
            modalImagem.style.opacity = '0.1';
            video.style.opacity = '1';
            video.load();
            video.play();
        });

        video.addEventListener('ended', () => {
            video.style.opacity = '0';
            modalImagem.style.opacity = '1';
        });

        modalImagem.addEventListener('mouseleave', () => {
            video.style.opacity = '0';
            modalImagem.style.opacity = '1';
            video.pause();
            video.currentTime = 0;
        });

        const btnPartilhar = document.getElementById('modal-partilhar');
        const btnPartilharNovo = btnPartilhar.cloneNode(true);
        btnPartilhar.parentNode.replaceChild(btnPartilharNovo, btnPartilhar);
        btnPartilharNovo.addEventListener('click', () => partilharCard(c, papel));

        const btnImprimir = document.getElementById('modal-imprimir');
        const btnImprimirNovo = btnImprimir.cloneNode(true);
        btnImprimir.parentNode.replaceChild(btnImprimirNovo, btnImprimir);
        btnImprimirNovo.addEventListener('click', () => imprimirCarimbo(c));

        modalOverlay.classList.remove('escondido');
    }

    const btnFecharNovo = btnFechar.cloneNode(true);
    btnFechar.parentNode.replaceChild(btnFecharNovo, btnFechar);

    btnFecharNovo.addEventListener('click', () => {
        tocarSomFechar();
        modalOverlay.classList.add('escondido');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            tocarSomFechar();
            modalOverlay.classList.add('escondido');
        }
    });

    // ── Voltar ao jogo ──
    const setaVoltar = document.getElementById('seta-voltar');
    const setaVoltarNova = setaVoltar.cloneNode(true);
    setaVoltar.parentNode.replaceChild(setaVoltarNova, setaVoltar);
    setaVoltarNova.addEventListener('click', () => {
        tocarSomVoltar();
        setTimeout(() => {
            document.getElementById('secao-galeria').classList.add('secao-escondida');
            document.getElementById('secao-jogo').classList.remove('secao-escondida');
            if (window.limparPanela) window.limparPanela();
        }, 300);
    });

    // ── Partilhar ──
    async function partilharCard(c, papel) {
        tocarSomClique();
        try {
            const dimensoes = {
                'papel1': { width: 552, height: 792 },
                'papel2': { width: 540, height: 808 },
                'papel3': { width: 524, height: 790 },
                'papel4': { width: 688, height: 889 },
            };

            const dim = dimensoes[papel];

            const container = document.createElement('div');
            container.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: ${dim.width}px;
                height: ${dim.height}px;
            `;

            const papelBig = document.createElement('img');
            papelBig.src = `images/papeis/${papel}Big.png`;
            papelBig.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0;';
            container.appendChild(papelBig);

            const imgComb = document.createElement('img');
            imgComb.src = `images/combinacoes/${c.id}Card.png`;
            imgComb.style.cssText = `
                position: absolute;
                top: 57%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 260px;
                height: 260px;
                object-fit: contain;
                border-radius: 50%;
            `;
            container.appendChild(imgComb);

            const nomeEl = document.createElement('p');
            nomeEl.textContent = c.nome;
            nomeEl.style.cssText = `
                position: absolute;
                top: 75%;
                left: 50%;
                transform: translateX(-50%);
                font-family: Caveat, cursive;
                font-size: 33px;
                font-weight: 700;
                color: #3C282A;
                white-space: nowrap;
                margin: 0;
            `;
            container.appendChild(nomeEl);

            const iconesEl = document.createElement('div');
            iconesEl.style.cssText = `
                position: absolute;
                top: 82%;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
            `;
            c.ingredientes.forEach(ing => {
                const icone = document.createElement('img');
                icone.src = `images/icones/${mapaIcones[ing] || ing}.png`;
                icone.style.cssText = 'height: 50px; object-fit: contain; border-radius: 0; flex-shrink: 0;';
                iconesEl.appendChild(icone);
            });
            container.appendChild(iconesEl);

            document.body.appendChild(container);

            await Promise.all([...container.querySelectorAll('img')].map(img =>
                img.complete ? Promise.resolve() : new Promise(res => {
                    img.onload = res;
                    img.onerror = res;
                })
            ));

            const { default: html2canvas } = await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js');
            const canvas = await html2canvas(container, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                width: dim.width,
                height: dim.height,
            });

            document.body.removeChild(container);

            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.download = `${c.nome || 'combinacao'}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
            });

        } catch (err) {
            console.error('Erro:', err);
        }
    }

    // ── Imprimir carimbo ──
    async function imprimirCarimbo(c) {
        // Converte imagem para base64 para evitar problemas de CORS
        const resposta = await fetch(`images/combinacoes/${c.id}Card.png`);
        const blob = await resposta.blob();
        const base64 = await new Promise(res => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(blob);
        });

        const janelaImpressao = window.open('', '_blank');
        janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Carimbo — ${c.nome}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: white;
                    padding: 40px;
                }
                .carimbo-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }
                .carimbo {
                    width: 300px;
                    height: 300px;
                    border: 2px dashed #999;
                    border-radius: 50%;
                    object-fit: contain;
                    filter: grayscale(1) contrast(2) invert(1);
                }
                .titulo-carimbo {
                    font-family: 'Caveat', cursive;
                    font-size: 22px;
                    color: #3C282A;
                }
                .instrucoes {
                    font-family: sans-serif;
                    font-size: 14px;
                    color: #444;
                    line-height: 2;
                    text-align: left;
                }
                .instrucoes h3 {
                    font-family: 'Caveat', cursive;
                    font-size: 20px;
                    margin-bottom: 8px;
                    color: #3C282A;
                }
                @media print {
                    .instrucoes { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="carimbo-wrapper">
                <img class="carimbo" src="${base64}" alt="${c.nome}">
                <p class="titulo-carimbo">${c.nome}</p>
                <div class="instrucoes">
                    <h3>Como fazer o teu carimbo:</h3>
                    1. Imprime e recorta a forma pelo tracejado<br>
                    2. Contorna as formas em papel EVA e recorta<br>
                    3. Cola as formas num pedaço de cartão como base com uma pega<br>
                    4. Mergulha em tinta e pressiona sobre papel
                </div>
            </div>
            <script>window.onload = () => window.print();<\/script>
        </body>
        </html>
    `);
        janelaImpressao.document.close();
    }
}