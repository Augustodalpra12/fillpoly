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

    if (permitirCriacaoTriangulo) {
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
            limparCanvas();
            
            triangulos.push({ 
                vertices: pontos.slice(), 
                coresVertices: [corRGB1, corRGB2, corRGB3], 
                corAresta: corArestaRGB 
            });

            //console.log(triangulos)

            pontos = [];
            atualizarInfoTriangulos();
            //scanline(triangulos[triangulos.length - 1], corRGB1, corRGB2, corRGB3);
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
   let intersecoes = new Map();

   const minY = Math.min(triangulo.vertices[0].y, triangulo.vertices[1].y, triangulo.vertices[2].y);
   let maxY = Math.max(triangulo.vertices[0].y, triangulo.vertices[1].y, triangulo.vertices[2].y);
   for (let y = minY; y < maxY; y++) {
        intersecoes.set(y, []);
    }

    let edges = [
        { start:  triangulo.vertices[0], end:  triangulo.vertices[1], rate: ( triangulo.vertices[1].x -  triangulo.vertices[0].x) / ( triangulo.vertices[1].y -  triangulo.vertices[0].y) },
        { start:  triangulo.vertices[1], end:  triangulo.vertices[2], rate: ( triangulo.vertices[2].x -  triangulo.vertices[1].x) / ( triangulo.vertices[2].y -  triangulo.vertices[1].y) },
        { start:  triangulo.vertices[2], end:  triangulo.vertices[0], rate: ( triangulo.vertices[0].x -  triangulo.vertices[2].x) / ( triangulo.vertices[0].y -  triangulo.vertices[2].y) }
    ];

    let edgesRGB = [
        {
            rateR: ((corRGB2[0] - corRGB1[0]) / (triangulo.vertices[1].y - triangulo.vertices[0].y)),
            rateG: ((corRGB2[1] - corRGB1[1]) / (triangulo.vertices[1].y - triangulo.vertices[0].y)),
            rateB: ((corRGB2[2] - corRGB1[2]) / (triangulo.vertices[1].y - triangulo.vertices[0].y))
        },
        {
            rateR: ((corRGB3[0] - corRGB2[0]) / (triangulo.vertices[2].y - triangulo.vertices[1].y)),
            rateG: ((corRGB3[1] - corRGB2[1]) / (triangulo.vertices[2].y - triangulo.vertices[1].y)),
            rateB: ((corRGB3[2] - corRGB2[2]) / (triangulo.vertices[2].y - triangulo.vertices[1].y))
        },
        {
            
            rateR: ((corRGB1[0] - corRGB3[0]) / (triangulo.vertices[0].y - triangulo.vertices[2].y)),
            rateG: ((corRGB1[1] - corRGB3[1]) / (triangulo.vertices[0].y - triangulo.vertices[2].y)),
            rateB: ((corRGB1[2] - corRGB3[2]) / (triangulo.vertices[0].y - triangulo.vertices[2].y))
        }
    ];
    //console.log("print :" + edgesRGB[0].rateR);
    
    
    for (let i = 0; i < 3; i++) {
        let initialY, endY, currentX, currentR, currentG, currentB;
        // console.log("Start: " + edges[i].start.y + " End: " + edges[i].end.y);
        //console.log("Entrou " + i +"vezes");
        if (edges[i].start.y < edges[i].end.y) {
            initialY = edges[i].start.y;
            endY = edges[i].end.y;
            currentX = edges[i].start.x;
            
            currentR = triangulo.coresVertices[i][0]
            //console.log("Current: " + currentR)
            currentG = triangulo.coresVertices[i][1]
            currentB = triangulo.coresVertices[i][2]
            // console.log("IF");
            // console.log("InitialY", initialY);
            // console.log("endY",endY);
            // console.log("currentX",currentX);
            // console.log("currentR",currentR);
            // console.log("currentG",currentG);
            // console.log("currentB",currentB);

        } else {
            initialY = edges[i].end.y;
            endY = edges[i].start.y;
            currentX = edges[i].end.x;
            console.log(edges[i].end.x)
            if(i == 0){
                currentR = triangulo.coresVertices[1][0]
                currentG = triangulo.coresVertices[1][1]
                currentB = triangulo.coresVertices[1][2]
            }
            if(i == 1){
                currentR = triangulo.coresVertices[2][0]
                currentG = triangulo.coresVertices[2][1]
                currentB = triangulo.coresVertices[2][2]
            }
            if(i == 2){
                currentR = triangulo.coresVertices[0][0]
                currentG = triangulo.coresVertices[0][1]
                currentB = triangulo.coresVertices[0][2]
            }
            
            // console.log("else");
            // console.log("InitialY", initialY);
            // console.log("endY",endY);
            // console.log("currentX",currentX);
            // console.log("currentR",currentR);
            // console.log("currentG",currentG);
            // console.log("currentB",currentB);
        }

        for (let y = initialY; y < endY; y++) {
            intersecoes.get(y).push({ x: currentX, r: currentR, g: currentG, b: currentB });
            currentX += edges[i].rate;
            currentR += edgesRGB[i].rateR;
            currentG += edgesRGB[i].rateG;
            currentB += edgesRGB[i].rateB;
        }
    }


    intersecoes.forEach((sortX) => {
        const sortedX = sortX.slice().sort((a, b) => a.x - b.x);
        sortX.splice(0, sortX.length, ...sortedX);
    });

    for (let currentY = minY; currentY < maxY; currentY++) {
        let edge = intersecoes.get(currentY);
    
        for (let i = 0; i < edge.length; i += 2) {
            let initialX = Math.ceil(edge[i].x);
            let endX = Math.floor(edge[i + 1].x);
            let currentR = edge[i].r;
            let currentG = edge[i].g;
            let currentB = edge[i].b;
    
            const variationR = (edge[i + 1].r - edge[i].r) / (endX - initialX);
            const variationG = (edge[i + 1].g - edge[i].g) / (endX - initialX);
            const variationB = (edge[i + 1].b - edge[i].b) / (endX - initialX);
    
            for (let currentX = initialX; currentX < endX; currentX++) {
                ctx.fillStyle = `rgb(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)})`;
                ctx.fillRect(currentX, currentY, 1, 1);
                currentR += variationR;
                currentG += variationG;
                currentB += variationB;
            }
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
            //triangulo.coresVertices[0] = converterHexParaRgb(triangulo.vertices[0].cor[0]);
            //triangulo.coresVertices[1] = converterHexParaRgb(triangulo.vertices[1].cor[1]); 
            //triangulo.coresVertices[2] = converterHexParaRgb(triangulo.vertices[2].cor[2]);  
            ctx.beginPath();
            ctx.moveTo(triangulo.vertices[0].x, triangulo.vertices[0].y);
            ctx.lineTo(triangulo.vertices[1].x, triangulo.vertices[1].y);
            ctx.lineTo(triangulo.vertices[2].x, triangulo.vertices[2].y);
            ctx.closePath();
            ctx.strokeStyle = triangulo.vertices[0].corAresta;
            ctx.stroke();
            scanline(triangulo, triangulo.coresVertices[0], triangulo.coresVertices[1], triangulo.coresVertices[2]);
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


