let canvasSize=[1500, 700];

let total=1;
let ants=[];

function setup() 
{
	createCanvas(canvasSize[0],canvasSize[1]);

	for (let i = 0; i < total; i++) {
		ants.push(new Ant(30,30,random(0,PI)))
	}
}

function draw()
{
	background(220);
	for (let i = 0; i < total; i++) {
		ants[i].update();
		ants[i].show(1);
	}


}
