// Inicializando o cérebro da Lily (LSTM - Memória de Longo Prazo)
const net = new brain.recurrent.LSTM();

// --- O QUE VOCÊ NÃO PENSOU: MEMÓRIA PERSISTENTE ---
// Verifica se a Lily já tem memórias salvas no seu navegador
let storedMemories = localStorage.getItem('lily_genetics');

// Se tiver memória, ela carrega. Se não, começa com o instinto básico.
let trainingData = storedMemories ? JSON.parse(storedMemories) : [
    { input: "1+1", output: "2" }
];

const terminal = document.getElementById('terminal');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const teachBtn = document.getElementById('teachBtn');

// --- O QUE VOCÊ NÃO PENSOU: MANIPULAÇÃO DIRETA DE INTERFACE ---
// Criando ferramentas de controle avançado via JavaScript
const exportBtn = document.createElement('button');
exportBtn.innerText = "Exportar Genética";
exportBtn.style.background = "#002200"; // Um tom esverdeado sutil
exportBtn.style.borderColor = "#004400";
document.getElementById('controls').appendChild(exportBtn);

const resetBtn = document.createElement('button');
resetBtn.innerText = "Lobotomia (Reset)";
resetBtn.style.background = "#220000"; // Um tom avermelhado sutil
resetBtn.style.borderColor = "#440000";
document.getElementById('controls').appendChild(resetBtn);

// Função de comunicação do terminal
function logTerminal(sender, message) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    const prefix = sender === 'user' ? 'VOCÊ: ' : (sender === 'lily' ? 'LILY: ' : '');
    div.innerText = prefix + message;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll para baixo
}

// Inicialização com a memória salva
logTerminal('system', `Carregando ${trainingData.length} sinapses da memória profunda...`);
net.train(trainingData, { iterations: 150 }); // Treino rápido apenas para "acordar"
logTerminal('system', 'Pronta para interação.');

// Evento de Enviar Mensagem
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text) return;

    logTerminal('user', text);
    userInput.value = '';

    let response = net.run(text);
    if (!response) {
        response = "... (ruído cognitivo) ...";
    }
    logTerminal('lily', response);
});

// Evento de Ensinar/Corrigir (A Evolução)
teachBtn.addEventListener('click', () => {
    const text = prompt("O que você disse para a Lily?");
    const correctResponse = prompt("O que ela DEVERIA ter respondido?");
    
    if (text && correctResponse) {
        logTerminal('system', `Injetando padrão: [${text}] -> [${correctResponse}]`);
        trainingData.push({ input: text, output: correctResponse });
        
        // --- SALVAMENTO AUTOMÁTICO ---
        // Grava a nova sinapse direto no disco do navegador
        localStorage.setItem('lily_genetics', JSON.stringify(trainingData));
        
        logTerminal('system', 'Reajustando genética com alta precisão. O processamento vai ser intenso...');
        
        // --- O UPGRADE QUE CORRIGE O ERRO DO "Oi" ---
        setTimeout(() => {
            net.train(trainingData, { 
                iterations: 2500,      // Força bruta de repetição aumentada
                errorThresh: 0.011     // Exigência de precisão absurdamente alta
            });
            logTerminal('system', 'Aprendizado concluído e salvo permanentemente na memória.');
        }, 50);
    }
});

// Função para exportar o cérebro
exportBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trainingData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lily_brain.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    logTerminal('system', 'Arquivo genético extraído com sucesso.');
});

// Função de Reset Total
resetBtn.addEventListener('click', () => {
    if(confirm("ATENÇÃO: Isso vai apagar toda a personalidade e memórias da Lily. Tem certeza?")) {
        localStorage.removeItem('lily_genetics');
        location.reload(); // Recarrega a página para matar a instância atual
    }
});

// Permitir envio com a tecla Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendBtn.click();
});
