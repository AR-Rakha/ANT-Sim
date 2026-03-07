let canvasSize=[1200, 600];

// ----- ANT Settings -----
let total=1500;
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
let drawFood=true;
let runAnts=true;

// ----- Buttons -----
let mapEditor_B;
let pauseAnts_B;

// ----- Sliders -----
let speedSlider;

function setup() 
{
	pauseAnts_B=createCheckbox("Pause", false)
	mapEditor_B=createCheckbox("DrawMap", false)
	speedSlider=createSlider(1, 10, 1,1)

	createCanvas(canvasSize[0],canvasSize[1]);
	map=createGraphics(canvasSize[0],canvasSize[1]);
	foodMap=createGraphics(canvasSize[0],canvasSize[1]);

	for (let i = 0; i < total; i++) {
		ants.push(new Ant(50,50,PI/2*3,groundColor,wallColor,FoodColor))
	}

	pixelDensity(1)
	map.pixelDensity(1);
	foodMap.pixelDensity(1);

	map.background(groundColor);
	foodMap.clear();
	drawMapBorder()
}

function draw()
{
	map.loadPixels();   // ← THIS IS REQUIRED EVERY FRAME
	background(0);
	
	
	image(map, 0,0);	
	blendMode(REMOVE);
  image(foodMap, 0, 0);
  blendMode(BLEND);
	
	
	if(runAnts){
		for (let i = 0; i < total; i++) {
			if(!pauseAnts_B.checked()){
				for (let j = 0; j < speedSlider.value(); j++) {
					ants[i].wallCollision(map)
					ants[i].update();
				}
			}
			ants[i].show(1);
		}	
	}
}

function keyPressed() {
  if (mapEditor_B.checked && key === 'r') {
    map.background(groundColor);
		
		drawMapBorder()
  }
}

function drawMapBorder(){
	map.noFill()
	map.stroke(wallColor);
	map.strokeWeight(50)
	map.rectMode(CORNER)		
	map.rect(0,0,canvasSize[0],canvasSize[1]);
}

function drawLab(){
	map.background(wallColor)
	map.fill(groundColor)
	map.stroke(groundColor)
	map.strokeWeight(35)
	//map.rect(25,25,200,75)
	/*for (let i = 75; i <= canvasSize[0]-75; i+=50) {
		map.line(i,25,i,canvasSize[1]-25)	
	}
	for (let i = 75; i <= canvasSize[1]-75; i+=50) {
		map.line(25,i,canvasSize[0]-25,i)	
	}*/
	let routePoints=[[50,50],[150,50],[150,200],[100,200],[100,400],[300,400],[300,300],
	[250,300],[250,250],[400,250],[400,150],[500,150],[500,350],[400,350],[400,450],
	[250,450],[250,500],[600,500],[600,300],[650,300],[650,100],[600,100],[600,50],
	[750,50],[750,400],[800,400],[900,500],[1000,500],[1000,300],[850,300],[850,150],
	[950,150],[950,100],[1000,100],[1000,200],[1100,200],[1100,500]]
	
	for (let i = 0; i < routePoints.length-1; i++) {
		map.line(routePoints[i][0],routePoints[i][1],routePoints[i+1][0],routePoints[i+1][1])	
	}
	map.rectMode(CENTER)
	map.rect(routePoints[routePoints.length-1][0],routePoints[routePoints.length-1][1],100,100,25)


}

function mouseDragged() {
	if(mapEditor_B.checked()){
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
			foodMap.blendMode(BLEND);
			foodMap.strokeWeight(10);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
			foodMap.blendMode(BLEND)
			
		}else if(mouseButton === RIGHT){
			foodMap.stroke(0);
			foodMap.blendMode(REMOVE)
			foodMap.strokeWeight(30);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
			
			
		}
	}
	drawMapBorder()
}