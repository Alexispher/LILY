// Inicializando o cérebro da Lily (Uma rede neural recorrente para texto)
const net = new brain.recurrent.LSTM();

// Memória de curto prazo (banco de dados inicial)
// Começa com o básico do básico para ela não falhar na primeira execução.
let trainingData = [
    { input: "1+1", output: "2" }
];

const terminal = document.getElementById('terminal');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const teachBtn = document.getElementById('teachBtn');

// Função para escrever no terminal
function logTerminal(sender, message) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    const prefix = sender === 'user' ? 'VOCÊ: ' : (sender === 'lily' ? 'LILY: ' : '');
    div.innerText = prefix + message;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

// Primeira inicialização (Treinando a rede com o dado inicial)
logTerminal('system', 'Treinando sinapses iniciais...');
net.train(trainingData, { iterations: 100 });
logTerminal('system', 'Pronta para interação.');

// Evento de Enviar Mensagem
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text) return;

    logTerminal('user', text);
    userInput.value = '';

    // Lily tenta responder
    let response = net.run(text);
    
    // Se ela não souber, a rede devolve vazio ou ruído
    if (!response) {
        response = "... (ruído cognitivo) ...";
    }
    
    logTerminal('lily', response);
});

// Evento de Ensinar/Corrigir a Lily
teachBtn.addEventListener('click', () => {
    const text = prompt("O que você disse para a Lily?");
    const correctResponse = prompt("O que ela DEVERIA ter respondido?");
    
    if (text && correctResponse) {
        logTerminal('system', `Injetando novo padrão: [${text}] -> [${correctResponse}]`);
        
        // Adiciona ao banco de memória dela
        trainingData.push({ input: text, output: correctResponse });
        
        // Retreina o cérebro dela com a nova informação
        logTerminal('system', 'Reajustando genética (processando)...');
        
        // Em um projeto avançado isso roda em background, aqui vamos treinar na hora
        setTimeout(() => {
            net.train(trainingData, { iterations: 500 });
            logTerminal('system', 'Aprendizado concluído.');
        }, 100);
    }
});

// Permitir envio com a tecla Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendBtn.click();
});
