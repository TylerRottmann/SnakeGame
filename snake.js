let blockSize = 25;
let total_row = 17; // Total row number
let total_col = 17; // Total column number
let board, context;
let gameMode = "normal";

let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

let speedX = 0; // Snake speed in x coordinate
let speedY = 0; // Snake speed in y coordinate
let snakeBody = [];

let foodX, foodY;
let score = 0;

let gameOver = false;
let directionChanged = false; // Prevents double key presses in one frame

// Speed control
let snakeSpeed = 10; // Lower value = faster snake; Higher value = slower snake
let frameCount = 0;

// (For night mode, generates a random integer between 1 and 100 to determine eye color easter egg
let eyeColorChance = Math.floor(Math.random() * 100) + 1;

// Initialize high score variable
let highScore = 0; 

window.onload = function () {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('highScore');
    highScore = savedHighScore ? parseInt(savedHighScore) : 0;

    // Display the high score
    updateHighScoreDisplay();

    // Load the saved game mode or default to "normal"
    const savedGameMode = localStorage.getItem('gameMode');
    gameMode = savedGameMode ? savedGameMode : "normal";

    // Set the dropdown to reflect the saved game mode
    const gameModeDropdown = document.getElementById('game-mode-dropdown');
    if (gameModeDropdown) {
        gameModeDropdown.value = gameMode;
    }

    drawBoard();
    placeFood();
    document.addEventListener("keyup", changeDirection);
    requestAnimationFrame(gameLoop);
};

function drawBoard(){
    board = document.getElementById("board");
    board.height = total_row * blockSize;
    board.width = total_col * blockSize;
    context = board.getContext("2d");
}

function gameLoop() {
    if (gameOver) return;

    // Increment the frame counter
    frameCount++;

    // Update the game at the specified frame interval
    if (frameCount % Math.round(snakeSpeed) === 0) {
        update();
        render();
    }

    requestAnimationFrame(gameLoop);
}

function update() {
    directionChanged = false;

    // Check if snake eats food
    if (snakeX === foodX && snakeY === foodY) {
        // Add the current head position to the snake body
        snakeBody.push([snakeX, snakeY]);
        score++;
        if (gameMode === "speedy-snake") {
            // Reduce speed but ensure it doesn't get too fast
            snakeSpeed = Math.max(snakeSpeed - 0.25, 2);
        }
        updateScore();
        placeFood();
    }

    // Check if the player wins (snake fills the board)
    const totalCells = total_row * total_col;
    if (snakeBody.length + 1 === totalCells) { // +1 includes the head
        winGame();
        return;
    }

    // Move the snake body
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    // Update the first segment of the body to follow the head
    if (snakeBody.length > 0) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // Move the snake head
    snakeX += speedX * blockSize;
    snakeY += speedY * blockSize;

    // Check for wall collisions
    if (
        snakeX < 0 || snakeX >= total_col * blockSize ||
        snakeY < 0 || snakeY >= total_row * blockSize
    ) {
        endGame();
    }

    // Check for collisions with the snake's own body
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            endGame();
        }
    }
}

function render() {
    // Clear board
    if(!(gameMode == "night-mode")){
        context.fillStyle = "green";
    }
    else{
        context.fillStyle = "#09551c";
    }
    context.fillRect(0, 0, board.width, board.height);

    // Draw food (Red for every game mode expect yellow for night mode)
    if(!(gameMode == "night-mode")){
        context.fillStyle = "red";
    }
    else{
        context.fillStyle = "yellow";
    }
    context.fillRect(foodX, foodY, blockSize, blockSize);

    // Draw snake
    if(!(gameMode == "night-mode")){
        context.fillStyle = "white";
    }
    else{
        context.fillStyle = "grey";
    }
    context.fillRect(snakeX, snakeY, blockSize, blockSize);

    // Draw snake's body
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Draw eyes on the snake's head
    drawSnakeEyes(snakeX, snakeY);
}

// Function to draw the snake's eyes
function drawSnakeEyes(headX, headY) {
    if(!(gameMode == "night-mode")){
        context.fillStyle = "black";
    }
    else{
        if(eyeColorChance == 1){
            context.fillStyle = "red";
        }
        else if(eyeColorChance > 1 && eyeColorChance < 11){
            let alternateFlicker = Math.floor(Math.random() * 2) + 1;

            if(alternateFlicker == 1){
                context.fillStyle = "red";
            }
            else{
                context.fillStyle = "white";
            }
        }
        else{
            context.fillStyle = "white";
        }
    }

    // Left eye
    context.beginPath();
    context.arc(headX + blockSize * 0.25, headY + blockSize * 0.25, blockSize * 0.1, 0, 2 * Math.PI);
    context.fill();

    // Right eye
    context.beginPath();
    context.arc(headX + blockSize * 0.75, headY + blockSize * 0.25, blockSize * 0.1, 0, 2 * Math.PI);
    context.fill();
}

function changeDirection(e) {
    if (directionChanged) return;

    if(!(gameMode == "inverted-controls")){
        if (e.code === "ArrowUp" && speedY !== 1) {
            speedX = 0; speedY = -1;
        } else if (e.code === "ArrowDown" && speedY !== -1) {
            speedX = 0; speedY = 1;
        } else if (e.code === "ArrowLeft" && speedX !== 1) {
            speedX = -1; speedY = 0;
        } else if (e.code === "ArrowRight" && speedX !== -1) {
            speedX = 1; speedY = 0;
        }
    }
    else{
        if (e.code === "ArrowUp" && speedY !== 1) {
            speedX = 0; speedY = 1;
        } else if (e.code === "ArrowDown" && speedY !== -1) {
            speedX = 0; speedY = -1;
        } else if (e.code === "ArrowLeft" && speedX !== 1) {
            speedX = 1; speedY = 0;
        } else if (e.code === "ArrowRight" && speedX !== -1) {
            speedX = -1; speedY = 0;
        }
    }

    directionChanged = true;
}

function placeFood() {
    let validPosition = false;
    let attempts = 0;

    while (!validPosition) {
        // Generate random coordinates for food
        foodX = Math.floor(Math.random() * total_col) * blockSize;
        foodY = Math.floor(Math.random() * total_row) * blockSize;

        // Check if food overlaps with the snake body
        validPosition = true; // Assume position is valid initially
        if (snakeX === foodX && snakeY === foodY) {
            validPosition = false; // Food is on the snake's head
        }

        for (let i = 0; i < snakeBody.length; i++) {
            if (snakeBody[i][0] === foodX && snakeBody[i][1] === foodY) {
                validPosition = false; // Food overlaps with the snake body
                break;
            }
        }

        // Prevent infinite loop if no positions are valid
        attempts++;
        if (attempts > 100) {
            winGame(); // Player wins if no valid food position is found
            return;
        }
    }
}

function updateScore() {
    document.getElementById("score").innerText = `Score: ${score}`;
}

function endGame() {
    gameOver = true;

    // Check for a new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); // Save the new high score to localStorage
        updateHighScoreDisplay();
    }

    const message = document.createElement("div");
    message.className = "game-over";
    message.innerHTML = `
        <b>Game Over</b><br>
        Score: ${score}<br>
        High Score: ${highScore}<br>
        <button onclick="refreshPage()">Restart</button>
    `;
    document.body.appendChild(message);

    document.getElementById("speed").style.visibility = "hidden";
    document.getElementById("size").style.visibility = "hidden";
    document.getElementById("game-mode").style.visibility = "hidden";
}


function refreshPage() {
    window.location.reload();
}

//User chooses speed
function slowSpeed(){
    snakeSpeed = 15;
}

function mediumSpeed(){
    snakeSpeed = 10;
}

function fastSpeed(){
    snakeSpeed = 7;
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('slow').addEventListener('click', slowSpeed);
});

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('medium').addEventListener('click', mediumSpeed);
});

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('fast').addEventListener('click', fastSpeed);
});


//User changes board size
function smallBoard() {
    total_row = 13;
    total_col = 13;
    drawBoard();
    placeFood();
    console.log("Small board selected:", total_row, total_col);
}

function mediumBoard() {
    total_row = 17;
    total_col = 17;
    drawBoard();
    placeFood();
    console.log("Medium board selected:", total_row, total_col);
}

function largeBoard() {
    total_row = 21;
    total_col = 21;
    drawBoard();
    placeFood();
    console.log("Large board selected:", total_row, total_col);
}

// Attach event listeners when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

    document.getElementById('smallSize').addEventListener('click', smallBoard);
    document.getElementById('mediumSize').addEventListener('click', mediumBoard);
    document.getElementById('largeSize').addEventListener('click', largeBoard);

    // Update gameMode when dropdown value changes
    document.getElementById('game-mode-dropdown').addEventListener('change', function () {
        gameMode = this.value;
        localStorage.setItem('gameMode', gameMode); // Save game mode to localStorage
        render(); // Redraw the board to reflect the new game mode
        this.blur();
    });
});

function updateHighScoreDisplay() {
    const highScoreElement = document.getElementById("high-score");
    if (highScoreElement) {
        highScoreElement.innerText = `High Score: ${highScore}`;
    }
}

function winGame() {
    gameOver = true;

    const message = document.createElement("div");
    message.className = "game-win";
    message.innerHTML = `
        <b>Congratulations, You Win!</b><br>
        Final Score: ${score}<br>
        <button onclick="refreshPage()">Play Again</button>
    `;
    document.body.appendChild(message);

    document.getElementById("speed").style.visibility = "hidden";
    document.getElementById("size").style.visibility = "hidden";
    document.getElementById("game-mode").style.visibility = "hidden";
}

