// ======================
// Variáveis iniciais
// ======================
let player1Score = 0;
let player2Score = 0;

const ball = document.getElementById('ball');
const player1 = document.getElementById('p1');
const player2 = document.getElementById('p2');
const gameArea = document.getElementById('gameArea');

const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');

const buttonStart = document.getElementById('startButton');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const playerNamesDiv = document.getElementById('playerNames');

let ballVelocity = { x: 5, y: 0 };
let gameLoop;
let isRunning = false;
let keys = {}; 

// velocidade base e atual da bola
let baseSpeed = 5;
let currentSpeed = baseSpeed;
let speedIncrease = 0.002;

// Modo do jogo: "2p" ou "ai"
let gameMode = "2p";

// Nomes dos jogadores
let player1Name = "Player 1";
let player2Name = "Player 2";

// Estado de pausa
let isPaused = false;

// ======================
// Criar elemento de mensagem de pausa
// ======================
const pauseMessage = document.createElement('div');
pauseMessage.innerText = 'PAUSADO';
pauseMessage.style.position = 'absolute';
pauseMessage.style.top = '50%';
pauseMessage.style.left = '50%';
pauseMessage.style.transform = 'translate(-50%, -50%)';
pauseMessage.style.fontSize = '48px';
pauseMessage.style.color = '#fff';
pauseMessage.style.display = 'none';
pauseMessage.style.pointerEvents = 'none';
pauseMessage.style.textShadow = '2px 2px 8px #000';
gameArea.appendChild(pauseMessage);

// ======================
// Controle teclado
// ======================
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if(e.code === 'Space') {
        togglePause();
    }
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// ======================
// Mostra/oculta campo do Player 2
// ======================
modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === "2p" && radio.checked) {
            playerNamesDiv.style.display = "flex";
        } else {
            playerNamesDiv.style.display = "none";
        }
    });
});

// ======================
// Botão Start
// ======================
buttonStart.addEventListener('click', () => {
    const modeSelected = document.querySelector('input[name="mode"]:checked');
    gameMode = modeSelected ? modeSelected.value : "2p";

    // Lê nomes
    player1Name = document.getElementById('player1Name').value || "Player 1";
    player2Name = (gameMode === "2p") ? (document.getElementById('player2Name').value || "Player 2") : "AI";

    // Inicializa placar
    player1Score = 0;
    player2Score = 0;
    updateScore();

    document.getElementById('welcomeScreen').style.display = 'none';
    gameArea.style.display = 'block';
    startGame();
});

// ======================
// Inicia o jogo
// ======================
function startGame() {
    player1.style.top = '100px';
    player2.style.top = '100px';
    currentSpeed = baseSpeed;
    initBall();
    startLoop();
}

// ======================
// Inicializa a bola
// ======================
function initBall() {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    ball.style.left = areaWidth / 2 + 'px';
    ball.style.top = areaHeight / 2 + 'px';

    let angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
    let dirX = Math.random() < 0.5 ? -1 : 1;

    ballVelocity.x = dirX * currentSpeed * Math.cos(angle);
    ballVelocity.y = currentSpeed * Math.sin(angle);
}

// ======================
// Loop do jogo
// ======================
function startLoop() {
    if (isRunning) return;
    isRunning = true;

    function loop() {
        if(!isPaused){
            movePlayers();
            moveBall();
            pauseMessage.style.display = 'none';
        } else {
            pauseMessage.style.display = 'block';
        }
        gameLoop = requestAnimationFrame(loop);
    }

    loop();
}

// ======================
// Toggle pause
// ======================
function togglePause() {
    isPaused = !isPaused;
}

// ======================
// Movimento dos jogadores
// ======================
function movePlayers() {
    const speed = 6;
    const areaHeight = gameArea.clientHeight;
    const playerHeight = player1.clientHeight;

    // PLAYER 1 (W/S)
    let p1Top = parseInt(player1.style.top);
    if (keys['w'] && p1Top > 0) player1.style.top = (p1Top - speed) + 'px';
    if (keys['s'] && p1Top < areaHeight - playerHeight) player1.style.top = (p1Top + speed) + 'px';

    if (gameMode === "2p") {
        // PLAYER 2 (↑/↓)
        let p2Top = parseInt(player2.style.top);
        if (keys['ArrowUp'] && p2Top > 0) player2.style.top = (p2Top - speed) + 'px';
        if (keys['ArrowDown'] && p2Top < areaHeight - playerHeight) player2.style.top = (p2Top + speed) + 'px';
    } else if (gameMode === "ai") {
        moveAI();
    }
}

// ======================
// Movimento da IA (Player 2)
// ======================
function moveAI() {
    const areaHeight = gameArea.clientHeight;
    const playerHeight = player2.clientHeight;
    const aiSpeed = 4; // velocidade da IA

    let p2Top = parseInt(player2.style.top);
    let ballY = parseInt(ball.style.top);

    if (p2Top + playerHeight/2 < ballY) {
        player2.style.top = Math.min(p2Top + aiSpeed, areaHeight - playerHeight) + 'px';
    } else if (p2Top + playerHeight/2 > ballY) {
        player2.style.top = Math.max(p2Top - aiSpeed, 0) + 'px';
    }
}

// ======================
// Movimento da bola e colisão
// ======================
function moveBall() {
    currentSpeed += speedIncrease;
    const velocityMagnitude = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2);
    ballVelocity.x = (ballVelocity.x / velocityMagnitude) * currentSpeed;
    ballVelocity.y = (ballVelocity.y / velocityMagnitude) * currentSpeed;

    let x = parseInt(ball.style.left);
    let y = parseInt(ball.style.top);

    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    const ballSize = ball.clientWidth;

    x += ballVelocity.x;
    y += ballVelocity.y;

    if (y <= 0 || y >= areaHeight - ballSize) ballVelocity.y *= -1;

    const ballRect = ball.getBoundingClientRect();
    const p1Rect = player1.getBoundingClientRect();
    const p2Rect = player2.getBoundingClientRect();

    // PLAYER 1 colisão
    if (ballRect.left <= p1Rect.right &&
        ballRect.top < p1Rect.bottom &&
        ballRect.bottom > p1Rect.top) {
        ballVelocity.x = Math.abs(ballVelocity.x);
        let hitPos = (ballRect.top + ballSize/2) - (p1Rect.top + p1Rect.height/2);
        let maxAngle = Math.PI / 3;
        let angle = (hitPos / (p1Rect.height/2)) * maxAngle;
        ballVelocity.y = currentSpeed * Math.sin(angle);
        ballVelocity.x = Math.sqrt(currentSpeed**2 - ballVelocity.y**2) * Math.sign(ballVelocity.x);
    }

    // PLAYER 2 colisão
    if (ballRect.right >= p2Rect.left &&
        ballRect.top < p2Rect.bottom &&
        ballRect.bottom > p2Rect.top) {
        ballVelocity.x = -Math.abs(ballVelocity.x);
        let hitPos = (ballRect.top + ballSize/2) - (p2Rect.top + p2Rect.height/2);
        let maxAngle = Math.PI / 3;
        let angle = (hitPos / (p2Rect.height/2)) * maxAngle;
        ballVelocity.y = currentSpeed * Math.sin(angle);
        ballVelocity.x = -Math.sqrt(currentSpeed**2 - ballVelocity.y**2);
    }

    // Pontos
    if (x <= 0) { player2Score++; updateScore(); currentSpeed = baseSpeed; resetBall(); return; }
    if (x >= areaWidth - ballSize) { player1Score++; updateScore(); currentSpeed = baseSpeed; resetBall(); return; }

    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
}

// ======================
// Reinicia a bola
// ======================
function resetBall() {
    cancelAnimationFrame(gameLoop);
    isRunning = false;

    setTimeout(() => {
        initBall();
        startLoop();
    }, 5);
}

// ======================
// Atualiza placar
// ======================
function updateScore() {
    score1.innerText = `${player1Name}: ${player1Score}`;
    score2.innerText = `${player2Name}: ${player2Score}`;
}