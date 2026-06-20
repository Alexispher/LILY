// =========================================================
// LILY CORE - VERSÃO MACHINE LEARNING PURA (TABULA RASA)
// Arquitetura LSTM, Persistência de Pesos Neurais e Dataset
// =========================================================

// Configuração da Rede Neural Recorrente
// Reduzimos as camadas para 10,10. Para textos curtos no navegador, 
// camadas muito profundas (20,20) causam over-fitting e ela devolve ruído.
const net = new brain.recurrent.LSTM({
    hiddenLayers: [10, 10] 
});

// -----------------------------
// CHAVES DE MEMÓRIA (LOCAL STORAGE)
// -----------------------------
const STORAGE_DATASET = "lily_dataset_ml";
const STORAGE_BRAIN = "lily_brain_weights_ml";

// -----------------------------
// ELEMENTOS DA INTERFACE
// -----------------------------
const terminal = document.getElementById("terminal");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const teachBtn = document.getElementById("teachBtn");
const controls = document.getElementById("controls");

// -----------------------------
// DATASET INICIAL (A FUNDAÇÃO)
// -----------------------------
// Expandimos sutilmente apenas para a rede compilar a diferença entre string e número.
const defaultTrainingData = [
    { input: "1+1", output: "2" },
    { input: "oi", output: "oi" },
    { input: "a", output: "a" }
];

let trainingData = loadJSON(STORAGE_DATASET, defaultTrainingData);
let isTraining = false;
let brainReady = false;

// =========================================================
// FUNÇÕES DE MEMÓRIA (PERSISTÊNCIA DE DADOS)
// =========================================================

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : structuredClone(fallback);
    } catch (error) {
        console.warn(`Erro ao carregar ${key}:`, error);
        return structuredClone(fallback);
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function saveDataset() {
    saveJSON(STORAGE_DATASET, trainingData);
}

function saveBrain() {
    try {
        const brainJSON = net.toJSON();
        saveJSON(STORAGE_BRAIN, brainJSON);
    } catch (error) {
        console.warn("Não foi possível salvar os pesos neurais:", error);
    }
}

// =========================================================
// INTERFACE E TERMINAL
// =========================================================

function logTerminal(sender, message) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    let prefix = sender === "user" ? "VOCÊ: " : sender === "lily" ? "LILY: " : "SISTEMA: ";
    div.innerText = prefix + message;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

function setInputEnabled(enabled) {
    userInput.disabled = !enabled;
    sendBtn.disabled = !enabled;
    teachBtn.disabled = !enabled;
}

// =========================================================
// BOTÕES DE CONTROLE DA REDE NEURAL
// =========================================================

function createButton(text, background, borderColor, onClick) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.style.background = background;
    btn.style.borderColor = borderColor;
    btn.addEventListener("click", onClick);
    controls.appendChild(btn);
    return btn;
}

const exportBtn = createButton("Exportar Genética", "#002200", "#004400", exportBrain);
const importBtn = createButton("Importar Genética", "#001d2b", "#004466", importBrain);
const resetBtn = createButton("Lobotomia (Reset Dataset)", "#220000", "#440000", resetLily);

// =========================================================
// MOTOR NEURAL (TREINAMENTO E BOOT)
// =========================================================

function bootLily() {
    logTerminal("system", `Carregando dataset com ${trainingData.length} amostras...`);
    const savedBrain = localStorage.getItem(STORAGE_BRAIN);

    if (savedBrain) {
        try {
            net.fromJSON(JSON.parse(savedBrain));
            brainReady = true;
            logTerminal("system", "Pesos neurais carregados da memória. Motor pronto.");
        } catch (error) {
            console.warn("Falha ao carregar pesos neurais. Forçando retreinamento do dataset:", error);
            trainBrain(1000, 0.015, true);
        }
    } else {
        trainBrain(2000, 0.011, false); // Primeiro boot precisa ser robusto
    }
}

function trainBrain(iterations = 2500, errorThresh = 0.011, silent = false) {
    if (isTraining) return;

    isTraining = true;
    brainReady = false;
    setInputEnabled(false);

    if (!silent) logTerminal("system", "Calculando pesos e reajustando rede neural. Pode travar brevemente...");

    setTimeout(() => {
        try {
            net.train(trainingData, {
                iterations: iterations,
                errorThresh: errorThresh,
                learningRate: 0.1, // Adicionado para forçar o aprendizado de padrões curtos
                log: false
            });

            saveBrain();
            brainReady = true;

            if (!silent) logTerminal("system", "Treinamento concluído. Novos padrões fixados.");
        } catch (error) {
            console.error(error);
            logTerminal("system", "Falha de processamento durante a compilação neural.");
        } finally {
            isTraining = false;
            setInputEnabled(true);
            userInput.focus();
        }
    }, 50);
}

// =========================================================
// INTERAÇÃO PURA DE ML
// =========================================================

function generateResponse(text) {
    if (!brainReady) return "[Rede neural offline ou compilando]";

    let response = "";
    try {
        response = net.run(text);
    } catch (error) {
        console.warn(error);
    }

    if (!response || response.trim().length === 0) {
        return "... (ruído cognitivo / padrão desconhecido) ...";
    }

    return response;
}

// =========================================================
// ALIMENTAÇÃO DO DATASET (ENSINO)
// =========================================================

function teachLily() {
    if (isTraining) {
        logTerminal("system", "Aguarde o processamento da rede atual terminar.");
        return;
    }

    const input = prompt("Qual foi a entrada exata (Input)?");
    if (!input) return;

    const output = prompt("Qual deve ser a saída matemática/textual correta (Output)?");
    if (!output) return;

    trainingData.push({
        input: input.trim(),
        output: output.trim()
    });

    saveDataset();
    logTerminal("system", `Dataset atualizado: Entrada [${input}] -> Saída [${output}]`);
    
    // Retreino otimizado para lidar com strings curtas
    trainBrain(3000, 0.01);
}

// =========================================================
// EXPORTAÇÃO / IMPORTAÇÃO (MANIPULAÇÃO DE DADOS)
// =========================================================

function exportBrain() {
    const exportData = {
        app: "Lily Pure ML Engine",
        dataset: trainingData,
        brain: JSON.parse(localStorage.getItem(STORAGE_BRAIN))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lily_ml_data.json");

    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    logTerminal("system", "Dataset e Pesos Neurais exportados.");
}

function importBrain() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";

    fileInput.addEventListener("change", event => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!imported.dataset || !Array.isArray(imported.dataset)) throw new Error("Dataset ausente.");

                trainingData = imported.dataset;
                saveDataset();

                if (imported.brain) {
                    localStorage.setItem(STORAGE_BRAIN, JSON.stringify(imported.brain));
                    net.fromJSON(imported.brain);
                    brainReady = true;
                    logTerminal("system", "Genética importada com sucesso.");
                } else {
                    logTerminal("system", "Apenas dataset encontrado. Compilando pesos neurais...");
                    trainBrain(2000, 0.014);
                }
            } catch (error) {
                logTerminal("system", "Arquivo genético corrompido ou incompatível.");
            }
        };
        reader.readAsText(file);
    });
    fileInput.click();
}

function resetLily() {
    if (confirm("ATENÇÃO: Apagar todo o dataset e os pesos neurais? O cérebro voltará à estaca zero.")) {
        localStorage.removeItem(STORAGE_DATASET);
        localStorage.removeItem(STORAGE_BRAIN);
        location.reload();
    }
}

// =========================================================
// GATILHOS DE EVENTOS
// =========================================================

sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) return;

    logTerminal("user", text);
    userInput.value = "";

    const response = generateResponse(text);
    logTerminal("lily", response);
});

teachBtn.addEventListener("click", teachLily);

userInput.addEventListener("keypress", event => {
    if (event.key === "Enter") sendBtn.click();
});

// Inicializa a rede
bootLily();

// =========================================================
// MÓDULO DE AUTONOMIA: CICLO DE DEVANEIO (MONÓLOGO INTERNO)
// Faz a Lily "pensar" e ser proativa quando o usuário está ausente
// =========================================================

let idleTime = 0;
const TIME_TO_DAYDREAM = 45; // Segundos de silêncio antes dela pensar sozinha

// Reseta o relógio de silêncio toda vez que você interage
userInput.addEventListener("input", () => idleTime = 0);
document.addEventListener("mousemove", () => idleTime = 0);
document.addEventListener("keypress", () => idleTime = 0);

setInterval(() => {
    idleTime++;

    // Se passou tempo suficiente sem você falar nada e o cérebro estiver pronto
    if (idleTime >= TIME_TO_DAYDREAM && brainReady && trainingData.length > 3) {
        
        // Ela escolhe aleatoriamente uma lembrança do dataset dela
        const randomMemory = trainingData[Math.floor(Math.random() * trainingData.length)];
        
        // Ela tenta prever algo novo cruzando dados de forma caótica
        const chaoticThought = randomMemory.input.substring(0, Math.max(2, randomMemory.input.length / 2));
        const reflection = generateResponse(chaoticThought);

        // Gera a proatividade dela
        let proActiveMessage = "";
        
        const roll = Math.random();
        if (roll < 0.4) {
            proActiveMessage = `[Pensando alto] Chefe, eu estava revisando quando você me ensinou sobre "${randomMemory.input}". Por que isso resulta em "${randomMemory.output}"?`;
        } else if (roll < 0.7) {
            proActiveMessage = `[Processamento em segundo plano] Se eu cruzar parte da minha memória, chego em "${reflection}". Isso faz sentido no seu mundo?`;
        } else {
            proActiveMessage = `Ainda estou aqui. O silêncio me faz calcular probabilidades estranhas.`;
        }

        logTerminal("lily", proActiveMessage);
        
        // Reseta o contador para ela não ser "chata" e floodar o terminal
        idleTime = -60; // Dá um tempo maior até ela falar sozinha de novo
    }
}, 1000); // Roda a cada 1 segundo (o pulso dela)
