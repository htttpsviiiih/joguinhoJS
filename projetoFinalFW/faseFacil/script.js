const tela = document.getElementsByTagName("tela")[0];
const canvas = document.createElement("canvas");
tela.appendChild(canvas);
canvas.width = tela.getAttribute("largura");
canvas.height = tela.getAttribute("altura");
canvas.style = "border:1px solid black";
const ctx = canvas.getContext("2d");
const texto = document.getElementById("texto");
const placarDiv = document.getElementById("placar");

let moedasPegas = 0;

document.addEventListener("keydown", (e) => {
    const jogador = document.getElementsByTagName("jogador")[0];
    let x = parseFloat(jogador.getAttribute("px"));
    let y = parseFloat(jogador.getAttribute("py"));
    let tj = parseFloat(jogador.getAttribute("tamanho"));
    let vel = 10;

    if (e.key === "ArrowUp") y -= vel;
    if (e.key === "ArrowDown") y += vel;
    if (e.key === "ArrowLeft") x -= vel;
    if (e.key === "ArrowRight") x += vel;

    const W = canvas.width;  
    const H = canvas.height;  

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + tj > W) x = W - tj;
    if (y + tj > H) y = H - tj;

    jogador.setAttribute("px", x);
    jogador.setAttribute("py", y);
});

function inverter(elem, tipo) {
    const atual = elem.getAttribute(tipo);
    if (tipo === "moverH") elem.setAttribute("moverH", atual === "direita" ? "esquerda" : "direita");
    if (tipo === "moverV") elem.setAttribute("moverV", atual === "abaixo" ? "acima" : "abaixo");
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const inicio = document.getElementsByTagName("areaInicio")[0];
    ctx.fillStyle = inicio.getAttribute("cor");
    ctx.fillRect(inicio.getAttribute("px"), inicio.getAttribute("py"),
        inicio.getAttribute("largura"), inicio.getAttribute("altura"));

    const chegada = document.getElementsByTagName("areaChegada")[0];
    ctx.fillStyle = chegada.getAttribute("cor");
    ctx.fillRect(chegada.getAttribute("px"), chegada.getAttribute("py"),
        chegada.getAttribute("largura"), chegada.getAttribute("altura"));

    for (const m of document.getElementsByTagName("moeda")) {
        if (m.getAttribute("ativa") === "0") continue;
        ctx.fillStyle = m.getAttribute("cor");
        let t = parseFloat(m.getAttribute("tamanho"));
        ctx.fillRect(m.getAttribute("px"), m.getAttribute("py"), t, t);
    }

    for (const i of document.getElementsByTagName("inimigo")) {
        ctx.fillStyle = i.getAttribute("cor");
        let t = parseFloat(i.getAttribute("tamanho"));
        ctx.fillRect(i.getAttribute("px"), i.getAttribute("py"), t, t);
    }

    const jogador = document.getElementsByTagName("jogador")[0];
    ctx.fillStyle = jogador.getAttribute("cor");
    let tj = parseFloat(jogador.getAttribute("tamanho"));
    ctx.fillRect(jogador.getAttribute("px"), jogador.getAttribute("py"), tj, tj);
}

function atualizar() {
    let vel = 2;
    const W = canvas.width;
    const H = canvas.height;

    const jogador = document.getElementsByTagName("jogador")[0];
    let jx = parseFloat(jogador.getAttribute("px"));
    let jy = parseFloat(jogador.getAttribute("py"));
    let tj = parseFloat(jogador.getAttribute("tamanho"));

    // Movimento dos inimigos
    for (const i of document.getElementsByTagName("inimigo")) {
        let x = parseFloat(i.getAttribute("px"));
        let y = parseFloat(i.getAttribute("py"));
        let t = parseFloat(i.getAttribute("tamanho"));

        let movH = i.getAttribute("moverH");
        let movV = i.getAttribute("moverV");

        if (movH === "direita") x += vel;
        else x -= vel;

        if (movV === "abaixo") y += vel;
        else y -= vel;

        if (x + t > W || x < 0) inverter(i, "moverH");
        if (y + t > H || y < 0) inverter(i, "moverV");

        const ini = document.getElementsByTagName("areaInicio")[0];
        const cheg = document.getElementsByTagName("areaChegada")[0];

        if (x + t > ini.getAttribute("px") &&
            x < parseFloat(ini.getAttribute("px")) + parseFloat(ini.getAttribute("largura")) &&
            y + t > ini.getAttribute("py") &&
            y < parseFloat(ini.getAttribute("py")) + parseFloat(ini.getAttribute("altura"))) {
            inverter(i, "moverH");
            inverter(i, "moverV");
        }

        if (x + t > cheg.getAttribute("px") &&
            x < parseFloat(cheg.getAttribute("px")) + parseFloat(cheg.getAttribute("largura")) &&
            y + t > cheg.getAttribute("py") &&
            y < parseFloat(cheg.getAttribute("py")) + parseFloat(cheg.getAttribute("altura"))) {
            inverter(i, "moverH");
            inverter(i, "moverV");
        }

        if (x < jx + tj && x + t > jx && y < jy + tj && y + t > jy) {
            texto.innerText = "Você perdeu!";
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }

        i.setAttribute("px", x);
        i.setAttribute("py", y);
    }

    // Coleta de moedas
    for (const m of document.getElementsByTagName("moeda")) {
        if (m.getAttribute("ativa") === "0") continue;

        let x = parseFloat(m.getAttribute("px"));
        let y = parseFloat(m.getAttribute("py"));
        let t = parseFloat(m.getAttribute("tamanho"));

        if (jx < x + t && jx + tj > x && jy < y + t && jy + tj > y) {
            m.setAttribute("ativa", "0");
            moedasPegas++;
            placarDiv.innerText = "Moedas: " + moedasPegas;
        }
    }

    const chegada = document.getElementsByTagName("areaChegada")[0];

    if (
        jx < parseFloat(chegada.getAttribute("px")) + parseFloat(chegada.getAttribute("largura")) &&
        jx + tj > chegada.getAttribute("px") &&
        jy < parseFloat(chegada.getAttribute("py")) + parseFloat(chegada.getAttribute("altura")) &&
        jy + tj > parseFloat(chegada.getAttribute("py"))
    ) {
        if (moedasPegas >= 3) {
            texto.innerText = "Parabéns, você concluiu a fase!";
            if (!document.getElementById("proximaFaseBtn")) {
                const btn = document.createElement("button");
                btn.id = "proximaFaseBtn";
                btn.innerText = "Próxima Fase";
                btn.style.fontSize = "20px";
                btn.style.marginTop = "10px";
                btn.style.padding = "10px 20px";
                btn.style.cursor = "pointer";

                btn.onclick = () => {
                    window.location.href = "../fasedificil/dificil.html";
                };

                document.body.appendChild(btn);
            }

        } else {
            texto.innerText = "Você precisa coletar pelo menos 3 moedas antes de chegar à área de chegada!";
        }
    }
}

function animar() {
    desenhar();
    atualizar();
    requestAnimationFrame(animar);
}

animar();
