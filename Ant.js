class Ant{
  constructor(x,y,angle=0,groundColor,wallColor,FoodColor){
    this.colonyPos=createVector(x,y);
    this.colonySize=20

    this.pos=createVector(x,y);
    this.vel=createVector(cos(angle),sin(angle));
    this.acc=createVector(0,0);

    this.angle=angle;

    this.desiredDir=createVector(cos(angle),sin(angle));
    this.desiredWallReflectionDir=createVector(0,0);
    this.desiredFoodDir=createVector(0,0);
    this.desiredPheromoneDir=createVector(0,0);
    
    this.desiredVel=createVector(0,0);
    this.desiredTurningForce=createVector(0,0);
    
    this.maxSpeed=2;
    this.turningStrength=0.5;
    this.wanderStrength=1;
    this.wallReflectStrength=0.5;
    this.foodFollowStrength=0.1;
    this.pheromoneFollowStrength=0.8

    this.groundC=groundColor;
    this.wallC=wallColor;
    this.FoodC=FoodColor;

    this.directions=[];
    this.checkPoints=16;

    for (let i = 0; i < this.checkPoints; i++) {
      this.directions.push(createVector(cos(PI/(this.checkPoints/2)*i), sin(PI/(this.checkPoints/2)*i)));
    }

    this.hasFood=false;

    this.foodSensorDirections=[];
    this.foodCheckPoints=7;
    this.foodSensorLayers=3;
    this.foodSensorAngle=1;
    
    this.pheromoneSensorDirections=[];
    this.pheromoneSensorValues=[];
    this.pheromoneCheckPoints=3;
    this.pheromoneSensorAngle=1.3;
    this.pheromoneAddInterval=2;
    this.pheromoneIntensity=5;
  }

  setPos(x,y){
    this.pos.set(x,y);
  }

  show(scale){
    noStroke();
    if(!this.hasFood){
      fill(0);
    }else{
      fill(200,200,0);
    }
    translate(this.pos.x,this.pos.y);
    rotate(this.angle);
    ellipse(0, 0, 4*scale,1*scale);
    ellipse(0+3*scale,0, 2.5*scale,2*scale);
    ellipse(0-4*scale,0, 4*scale,2*scale);
    rotate(-this.angle);
    translate(-this.pos.x,-this.pos.y);


    
  }

  wallCollision(map,sensorOffset=3){
    
    for (let dir of this.directions) {
      let x = round(this.pos.x + dir.x * sensorOffset);
      let y = round(this.pos.y + dir.y * sensorOffset);

      // Make sure we are inside canvas
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (this.pos.x < 0 || this.pos.x >= width || this.pos.y < 0 || this.pos.y >= height) this.pos=this.colonyPos.copy();

      let index;

      
      index = 4 * (y * width + x);

      let r = map.pixels[index + 0];
      let g = map.pixels[index + 1];
      let b = map.pixels[index + 2];

      // Compare manually
      if (r === this.wallC[0] &&
          g === this.wallC[1] &&
          b === this.wallC[2]) {
        //print("Wall");
        let normal = dir.copy().mult(-1).normalize();
        this.pos.add(normal.mult(this.maxSpeed));
      }
    }
  }

  wallReflection(map,sensorOffset=8){

    this.desiredWallReflectionDir.set(0,0)
    
    for (let dir of this.directions) {
      let x = round(this.pos.x + dir.x * sensorOffset);
      let y = round(this.pos.y + dir.y * sensorOffset);

      // Make sure we are inside canvas
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (this.pos.x < 0 || this.pos.x >= width || this.pos.y < 0 || this.pos.y >= height) this.pos=this.colonyPos.copy();

      let index;

      
      index = 4 * (y * width + x);

      let r = map.pixels[index + 0];
      let g = map.pixels[index + 1];
      let b = map.pixels[index + 2];

      // Compare manually
      if (r === this.wallC[0] &&
          g === this.wallC[1] &&
          b === this.wallC[2]) {
        //print("Wall");
        let normal = dir.copy().mult(-1).normalize();
        this.desiredWallReflectionDir.add(normal);
      }
    }
  }

  foodDetection(foodMap,sensorOffset=6){
    if(!this.hasFood){
      this.desiredFoodDir.set(0,0)

      this.foodSensorDirections=[]
      for (let i = -1; i <= 1; i+=1/(this.foodCheckPoints-1)*2) {
        for (let j = 1; j <= this.foodSensorLayers; j++) {
          this.foodSensorDirections.push(createVector(cos(i*this.foodSensorAngle+this.angle)*j, sin(i*this.foodSensorAngle+this.angle)*j)); 
        }
      }

      for (let dir of this.foodSensorDirections) {
        let x = round(this.pos.x + dir.x * sensorOffset);
        let y = round(this.pos.y + dir.y * sensorOffset);

        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        let index = 4 * (y * width + x);

        let a = foodMap.pixels[index + 3];
        

        // Compare manually
        if (a === 255) {
          let normal = dir.copy().normalize();
          this.desiredFoodDir.add(normal);
        }
      }
    }
  }

  collectFood(foodMap,mouthOffset=2){
    if(!this.hasFood){
      let x = round(this.pos.x + cos(this.angle) * mouthOffset);
      let y = round(this.pos.y + sin(this.angle) * mouthOffset);
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      let index = 4 * (y * width + x);

      let a = foodMap.pixels[index + 3];
      // Compare manually
      if (a === 255) {
        foodMap.noStroke()
        foodMap.blendMode(REMOVE)
        foodMap.ellipse(x,y,5)
        foodMap.blendMode(BLEND)
        this.hasFood=true;
        this.angle+=PI
        this.vel=createVector(cos(this.angle),sin(this.angle));

      }
    }
  }

  storeFood(){
    if(p5.Vector.dist(this.pos,this.colonyPos)<=this.colonySize&&this.hasFood ){
      this.hasFood=false;
      this.angle+=PI
      this.vel=createVector(cos(this.angle),sin(this.angle));
    }
  }

  addPheromone(pheromoneMap){
    if(!this.hasFood && frame_count%this.pheromoneAddInterval==0){
      pheromoneMap.stroke(this.pheromoneIntensity,0,0);
			pheromoneMap.blendMode(ADD);
			pheromoneMap.strokeWeight(5);
      pheromoneMap.noFill();
			pheromoneMap.ellipse(this.pos.x-canvasSize[0]/2, this.pos.y-canvasSize[1]/2,0.5);
			pheromoneMap.blendMode(BLEND)
    }else if(this.hasFood && frame_count%this.pheromoneAddInterval==0){
      pheromoneMap.stroke(0,0,this.pheromoneIntensity);
			pheromoneMap.blendMode(ADD);
			pheromoneMap.strokeWeight(5);
      pheromoneMap.noFill();
			pheromoneMap.ellipse(this.pos.x-canvasSize[0]/2, this.pos.y-canvasSize[1]/2,0.5);
			pheromoneMap.blendMode(BLEND)
    }
  }

  detectPheromone(pheromoneMap,sensorOffset=3){
    this.desiredPheromoneDir.set(0,0)

    this.pheromoneSensorDirections=[]
    for (let i = -1; i <= 1; i+=1/(this.pheromoneCheckPoints-1)*2) {
      this.pheromoneSensorDirections.push(createVector(cos(i*this.pheromoneSensorAngle+this.angle), sin(i*this.pheromoneSensorAngle+this.angle)));
      this.pheromoneSensorValues.push(0) 
    }
    let v=0
    for (let dir of this.pheromoneSensorDirections) {
      let x = round(this.pos.x + dir.x * sensorOffset);
      let y = round(this.pos.y + dir.y * sensorOffset);

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      let index = 4 * (y * width + x);

      let r = pheromoneMap.pixels[index + 0];
      let b = pheromoneMap.pixels[index + 2];
      
      // Compare manually
      if (this.hasFood) {
        this.pheromoneSensorValues[v]=r
      }else {
        this.pheromoneSensorValues[v]=b
      }

      /*
      if (r > 0 && this.hasFood) {
        let normal = dir.copy().normalize().mult(r/255);
        this.desiredPheromoneDir.add(normal);
      }else if(b > 0 && !this.hasFood) {
        let normal = dir.copy().normalize().mult(b/255);
        this.desiredPheromoneDir.add(normal);
      }*/
      v++
    }
    if(this.pheromoneSensorValues[1]>=Math.max(this.pheromoneSensorValues[0],this.pheromoneSensorValues[2])){
      this.desiredPheromoneDir.add(this.pheromoneSensorDirections[1].copy().normalize());
    }else if(this.pheromoneSensorValues[0]>this.pheromoneSensorValues[2]){
      this.desiredPheromoneDir.add(this.pheromoneSensorDirections[0].copy().normalize());
    }else if(this.pheromoneSensorValues[0]<this.pheromoneSensorValues[2]){
      this.desiredPheromoneDir.add(this.pheromoneSensorDirections[2].copy().normalize());
    }

  }

  move(){

    this.desiredDir = this.vel.copy().normalize();

    let randomUnitVector= p5.Vector.random2D();
    randomUnitVector.mult(this.wanderStrength);
    this.desiredDir.add(randomUnitVector);

    this.desiredWallReflectionDir.mult(this.wallReflectStrength);
    this.desiredDir.add(this.desiredWallReflectionDir);

    this.desiredFoodDir.mult(this.foodFollowStrength);
    this.desiredDir.add(this.desiredFoodDir);

    this.desiredPheromoneDir.mult(this.pheromoneFollowStrength);
    this.desiredDir.add(this.desiredPheromoneDir);

    this.desiredDir.normalize();

    this.desiredVel=this.desiredDir.copy();
    this.desiredVel.mult(this.maxSpeed);
    
    this.desiredTurningForce=p5.Vector.sub(this.desiredVel, this.vel);
    this.desiredTurningForce.mult(this.turningStrength);
    this.acc=this.desiredTurningForce.copy();
    this.acc.limit(this.turningStrength);
        
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    this.angle=atan2(this.vel.y,this.vel.x);

  }
  update(){
    this.move()
  }
}