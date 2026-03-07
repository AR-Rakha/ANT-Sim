let canvasSize=[1200, 600];

// ----- ANT Settings -----
let total=500;
let ants=[];

// ----- Graphics -----
let map;
let maskedMap;
let foodMap;

let pheromoneMap;


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
let foodEditor_B;
let pheromoneEditor_B

// ----- Sliders -----
let speedSlider;

function setup() 
{
	pauseAnts_B=createCheckbox("Pause", false)
	mapEditor_B=createCheckbox("DrawMap", false)
	foodEditor_B=createCheckbox("DrawFood", false)
	pheromoneEditor_B=createCheckbox("DrawPheromone", false)

	foodEditor_B.changed(function(){
		mapEditor_B.checked(false);
		pheromoneEditor_B.checked(false);
		pauseAnts_B.checked(true);
	});
	mapEditor_B.changed(function(){
		foodEditor_B.checked(false);
		pheromoneEditor_B.checked(false);
		pauseAnts_B.checked(true);
	});
	pheromoneEditor_B.changed(function(){
		foodEditor_B.checked(false);
		mapEditor_B.checked(false);
		pauseAnts_B.checked(true);
	});
	pauseAnts_B.changed(function(){
		foodEditor_B.checked(false);
		pheromoneEditor_B.checked(false);
		mapEditor_B.checked(false);
	});


	speedSlider=createSlider(1, 10, 1,1)

	createCanvas(canvasSize[0],canvasSize[1]);
	map=createGraphics(canvasSize[0],canvasSize[1]);
	foodMap=createGraphics(canvasSize[0],canvasSize[1]);
	pheromoneMap=createGraphics(canvasSize[0],canvasSize[1],WEBGL);

	for (let i = 0; i < total; i++) {
		ants.push(new Ant(50,50,PI/2*3,groundColor,wallColor,FoodColor))
	}

	pixelDensity(1)
	map.pixelDensity(1);
	foodMap.pixelDensity(1);
	pheromoneMap.pixelDensity(1);

	map.background(groundColor);
	foodMap.clear();
	pheromoneMap.background(0)
	drawMapBorder()
}

function draw()
{
	map.loadPixels();   // ← THIS IS REQUIRED EVERY FRAME
	foodMap.loadPixels();   // ← THIS IS REQUIRED EVERY FRAME
	background(255);
	
	blendMode(BLEND)
	image(map, 0,0);	
	blendMode(REMOVE);
  image(foodMap, 0, 0);
  blendMode(BLEND);
	
	
	if(runAnts){
		for (let j = 0; j < speedSlider.value(); j++) {
			if(!pauseAnts_B.checked()){
				for (let i = 0; i < total; i++) {
					
					ants[i].wallCollision(map);
					ants[i].foodDetection(foodMap);
					ants[i].collectFood(foodMap);
					ants[i].update();
					ants[i].addPheromone(pheromoneMap);
				}	
				pheromoneMap.blendMode(SUBTRACT);
				if(frameCount%3==0){
					pheromoneMap.stroke(0.53)
					pheromoneMap.strokeWeight(600)
					pheromoneMap.line(-canvasSize[0]/2,0,canvasSize[0]/2,0);
				}
			}
		}
	}
	for (let i = 0; i < total; i++) {
		ants[i].show(1);
	}	
	
	
	blendMode(ADD)
	image(pheromoneMap,0,0);

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
	if(foodEditor_B.checked()){
		if(mouseButton === LEFT){
			foodMap.stroke(255);
			foodMap.blendMode(BLEND);
			foodMap.strokeWeight(10);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
			
		}else if(mouseButton === RIGHT){
			foodMap.stroke(0);
			foodMap.blendMode(REMOVE)
			foodMap.strokeWeight(60);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
		}
	}
	if(pheromoneEditor_B.checked()){
		if(mouseButton === LEFT){
			pheromoneMap.stroke(50,0,0);
			pheromoneMap.blendMode(ADD);
			pheromoneMap.strokeWeight(10);
			pheromoneMap.line(pmouseX-canvasSize[0]/2, pmouseY-canvasSize[1]/2,mouseX-canvasSize[0]/2, mouseY-canvasSize[1]/2);
			pheromoneMap.blendMode(BLEND)
			
		}else if(mouseButton === RIGHT){
			pheromoneMap.stroke(0,0,50);
			pheromoneMap.blendMode(ADD)
			pheromoneMap.strokeWeight(60);
			pheromoneMap.line(pmouseX-canvasSize[0]/2, pmouseY-canvasSize[1]/2,mouseX-canvasSize[0]/2, mouseY-canvasSize[1]/2);
			pheromoneMap.blendMode(BLEND)
		}
	}
	drawMapBorder()
}