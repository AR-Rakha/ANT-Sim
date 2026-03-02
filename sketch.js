let canvasSize=[1200, 600];

// ----- ANT Settings -----
let total=500;
let ants=[];

// ----- Graphics -----
let map;
let maskedMap;
let foodMap;


// ----- Colors -----
let wallColor=[100, 50, 10];
let groundColor=[170, 120, 80];
let FoodColor=[80, 230, 50];

// ----- Modes (Booleans) -----
let drawMap=false;
let drawFood=true
let runAnts=true;

// ----- Buttons -----
let mapEditor_B;

// ----- Sliders -----


function setup() 
{
	createCanvas(canvasSize[0],canvasSize[1]);
	map=createGraphics(canvasSize[0],canvasSize[1]);
	foodMap=createGraphics(canvasSize[0],canvasSize[1]);

	for (let i = 0; i < total; i++) {
		ants.push(new Ant(300,300,random(0,PI),groundColor,wallColor,FoodColor))
	}

	pixelDensity(1)
	map.pixelDensity(1);
	foodMap.pixelDensity(1);

	map.background(groundColor);
	foodMap.background(0);
	drawBorder()
}

function draw()
{
	map.loadPixels();   // ← THIS IS REQUIRED EVERY FRAME
	background(FoodColor);
	
	(maskedMap = map.get()).mask(foodMap.get());
	
	image(maskedMap, 0,0);
	
	
	if(runAnts){
		for (let i = 0; i < total; i++) {
			ants[i].wallCollision(map)
			ants[i].update();
			ants[i].show(1);
		}
	}
}

function keyPressed() {
  if (drawMap && key === 'r') {
    map.background(groundColor);
		drawBorder()
  }
}

function drawBorder(){
	map.noFill()
	map.stroke(wallColor);
	map.strokeWeight(100)		
	map.rect(0,0,canvasSize[0],canvasSize[1]);
}

function mouseDragged() {
	if(drawMap){
		if(mouseButton === LEFT){
			map.stroke(wallColor);
			map.strokeWeight(60);
			map.line(pmouseX, pmouseY,mouseX, mouseY);
			
		}else if(mouseButton === RIGHT){
			map.stroke(groundColor);
			map.strokeWeight(60);
			map.line(pmouseX, pmouseY,mouseX, mouseY);
			
		}
	}
	if(drawFood){
		if(mouseButton === LEFT){
			foodMap.stroke(255);
			foodMap.blendMode(REMOVE);
			foodMap.strokeWeight(10);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
			foodMap.blendMode(BLEND)
			
		}else if(mouseButton === RIGHT){
			foodMap.stroke(0);
			foodMap.blendMode(BLEND)
			foodMap.strokeWeight(30);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
			
			
		}
	}
	drawBorder()
}