let tileSize=32;
let rows=18;
let columns=24;

let board;
let boardWidth= tileSize*columns;
let boardHeight= tileSize*rows;
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
let alienImg= new Image();
alienImg.src="./Assets/alien-white.png";

let alienRows=2;
let alienColumns=3;
let alienCount=3;
let alienVel=1;

let bulletArr=[];
let bulletVel=-10;

let score=0;
let gameOver=false;

window.onload=function(){
    board=document.getElementById("board");
    board.width=boardWidth;
    board.height=boardHeight;
    context=board.getContext("2d")

    context.fillRect(ship.x,ship.y,ship.width,ship.height);

    //ship
    context.drawImage(shipImg, ship.x,ship.y,ship.width,ship.height);

    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keydown", shoot);
}

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
            if(!bullet.used && alien.alive && detectCollision(bullet, alien)){
                bullet.used=true;
                alien.alive=false;
                alienCount--;
                score+=100;
            }
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
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText("Score: "+score,5,20);
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
            let alien={
                img:alienImg,
                x:alienX+ c*alienWith,
                y: alienY + r*alienHeight,
                width: alienWith,
                height: alienHeight,
                alive:true
            }
            alienArr.push(alien);
        }
    }
    alienCount=alienArr.length;
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

function detectCollision(a,b){
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}