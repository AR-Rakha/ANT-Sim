let canvasSize=[1200, 600];

// ----- ANT Settings -----
let total=500;
let explorerTotal=100;
let ants=[];

let colonyPos=[50,50];

let pheromoneDecay = 0.99;
let pheromoneK = 0.01;


// ----- Graphics -----
let map;
let foodMap;

// ----- Custom maps -----

let home_pheromone_map;
let food_pheromone_map;

let maps_scale=5;
let map_low_res=[canvasSize[0]/maps_scale,canvasSize[1]/maps_scale];


// ----- Colors -----
let wallColor=[100, 50, 10];
let groundColor=[170, 120, 80];
let FoodColor=[80, 230, 50];

// ----- Buttons -----
let mapEditor_B;
let pauseAnts_B;
let foodEditor_B;
let pheromoneEditor_B;
let pheromoneShow_B;

let antReset_B;
let mapReset_B;
let foodReset_B;
let pheromoneReset_B;

// ----- Sliders -----
let speedSlider;

// ----- Text -----
let brushSize = 10;
let brushSizeP;


function setup() 
{
	pauseAnts_B=createCheckbox("Pause", true);
	mapEditor_B=createCheckbox("DrawMap", false);
	foodEditor_B=createCheckbox("DrawFood", false);
	pheromoneEditor_B=createCheckbox("DrawPheromone", false);
	pheromoneShow_B=createCheckbox("ShowPheromone", false);

	pauseAnts_B.position(1220, 25);
	pauseAnts_B.addClass('Pause');

	mapEditor_B.position(1220, 400);
	mapEditor_B.addClass('Map');

	foodEditor_B.position(1220, 450);
	foodEditor_B.addClass('Food');

	pheromoneEditor_B.position(1220, 500);
	pheromoneEditor_B.addClass('Phe');

	pheromoneShow_B.position(1220, 550);
	pheromoneShow_B.addClass('Phe-S');

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

	speedSlider=createSlider(1, 10, 1,1);
	speedSlider.position(1300, 120);
	speedSlider.size(200);
	speedSlider.addClass('SpeedSlider')

	antReset_B=createButton('ResetAnts');
	antReset_B.addClass('Reset');
	antReset_B.position(1220, 80);

	mapReset_B=createButton('ResetMap');
	mapReset_B.addClass('Reset');
	mapReset_B.position(1220, 140);

	foodReset_B=createButton('ResetFood');
	foodReset_B.addClass('Reset');
	foodReset_B.position(1220, 200);
	
	pheromoneReset_B=createButton('ResetPheromone');
	pheromoneReset_B.addClass('Reset');
	pheromoneReset_B.position(1220, 260);

	antReset_B.mousePressed(function(){
		for (let i = 0; i < total+explorerTotal; i++) {
			ants[i].reset(random(0, TWO_PI));
		}
	});

	mapReset_B.mousePressed(function(){
		map.background(groundColor);
		drawMapBorder();
	});

	foodReset_B.mousePressed(function(){
		foodMap.blendMode(REMOVE)
		foodMap.strokeWeight(0);
		foodMap.stroke(0);
		foodMap.rect(0, 0,canvasSize[0], canvasSize[1]);
	});
	pheromoneReset_B.mousePressed(function(){
		resetPheromones();
	});

	brushSizeP = createP("BrushSize: " + brushSize);
	brushSizeP.addClass('Brush');
	brushSizeP.position(1220, 350);


	createCanvas(canvasSize[0],canvasSize[1]);

	map=createGraphics(canvasSize[0],canvasSize[1]);
	foodMap=createGraphics(canvasSize[0],canvasSize[1]);

	for (let i = 0; i < total; i++) {
		ants.push(new Ant(colonyPos,random(0, TWO_PI)));
		ants[i].setColor([0,0,0],[150,0,0]);
		ants[i].setEnvColor(wallColor);
		ants[i].setStrengths(0.8,0.5,0.3,1,0.6);
		ants[i].setWalkTimePheromoneDecay(0.0005);
	}
	for (let i = 0; i < explorerTotal; i++) {
		ants.push(new ExplorerAnt(colonyPos,random(0, TWO_PI)));
		ants[total+i].setColor([0,0,100],[150,0,100]);
		ants[total+i].setEnvColor(wallColor);
		ants[total+i].setStrengths(0.8,0.75,0.3,1,0.3,0.25);
		ants[total+i].setWalkTimePheromoneDecay(0.0005);
	}

	pixelDensity(1);
	map.pixelDensity(1);
	foodMap.pixelDensity(1);

	map.background(groundColor);
	drawMapBorder();

	foodMap.clear();

	resetPheromones();
}

function draw()
{
	map.loadPixels();
	foodMap.loadPixels();

	background(255);	
	image(map, 0,0);	
  image(foodMap, 0, 0);

	brushSizeP.html("BrushSize: " + brushSize);
	
	if(!pauseAnts_B.checked()){
		for (let j = 0; j < speedSlider.value(); j++){
			for (let i = 0; i < total+explorerTotal; i++) {
				ants[i].update(map,foodMap,home_pheromone_map,food_pheromone_map,map_low_res,maps_scale);
			}	
			for (let i = 0; i < total+explorerTotal; i++) {
				ants[i].addPheromone(home_pheromone_map,food_pheromone_map,map_low_res,maps_scale);
			}	
		}
	}

	for (let i = 0; i < total+explorerTotal; i++) {
		ants[i].show(1);
		noStroke();
	}	

	fill(120);
	stroke(60);
	strokeWeight(10);
	ellipse(colonyPos[0],colonyPos[1], 30);

  for(let i=0;i<map_low_res[0];i++){
    for(let j=0;j<map_low_res[1];j++){ 
      
			if(!pauseAnts_B.checked()){
				for (let s = 0; s < speedSlider.value(); s++) {
					home_pheromone_map[j*map_low_res[0]+i] *= pheromoneDecay;
					food_pheromone_map[j*map_low_res[0]+i] *= pheromoneDecay;
					home_pheromone_map[j*map_low_res[0]+i] -= pheromoneK;
					home_pheromone_map[j*map_low_res[0]+i] = min(max(0,home_pheromone_map[j*map_low_res[0]+i]),255*5);
					food_pheromone_map[j*map_low_res[0]+i] = min(max(0,food_pheromone_map[j*map_low_res[0]+i]),255*5);
				}
				
			}
			if(pheromoneShow_B.checked() && (home_pheromone_map[j*map_low_res[0]+i]>0 || food_pheromone_map[j*map_low_res[0]+i]>0)){
				noStroke();
				let f1 = home_pheromone_map[j*map_low_res[0]+i]/10;
				let f2 = food_pheromone_map[j*map_low_res[0]+i]/10;
				fill(f1,f2,0,min((f1+f2)/2,100));
    		rect(maps_scale*i,maps_scale*j,maps_scale); 
			}
    } 
  } 

	map.updatePixels();
	foodMap.updatePixels();
}

function drawMapBorder(){
	map.noFill();
	map.stroke(wallColor);
	map.strokeWeight(50);
	map.rectMode(CORNER);
	map.rect(0,0,canvasSize[0],canvasSize[1]);
}

function resetPheromones(){		
	home_pheromone_map = [];
	food_pheromone_map = [];
	for(let i = 0;i<map_low_res[0]*map_low_res[1];i++){ 
    home_pheromone_map.push(0);
		food_pheromone_map.push(0);
  } 
}

function mouseWheel(event) {
  if (event.delta < 0) {
    brushSize += 1;
  } else {
    brushSize -= 1;
  }
	brushSize = max(5,min(brushSize,150));
}

function mouseDragged() {
	if(mapEditor_B.checked()){
		map.strokeWeight(brushSize);
		if(mouseButton === LEFT){
			map.stroke(wallColor);
			map.line(pmouseX, pmouseY,mouseX, mouseY);
		}else if(mouseButton === RIGHT){
			map.stroke(groundColor);
			map.line(pmouseX, pmouseY,mouseX, mouseY);
		}
		drawMapBorder();
	}
	if(foodEditor_B.checked()){
		foodMap.strokeWeight(brushSize);
		if(mouseButton === LEFT){
			foodMap.stroke(FoodColor);
			foodMap.blendMode(BLEND);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
			
		}else if(mouseButton === RIGHT){
			foodMap.stroke(0);
			foodMap.blendMode(REMOVE);
			foodMap.line(pmouseX, pmouseY,mouseX, mouseY);
		}
	}

	if(pheromoneEditor_B.checked()){
		let x = round((mouseX-maps_scale/2)/maps_scale);
		let y = round((mouseY-maps_scale/2)/maps_scale);
		if(mouseButton === LEFT){
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					home_pheromone_map[(y+j)*map_low_res[0]+(x+i)] += 255;
				}
			}			
		}else if(mouseButton === RIGHT){
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					food_pheromone_map[(y+j)*map_low_res[0]+(x+i)] += 255;
				}
			}
		}else if(mouseButton === CENTER){
			for (let i = -2; i <= 2; i++) {
				for (let j = -2; j <= 2; j++) {
					food_pheromone_map[(y+j)*map_low_res[0]+(x+i)] = 0;
					home_pheromone_map[(y+j)*map_low_res[0]+(x+i)] = 0;
				}
			}
		}
	}
}