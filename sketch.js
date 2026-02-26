let canvasSize=[1200, 600];

// ----- ANT Settings -----
let total=100;
let ants=[];

// ----- Graphics -----
let map;

// ----- Colors -----
let wallColor=[100, 50, 10];
let groundColor=[170, 120, 80];

// ----- Modes (Booleans) -----
let drawMap=true;

// ----- Buttons -----
let mapEditor_B;

// ----- Sliders -----


function setup() 
{
	createCanvas(canvasSize[0],canvasSize[1]);
	map=createGraphics(canvasSize[0],canvasSize[1]);

	for (let i = 0; i < total; i++) {
		ants.push(new Ant(300,300,random(0,PI)))
	}

	map.background(wallColor);
	map.fill(groundColor);
	map.noStroke();
	map.rect(15,15,canvasSize[0]-35,canvasSize[1]-35);
}

function draw()
{
	background(220);
	image(map, 0,0);
	for (let i = 0; i < total; i++) {
		ants[i].update();
		ants[i].show(1);
	}
}

function keyPressed() {
  if (drawMap && key === 'r') {
    map.background(wallColor);
		map.fill(groundColor);
		map.noStroke();
		map.rect(15,15,canvasSize[0]-35,canvasSize[1]-35);
  }
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
}