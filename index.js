let tileSize=32;
let rows = Math.floor(window.innerHeight / tileSize);
let columns = Math.floor(window.innerWidth / tileSize);

let board;
let boardWidth= window.innerWidth;
let boardHeight= window.innerHeight;
let context;

let shipWdith= tileSize*2;
let shipHeight= tileSize;
let shipX= tileSize*columns/2-tileSize;
let shipY= tileSize*rows-tileSize*2;

let ship={
    x:shipX,
    y:shipY,
    width: shipWdith,
    height:shipHeight,
    lives:3
}
let shipVel=tileSize;
let shipImg= new Image();
shipImg.src= "./Assets/ship.png";

let alienArr=[];
let alienWidth=tileSize*2;
let alienHeight=tileSize;
let alienX=boardWidth/2-alienWidth*3/2;
let alienY=tileSize*2;

let alienImgMagenta = [new Image(),new Image];
alienImgMagenta[0].src = "./Assets/alien-magenta.png";
alienImgMagenta[1].src = "./Assets/alien-magenta_2.png";

let alienImgCyan = [new Image(), new Image()];
alienImgCyan[0].src = "./Assets/alien-cyan.png";
alienImgCyan[1].src = "./Assets/alien-cyan_2.png";

let alienImgYellow = [new Image(),new Image];
alienImgYellow[0].src = "./Assets/alien-yellow.png";
alienImgYellow[1].src = "./Assets/alien-yellow_2.png";

let alienImgWhite = [new Image(),new Image];
alienImgWhite[0].src = "./Assets/alien-white.png";
alienImgWhite[1].src = "./Assets/alien-white_2.png";

let alien2Img=new Image();
alien2Img.src = "./Assets/alien2.png"

let alienDeathEffect=new Image();
alienDeathEffect.src = "./Assets/alien_death.png";
let alienDamageEffect=new Image();
alienDamageEffect.src ="./Assets/alien_life_lost.png"
let alien_bullet=new Image();
alien_bullet.src="./Assets/alien_bullet.png";

let life_lost=new Image();
life_lost.src="./Assets/life_lost.png"

let font = new FontFace('PixelFont', 'url(./Assets/slkscr.ttf)');

font.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
});

let effects = [];

let alienRows=2;
let alienColumns=3;
let alienCount=3;
let alienVel=1;

let bulletArr=[];
let alienBulletArr=[];
let bulletVel=-10;
let alienShootSpeed=500;

let promptText="";
let promptY = boardHeight / 1.5;
let promptVel=2;
let promptTime=0.008;
let promptOpacity = 1;
let promptColor="255,255,255"
let showingPrompt = false;

let score=0;
let gameOver=false;
let gameStarted = false;
let gameOverTime = null;
let firstFrameRendered = false;
let paused=false;
let level=1;
let shootingSpeed = 500; // milliseconds
let shootingInterval = setInterval(autoShoot, shootingSpeed);

let instructionsArr=["Press Space to start","Press arrow keys or A/D keys to move", "Press space bar to shoot","P-Pause  R-Restart", "Kill enemies and dont die"]
let instructionIndex = 1;
prompt(instructionsArr[0], 1, 0.004);

document.addEventListener("keydown", function(e) {
    if (!gameStarted && e.code === "Space"){
        gameStarted=true;
        instructions();
    }
    if (e.code === "KeyR"){
        restartGame();
    }
    if (e.code === "KeyP"){
        paused = !paused;
    }
    if (e.code === "KeyI"){
        instructions();
    }
});

function instructions(){
    let instructionInterval = setInterval(() => {
        prompt(instructionsArr[instructionIndex], 1, 0.004);
        instructionIndex++;
        if (instructionIndex >= instructionsArr.length) {
            clearInterval(instructionInterval);
        }
    }, 2000);
    instructionIndex=1;
}


window.onload=function(){
    board=document.getElementById("board");
    board.width= boardWidth;
    board.height= boardHeight;
    context=board.getContext("2d")

    context.fillRect(ship.x,ship.y,ship.width,ship.height);

    //ship
    context.drawImage(shipImg, ship.x,ship.y,ship.width,ship.height);

    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

window.addEventListener("resize", function() {
    board.width = window.innerWidth;
    board.height = window.innerHeight;
    rows = Math.floor(board.height / tileSize);
    columns = Math.floor(board.width / tileSize);
    statistics();
});

function update(){
    requestAnimationFrame(update);
    if (gameOver) {
        if (!gameOverTime) {
            gameOverTime = Date.now();
        }
        
        if (Date.now() - gameOverTime > 200) {
            context.fillStyle = "red";
            context.font = "40px PixelFont";
            context.fillText("Game Over", boardWidth / 2 - 100, boardHeight / 2);
            return;
        }
    } else {
        gameOverTime = null;
    }
    
    if (!firstFrameRendered || (gameStarted && !paused)) {
        firstFrameRendered = true;

        context.clearRect(0,0,board.width,board.height);

        let currentTime = Date.now();
        for (let i = 0; i < effects.length; i++) {
            let effect = effects[i];
            if (currentTime - effect.startTime > 1500) {
                context.clearRect(effect.x, effect.y, effect.width, effect.height);
                effects.splice(i, 1);
                i--;
            }
        }

        //ship
        context.drawImage(shipImg, ship.x,ship.y,ship.width,ship.height);

        //aliens
        for(let i=0;i<alienArr.length;i++){
            let alien= alienArr[i];
            if(alien.alive){
                alien.x += alienVel;
                if(alien.x+alien.width >= board.width || alien.x<=0){
                    alienVel*=-1;
                    alien.x+=alienVel*2;

                    for(let k=0;k<alienArr.length;k++){
                        alienArr[k].y+=alienHeight;
                    }
                }
                context.drawImage(alien.img,alien.x,alien.y,alien.width,alien.height);

                if(alien.y>=ship.y){
                    gameOver=true;
                }
            }
        }

        //bullets
        shooting();

        //clear bullets
        while(bulletArr.length>0 && (bulletArr[0].used || bulletArr[0].y < 0)){
            bulletArr.shift();
        }

        //draw prompt
        if (showingPrompt) {
            context.fillStyle = `rgba(${promptColor}, ${promptOpacity})`;
            context.font = "34px PixelFont";
            let textWidth = context.measureText(promptText).width;
            context.fillText(promptText,(board.width-textWidth)/2, promptY);

            // Move the prompt up and reduce its opacity
            promptY -= promptVel;
            promptOpacity -= promptTime;

            // Hide the prompt when its opacity reaches 0
            if (promptOpacity <= 0) {
                showingPrompt = false;
            }
        }

        nextLevel();

        statistics();
    }
}

function nextLevel() {
    if (alienCount == 0) {
        if (level <= 10) {
            alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
            alienRows = Math.min(alienRows + 1, rows - 4);
        }
        alienVel += 0.2;
        alienArr = [];
        bulletArr = [];
        score += 2000;
        level++;
        if (level - 1 == 4) {
            prompt("Auto Fire Unlocked", 1.5, 0.004);
        }
        if (level > 4) {
            alienShootSpeed = Math.min(alienShootSpeed - 100, 20);
            shootingSpeed *= 0.8;
            clearInterval(shootingInterval);
            shootingInterval = setInterval(autoShoot, shootingSpeed);
        }
        if ((level - 1) % 3 == 0 && ship.lives < 3) {
            ship.lives++;
            prompt("+1 life", 1.5, 0.01, "155,255,155");
        }
        if(level==6){
            prompt("Double Gun Unlocked", 1.5, 0.004, "255,255,0")
        }
        createAliens();
    }
}


function prompt(text, vel=2, time=0.01, color="135, 206, 235") {
    // Only show the prompt if it is not currently being shown
    if (!showingPrompt) {
        showingPrompt = true;
        promptText = text;
        promptY = boardHeight / 1.5;
        promptOpacity = 1;
        promptVel=vel;
        promptTime=time;
        promptColor=color;
    }
}

function moveShip(e){
    if(gameOver){
        return;
    }

    if(e.code=="ArrowLeft" && ship.x - shipVel >=0){
        ship.x-=shipVel;
    }
    else if(e.code=="ArrowRight" && ship.x +shipVel + shipWdith <=board.width){
        ship.x+=shipVel;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let maxHp = Math.min(level, 4);
            let health = Math.floor(Math.random() * maxHp) + 1;
            let alienType=1;
            if (level >= 8 && r === 0) {
                // Create new type of alien with 10 HP on topmost row
                alienType=2;
                health = 10;
            } else if (level > 10 && r < level - 10) {
                // Create more rows of new type of aliens with 10 HP
                alienType=2;
                health = 10;
            }
            let alien = {
                img: getAlienImage(health, alienType),
                x: alienX + c * (alienWidth+4),
                y: alienY + r * (alienHeight + 4),
                width: alienWidth,
                height: alienHeight,
                alive: true,
                hp: health,
                type:alienType
            };
            alienArr.push(alien);
        }
    }
    alienCount = alienArr.length;
}

function getAlienImage(hp, type) {
    let imageVersion = Math.floor(Date.now() / 600) % 2 ;

    if (type==2) {
        return alien2Img;
    } 
    else if (hp == 3 && type==1) {
        return alienImgCyan[imageVersion];
    } 
    else if (hp == 2 && type==1) {
        return alienImgYellow[imageVersion];
    } 
    else if (hp == 1 && type==1) {
        return alienImgWhite[imageVersion];
    } 
    else {
        return alienImgMagenta[imageVersion];
    }
}

function shooting(){
    //player shoots
    for(let i=0;i<bulletArr.length; i++){
        let bullet=bulletArr[i];
        bullet.y+=bulletVel;
        context.fillStyle="white";
        context.fillRect(bullet.x,bullet.y,bullet.width,bullet.height);

        for (let k = 0; k < alienArr.length; k++) {
            let alien = alienArr[k];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.hp--;
                score += 20;
                alien.img = getAlienImage(alien.hp,alien.type);
    
                // Show damage effect
                if (alien.hp > 0) {
                    showEffect(alienDamageEffect, alien.x, alien.y, alien.width, alien.height);
                } else {
                    // Show death effect
                    showEffect(alienDeathEffect, alien.x, alien.y, alien.width, alien.height);
                    alien.alive = false;
                    alienCount--;
                    score += 100;
                }
            }
        }
    }

    //alien shoots
    for (let i = 0; i < alienBulletArr.length; i++) {
        let bullet = alienBulletArr[i];
        bullet.y -= bulletVel/6;
        context.drawImage(bullet.img, bullet.x, bullet.y, bullet.width*2, bullet.height*2);

        // Detect collision with player's ship
        if (detectCollision(bullet, ship)) {
            showEffect(life_lost, ship.x-ship.height, ship.y-10, ship.width*2, ship.height*2);
            showEffect(life_lost, board.width - 145 + (ship.lives - 1) * (ship.width / 2+10), 15, ship.width/1.5, ship.height/1.5);
            ship.lives--;
            prompt("-1 Life",2,0.008,"255,155,155");
            alienBulletArr.splice(i, 1);
            i--;
            if(ship.lives==0){
                gameOver=true;
            }
        }
    }
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        if (level >= 6) {
            addBullet(ship.x+15,ship.y+5)
            addBullet(ship.x + ship.width-15,ship.y+5)
        } else {
            addBullet()
        }
    }
}


function autoShoot() {
    // Only shoot if the game is not over and the level is greater than 4
    if (!gameOver && level > 4) {
        if (level >= 6) {
            addBullet(ship.x+15,ship.y+5)
            addBullet(ship.x + ship.width-15,ship.y+5)
        } else {
            addBullet()
        }
    }
}

function addBullet(x=ship.x + shipWdith * 15 / 32,y=ship.y){
    let bullet = {
        x: x,
        y: y,
        width: tileSize / 8,
        height: tileSize / 2,
        used: false
    };
    bulletArr.push(bullet)
}

function shootAlienBullet() {
    if (paused) return;
    // Choose a random alien to shoot from
    let shootingAliens = alienArr.filter(alien => alien.alive);
    if (shootingAliens.length === 0) return;
    let shootingAlien = shootingAliens[Math.floor(Math.random() * shootingAliens.length)];

    // Create a new bullet using the alien_bullet image
    let bullet = {
        img: alien_bullet,
        x: shootingAlien.x + shootingAlien.width / 2,
        y: shootingAlien.y + shootingAlien.height,
        width: tileSize / 6,
        height: tileSize / 2,
        used: false
    };
    alienBulletArr.push(bullet);
}
setInterval(shootAlienBullet, Math.random() * 1000 + alienShootSpeed);


function detectCollision(a,b){
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}

function statistics(){
    //score
    context.fillStyle="white";
    context.font="28px PixelFont";
    context.fillText("Score ",10,30);

    context.fillStyle="#33ff00";
    context.fillText(score,125, 30);

    // Draw level
    context.fillStyle = "white";
    context.font = "28px PixelFont";
    context.fillText("Level ", 10, 60);

    context.fillStyle = "#33ff00";
    context.fillText(level, 125, 60);

    // Draw lives
    context.fillStyle = "white";
    context.font = "28px PixelFont";
    context.fillText("Lives ", (board.width - 3*(ship.width)-50), 32);

    for (let i = 0; i < ship.lives; i++) {
        context.drawImage(shipImg, board.width - 140 + i * (ship.width / 2 + 10), 15, ship.width / 2, ship.height / 2);
    }
}

function showEffect(effectImg, x, y, width, height) {
    context.drawImage(effectImg, x, y, width, height);
    effects.push({x: x, y: y, width: width, height: height, startTime: Date.now()});
}

function restartGame() {
    // Reset game variables
    ship.lives = 3;
    score = 0;
    level = 1;
    alienColumns = 3;
    alienRows = 2;
    alienVel = 1;
    alienArr = [];
    bulletArr = [];
    alienBulletArr = [];
    shootingSpeed = 500;
    clearInterval(shootingInterval);
    shootingInterval = setInterval(autoShoot, shootingSpeed);
    
    // Create aliens
    createAliens();
    
    // Reset game over flag
    gameOver = false;
}

function animateAliens() {
    for (let i = 0; i < alienArr.length; i++) {
        let alien = alienArr[i];
        alien.img = getAlienImage(alien.hp, alien.type);
    }
}

setInterval(animateAliens, 600);
