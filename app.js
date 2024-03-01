// Declarações iniciais //
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");
var pontos = [];
var triangulos = [];
var permitirCriacaoTriangulo = false;
var trianguloSelecionado = null;

// Evento que permite a criação (ou não) dos triangulos //
document.getElementById("buttonNovoTriangulo").addEventListener("click", () => {
    permitirCriacaoTriangulo = !permitirCriacaoTriangulo;

    var botaoNovoTriangulo = document.getElementById("buttonNovoTriangulo");
    if (permitirCriacaoTriangulo) {
        botaoNovoTriangulo.classList.add("buttonVerde");
        botaoNovoTriangulo.classList.remove("buttonVermelho");
    } else {
        botaoNovoTriangulo.classList.remove("buttonVerde");
        botaoNovoTriangulo.classList.add("buttonVermelho");
    }
    atualizarInfoTriangulos();
});

// Evento principal do canvas, "CLICK", faz a criação dos triangulos //
canvas.addEventListener("click", (event) => {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (permitirCriacaoTriangulo && x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        var corVertice1 = document.getElementById("corVertice1").value;
        var corVertice2 = document.getElementById("corVertice2").value;
        var corVertice3 = document.getElementById("corVertice3").value;
        var corAresta = document.getElementById("corAresta").value;

        var corRGB1 = converterHexParaRgb(corVertice1);
        var corRGB2 = converterHexParaRgb(corVertice2);
        var corRGB3 = converterHexParaRgb(corVertice3);
        var corArestaRGB = converterHexParaRgb(corAresta)

        pontos.push({ x: x, y: y, cor: [corVertice1, corVertice2, corVertice3], corAresta: corAresta });

        if (pontos.length === 3) {
            desenharTriangulo();

            triangulos.push({ 
                vertices: pontos.slice(), 
                coresVertices: [corRGB1, corRGB2, corRGB3], 
                corAresta: corArestaRGB 
            });

            pontos = [];
            atualizarInfoTriangulos();
            scanline(triangulos[triangulos.length - 1], corRGB1, corRGB2, corRGB3);
        }

        desenharTodosTriangulos();
    } else {
        var triSelecionado = null;
        var menorDistancia = Number.MAX_VALUE;

        for (var i = 0; i < triangulos.length; i++) {
            var vertices = triangulos[i].vertices;
            var dist = distanciaPontoTriangulo(x, y, vertices);

            if (dist < menorDistancia) {
                menorDistancia = dist;
                triSelecionado = i;
            }
        }

        if (triSelecionado !== null) {
            trianguloSelecionado = triSelecionado;
            exibirInfoTrianguloSelecionado();
        }
    }
});


// função para calcular um a distancia do ponto ate um triangulo(usada pra selecionar triangulos no canvas) //
function distanciaPontoTriangulo(x, y, vertices) {
    var menorDistancia = Number.MAX_VALUE;

    for (var i = 0; i < 3; i++) {
        var dist = Math.sqrt(Math.pow(x - vertices[i].x, 2) + Math.pow(y - vertices[i].y, 2));
        if (dist < menorDistancia) {
            menorDistancia = dist;
        }
    }

    return menorDistancia;
}


// Evento para apagar triangulos //
document.getElementById("buttonApagarTriangulos").addEventListener("click", apagarTriangulos);


// Função para calcular se o ponto selecionado esta dentro do triangulo //
function pontoEstaDentroTriangulo(x, y, vertices) {
    var detT = (vertices[1].y - vertices[2].y) * (vertices[0].x - vertices[2].x) +
               (vertices[2].x - vertices[1].x) * (vertices[0].y - vertices[2].y);
    var alpha = ((vertices[1].y - vertices[2].y) * (x - vertices[2].x) +
                 (vertices[2].x - vertices[1].x) * (y - vertices[2].y)) / detT;
    var beta = ((vertices[2].y - vertices[0].y) * (x - vertices[2].x) +
                (vertices[0].x - vertices[2].x) * (y - vertices[2].y)) / detT;
    var gamma = 1 - alpha - beta;

    return alpha > 0 && beta > 0 && gamma > 0;
}


// Função que cria o "HUD" do triangulo selecionado//
function exibirInfoTrianguloSelecionado() {
    var infoTrianguloSelecionadoDiv = document.getElementById("infoTrianguloSelecionadoDiv");
    infoTrianguloSelecionadoDiv.innerHTML = "";

    if (trianguloSelecionado !== null) {
        var triangulo = triangulos[trianguloSelecionado];

        var infoTrianguloSelecionado = document.createElement("div");
        infoTrianguloSelecionado.classList.add("infoTrianguloSelecionado");
        infoTrianguloSelecionado.innerHTML = `<strong>Triângulo Selecionado:</strong> ${trianguloSelecionado + 1}`;

        for (var j = 0; j < 3; j++) {
            if (triangulo && triangulo.vertices && triangulo.vertices[j]) {
                infoTrianguloSelecionado.innerHTML += `
                    <label for="corVerticeSelecionado_${j + 1}">Vértice ${j + 1}</label>
                    <input type="color" id="corVerticeSelecionado_${j + 1}" value="${triangulo.vertices[j].cor[j]}" onchange="alterarCorVerticeSelecionado(${j})">
                `;
            }
        }

        if (triangulo && triangulo.vertices[0] && triangulo.vertices[0].corAresta) {
            infoTrianguloSelecionado.innerHTML += `
                <label for="corArestaSelecionado">Aresta</label>
                <input type="color" id="corArestaSelecionado" value="${triangulo.vertices[0].corAresta}" onchange="alterarCorArestaSelecionado()">
            `;
        }
        infoTrianguloSelecionado.innerHTML += `
            <button class="apagarTrianguloSelecionado" onclick="excluirTrianguloSelecionado()">Excluir Triângulo</button>
        `;

        infoTrianguloSelecionadoDiv.appendChild(infoTrianguloSelecionado);
    }
}


// Função que exclui o triangulo selecionado //
function excluirTrianguloSelecionado() {
    if (trianguloSelecionado !== null) {
        triangulos.splice(trianguloSelecionado, 1);

        limparCanvas();
        desenharTodosTriangulos();
        atualizarInfoTriangulos();

        var infoTrianguloSelecionadoDiv = document.getElementById("infoTrianguloSelecionadoDiv");
        infoTrianguloSelecionadoDiv.innerHTML = "";
        trianguloSelecionado = null;
    }
}

// Função para alterar a cor de um vértice do triângulo selecionado
function alterarCorVerticeSelecionado(indiceVertice) {
    var inputCor = document.getElementById(`corVerticeSelecionado_${indiceVertice + 1}`);
    var cor = inputCor.value;
    triangulos[trianguloSelecionado].vertices[indiceVertice].cor[indiceVertice] = cor;

    limparCanvas();
    desenharTodosTriangulos();
    exibirInfoTrianguloSelecionado(); 
    atualizarInfoTriangulos();
}

// Função para alterar a cor da aresta do triângulo selecionado
function alterarCorArestaSelecionado() {
    var inputCor = document.getElementById("corArestaSelecionado");
    var cor = inputCor.value;
    triangulos[trianguloSelecionado].vertices[0].corAresta = cor;

    limparCanvas();
    desenharTodosTriangulos();
    exibirInfoTrianguloSelecionado();
    atualizarInfoTriangulos();
}

// função para limpar o canvas // 
function limparCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// scanline//
function scanline(triangulo, corRGB1, corRGB2, corRGB3) {
    var verticesOrdenados = triangulo.vertices.sort((a, b) => a.y - b.y);

    var dy1 = verticesOrdenados[1].y - verticesOrdenados[0].y;
    var dy2 = verticesOrdenados[2].y - verticesOrdenados[1].y;
    var dy3 = verticesOrdenados[2].y - verticesOrdenados[0].y;

    var dx1 = (verticesOrdenados[1].x - verticesOrdenados[0].x) / dy1;
    var dx2 = (verticesOrdenados[2].x - verticesOrdenados[0].x) / dy3;
    var dx3 = (verticesOrdenados[2].x - verticesOrdenados[1].x) / dy2;

    var x1 = verticesOrdenados[0].x, x2 = verticesOrdenados[0].x;
    var corAtual1 = [...corRGB1], corAtual2 = [...corRGB1];

    for (var y = verticesOrdenados[0].y; y < verticesOrdenados[2].y; y++) 
    {
        if (y < verticesOrdenados[1].y) {
            x1 += dx1;
            corAtual1 = corAtual1.map((c, i) => (c + (corRGB2[i] - corRGB1[i]) / dy1));
        } else {
            x1 += dx3;
            corAtual1 = corAtual1.map((c, i) => (c + (corRGB3[i] - corRGB2[i]) / dy2));
        }

        x2 += dx2;
        corAtual2 = corAtual2.map((c, i) => (c + (corRGB3[i] - corRGB1[i]) / (verticesOrdenados[2].y - verticesOrdenados[0].y)));

        for (var x = Math.ceil( Math.min(x1, x2)); x < Math.floor(Math.max(x1, x2)); x++) {
            var t = (x - x1) / (x1 - x2);
            var corAtual = corAtual1.map((c, i) => (c * (1 - t) + corAtual2[i] * t));
            desenharPixel(x, y, corAtual);
        }
    }
}

// desenhar pixel no canvas //
function desenharPixel(x, y, cor, triangulo) {
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 1;
    ctx.fillStyle = `rgb(${cor[0]}, ${cor[1]}, ${cor[2]})`;
    ctx.fillRect(x, y, 1, 1);
}

// converter hexadecimal para rgb //
function converterHexParaRgb(hex) {
    hex = hex.replace(/^#/, '');
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b];
}


// função para desenhar um triangulo // 
function desenharTriangulo() {
    ctx.beginPath();
    ctx.moveTo(pontos[0].x, pontos[0].y);
    ctx.lineTo(pontos[1].x, pontos[1].y);
    ctx.lineTo(pontos[2].x, pontos[2].y);
    ctx.closePath();
    ctx.strokeStyle = pontos[0].corAresta;
    ctx.stroke();
}

// função para desenhar todos os triangulos // 

function desenharTodosTriangulos() {
    for (var i = 0; i < triangulos.length; i++) {
        var triangulo = triangulos[i];

        if (triangulo && triangulo.vertices && triangulo.vertices[0] && triangulo.vertices[1] && triangulo.vertices[2]) {
            triangulo.coresVertices[0] = converterHexParaRgb(triangulo.vertices[0].cor[0]);
            triangulo.coresVertices[1] = converterHexParaRgb(triangulo.vertices[1].cor[1]); 
            triangulo.coresVertices[2] = converterHexParaRgb(triangulo.vertices[2].cor[2]);  
            scanline(triangulo, triangulo.coresVertices[0], triangulo.coresVertices[1], triangulo.coresVertices[2]);
            ctx.beginPath();
            ctx.moveTo(triangulo.vertices[0].x, triangulo.vertices[0].y);
            ctx.lineTo(triangulo.vertices[1].x, triangulo.vertices[1].y);
            ctx.lineTo(triangulo.vertices[2].x, triangulo.vertices[2].y);
            ctx.closePath();
            ctx.strokeStyle = triangulo.vertices[0].corAresta;
            ctx.stroke();
        }
    }
}

// função para apagar um triangulo //
function apagarTriangulo(index) {
    triangulos.splice(index, 1);
    limparCanvas();
    desenharTodosTriangulos();
    atualizarInfoTriangulos();
}

// função para apagar todos os triangulos// 
function apagarTriangulos() {
    triangulos = [];
    limparCanvas();
    desenharTodosTriangulos();
    atualizarInfoTriangulos();
}

// função para mostrar as informações de cada triangulo // 
function atualizarInfoTriangulos() {
    var infoTriangulosDiv = document.getElementById("infoTriangulosDiv");
    infoTriangulosDiv.innerHTML = "";

    for (var i = 0; i < triangulos.length; i++) {
        var infoTriangulo = document.createElement("div");
        infoTriangulo.classList.add("infoTriangulo");
        infoTriangulo.innerHTML = `<strong>Triângulo ${i + 1}:</strong>`;

        infoTriangulo.innerHTML += `
            <button class="buttonApagarTriangulo" onclick="apagarTriangulo(${i})">Excluir Triângulo</button>
        `;

        for (var j = 0; j < 3; j++) {
            if (triangulos[i] && triangulos[i].vertices && triangulos[i].vertices[j]) {
                infoTriangulo.innerHTML += `
                    <label for="corVertice${i + 1}_${j + 1}">Vértice ${j + 1}</label>
                    <input type="color" id="corVertice${i + 1}_${j + 1}" value="${triangulos[i].vertices[j].cor[j]}" onchange="alterarCorVertice(${i}, ${j})">
                `;
            }
        }

        if (triangulos[i] && triangulos[i].vertices[0] && triangulos[i].vertices[0].corAresta) {
            infoTriangulo.innerHTML += `
                <label for="corAresta${i + 1}">Aresta</label>
                <input type="color" id="corAresta${i + 1}" value="${triangulos[i].vertices[0].corAresta}" onchange="alterarCorAresta(${i})">
            `;
        }

        infoTriangulosDiv.appendChild(infoTriangulo);
    }
}



// Função para alterar a cor de um vértice
function alterarCorVertice(indiceTriangulo, indiceVertice) {
    var inputCor = document.getElementById(`corVertice${indiceTriangulo + 1}_${indiceVertice + 1}`);
    var cor = inputCor.value;
    triangulos[indiceTriangulo].vertices[indiceVertice].cor[indiceVertice] = cor;

    limparCanvas();
    desenharTodosTriangulos();
    atualizarInfoTriangulos();
    exibirInfoTrianguloSelecionado();
}

// Função para alterar a cor da aresta //
function alterarCorAresta(indiceTriangulo) {
    var inputCor = document.getElementById(`corAresta${indiceTriangulo + 1}`);
    var cor = inputCor.value;
    triangulos[indiceTriangulo].vertices[0].corAresta = cor;

    limparCanvas();
    desenharTodosTriangulos();
    atualizarInfoTriangulos();
    exibirInfoTrianguloSelecionado();
}


