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
    height:shipHeight
}
let shipVel=tileSize;
let shipImg= new Image();
shipImg.src= "./Assets/ship.png";

let alienArr=[];
let alienWith=tileSize*2;
let alienHeight=tileSize;
let alienX=tileSize;
let alienY=tileSize;

let alienImgMagenta = new Image();
alienImgMagenta.src = "./Assets/alien-magenta.png";
let alienImgCyan = new Image();
alienImgCyan.src = "./Assets/alien-cyan.png";
let alienImgYellow = new Image();
alienImgYellow.src = "./Assets/alien-yellow.png";
let alienImgWhite = new Image();
alienImgWhite.src = "./Assets/alien-white.png";

let alienRows=2;
let alienColumns=3;
let alienCount=3;
let alienVel=1;

let bulletArr=[];
let alienBulletArr=[];
let bulletVel=-10;

let score=0;
let gameOver=false;
let level=1;

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
    document.addEventListener("keydown", shoot);
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
    if(gameOver){
        return;
    }
    context.clearRect(0,0,board.width,board.height);

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
    for(let i=0;i<bulletArr.length; i++){
        let bullet=bulletArr[i];
        bullet.y+=bulletVel;
        context.fillStyle="white";
        context.fillRect(bullet.x,bullet.y,bullet.width,bullet.height);

        for(let k=0;k<alienArr.length;k++){
            let alien=alienArr[k];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.hp--;
                score+=20;
                alien.img=getAlienImage(alien.hp);
                if(alien.hp==0){
                    alien.alive = false;
                    alienCount--;
                    score += 100;
                }
            }
            
        }
    }

    for (let i = 0; i < alienBulletArr.length; i++) {
        let bullet = alienBulletArr[i];
        bullet.y -= bulletVel/2;
        context.fillStyle = "red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Detect collision with player's ship
        if (detectCollision(bullet, ship)) {
            gameOver=true;
        }
    }

    //clear bullets
    while(bulletArr.length>0 && (bulletArr[0].used || bulletArr[0].y < 0)){
        bulletArr.shift();
    }

    //next level
    if(alienCount==0){
        alienColumns=Math.min(alienColumns+1, columns/2-2);
        alienRows=Math.min(alienRows+1,rows-4);
        alienVel+=0.2;
        alienArr=[];
        bulletArr=[];
        score+=500;
        level++;
        createAliens();
    }

    statistics();
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

function createAliens(){
    for(let c=0;c<alienColumns;c++){
        for(let r=0; r<alienRows;r++){
            let health= Math.floor(Math.random() * 4) + 1;
            let alien={
                img: getAlienImage(health),
                x:alienX+ c*alienWith,
                y: alienY + r*alienHeight,
                width: alienWith,
                height: alienHeight,
                alive:true,
                hp: health
            }
            alienArr.push(alien);
        }
    }
    alienCount=alienArr.length;
}

function getAlienImage(hp) {
    if (hp == 3) {
        return alienImgCyan;
    } else if (hp == 2) {
        return alienImgYellow;
    } else if (hp == 1) {
        return alienImgWhite;
    } else {
        return alienImgMagenta;
    }
}

function shoot(e){
    if(gameOver){
        return;
    }

    if(e.code == "Space"){
        let bullet={
            x:ship.x +shipWdith*15/32,
            y: ship.y,
            width: tileSize/8,
            height: tileSize/2,
            used: false
        }
        bulletArr.push(bullet);
    }
}

function shootAlienBullet() {
    // Choose a random alien to shoot from
    let shootingAliens = alienArr.filter(alien => alien.alive);
    if (shootingAliens.length === 0) return;
    let shootingAlien = shootingAliens[Math.floor(Math.random() * shootingAliens.length)];

    let bullet = {
        x: shootingAlien.x + shootingAlien.width / 2,
        y: shootingAlien.y + shootingAlien.height,
        width: tileSize / 6,
        height: tileSize / 2,
        used: false
    };
    alienBulletArr.push(bullet);
}
setInterval(shootAlienBullet, Math.random() * 1000 + 1000);


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

    //level
    context.fillStyle="white";
    context.font="28px PixelFont";
    context.fillText("Level ",board.width-140,30);

    context.fillStyle="#33ff00";
    context.fillText(level,board.width-40, 30);
}