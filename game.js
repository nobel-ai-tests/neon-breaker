const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');

canvas.width = 600;
canvas.height = 800;

let score = 0;
let lives = 3;
let gameRunning = true;

const paddle = {
    width: 100,
    height: 15,
    x: (canvas.width - 100) / 2,
    y: canvas.height - 30,
    color: '#0ff',
    speed: 8
};

const ball = {
    radius: 8,
    x: canvas.width / 2,
    y: canvas.height - 50,
    dx: 4,
    dy: -4,
    color: '#fff'
};

const brickRowCount = 8;
const brickColumnCount = 7;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;
const brickWidth = 70;
const brickHeight = 25;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: `hsl(${r * 40}, 100%, 50%)` };
    }
}

const particles = [];

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            life: 1,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawPaddle() {
    ctx.fillStyle = paddle.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.fillStyle = bricks[c][r].color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = bricks[c][r].color;
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                ctx.shadowBlur = 0;
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    scoreEl.innerText = `Score: ${score}`;
                    createParticles(b.x + brickWidth / 2, b.y + brickHeight / 2, b.color);
                    if (score === brickRowCount * brickColumnCount * 10) {
                        gameOver(true);
                    }
                }
            }
        }
    }
}

function movePaddle() {
    // Mouse interaction is handled by event listener
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.radius > canvas.height) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // Hit paddle
            let collidePoint = ball.x - (paddle.x + paddle.width / 2);
            collidePoint = collidePoint / (paddle.width / 2);
            const angle = collidePoint * Math.PI / 3;
            ball.dx = 7 * Math.sin(angle);
            ball.dy = -7 * Math.cos(angle);
        } else {
            lives--;
            livesEl.innerText = `Lives: ${lives}`;
            if (!lives) {
                gameOver(false);
            } else {
                resetBall();
            }
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = (canvas.width - paddle.width) / 2;
}

function gameOver(win) {
    gameRunning = false;
    message.innerText = win ? 'YOU WIN!' : 'GAME OVER';
    overlay.classList.remove('hidden');
}

function restartGame() {
    score = 0;
    lives = 3;
    scoreEl.innerText = `Score: ${score}`;
    livesEl.innerText = `Lives: ${lives}`;
    gameRunning = true;
    overlay.classList.add('hidden');
    bricks.forEach(column => column.forEach(brick => brick.status = 1));
    resetBall();
    requestAnimationFrame(update);
}

document.addEventListener('mousemove', e => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
});

restartBtn.addEventListener('click', restartGame);

function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawParticles();
    
    collisionDetection();
    moveBall();
    updateParticles();

    requestAnimationFrame(update);
}

update();
