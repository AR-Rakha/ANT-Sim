class Ant{
  constructor(startPos,angle = 0){
    this.colonyPos = createVector(startPos[0],startPos[1]);
    this.colonySize = 20;

    this.pos = createVector(startPos[0],startPos[1]);
    this.vel = createVector(cos(angle),sin(angle));
    this.acc = createVector(0,0);

    this.angle = angle;

    this.desiredDir = createVector(cos(angle),sin(angle));
    this.desiredWallReflectionDir = createVector(0,0);
    this.desiredFoodDir = createVector(0,0);
    this.desiredPheromoneDir = createVector(0,0);
    
    this.desiredVel = createVector(0,0);
    this.desiredTurningForce = createVector(0,0);
    
    this.maxSpeed = 3;
    this.turningStrength = 1;
    this.wanderStrength = 1;
    this.wallReflectStrength = 1;
    this.foodFollowStrength = 1;
    this.pheromoneFollowStrength = 1;


    this.wallC = wallColor;

    this.color1 = [];
    this.color2 = [];

    this.directions = [];
    this.checkPoints = 16;

    for (let i = 0; i < this.checkPoints; i++) {
      this.directions.push(createVector(cos(PI/(this.checkPoints/2)*i), sin(PI/(this.checkPoints/2)*i)));
    }

    this.hasFood = false;

    this.foodSensorDirections = [];
    this.foodCheckPoints = 5;
    this.foodSensorLayers = 3;
    this.foodSensorAngle = 0.6;
    
    this.pheromoneSensorDirections = [];
    this.pheromoneSensorValues = [];
    this.pheromoneCheckPoints = 3;
    this.pheromoneSensorAngle = 0.6;
    this.pheromoneAddInterval = 1;
    this.pheromoneIntensity = 150;

    this.walkTime = 0;
    this.walkTimePheromoneDecay = 0.001;
  }

  setPos(x,y){
    this.pos.set(x,y);
  }

  setColonySize(size = 20){
    this.colonySize = size;
  }

  setSpeed(maxSpeed = 3){
    this.maxSpeed = maxSpeed;
  }

  setColor(color = [0,0,0],hasFoodColor = [150,0,0]){
    this.color1 = color;
    this.color2 = hasFoodColor;
  }

  setEnvColor(wallColor){
    this.wallColor = wallColor;
  }

  setStrengths(turningStrength = 0.8,wanderStrength = 0.5,wallReflectStrength = 0.2,foodFollowStrength = 1,pheromoneFollowStrength = 0.65){
    this.turningStrength = turningStrength;
    this.wanderStrength = wanderStrength;
    this.wallReflectStrength = wallReflectStrength;
    this.foodFollowStrength = foodFollowStrength;
    this.pheromoneFollowStrength = pheromoneFollowStrength;
  }

  setSensorAngle(foodSensorAngle=0.6,pheromoneSensorAngle=0.6){
    this.foodSensorAngle = foodSensorAngle;
    this.pheromoneSensorAngle = pheromoneSensorAngle;
  }

  setPheromoneSettings(pheromoneAddInterval=1,pheromoneIntensity=100){
    this.pheromoneAddInterval = pheromoneAddInterval;
    this.pheromoneIntensity = pheromoneIntensity;
  }

  setWalkTimePheromoneDecay(walkTimePheromoneDecay=0.001){
    this.walkTimePheromoneDecay = walkTimePheromoneDecay;
  }

  show(scale){
    noStroke();
    if(!this.hasFood){
      fill(this.color1[0],this.color1[1],this.color1[2]);
    }else{
      fill(this.color2[0],this.color2[1],this.color2[2]);
    }
    translate(this.pos.x,this.pos.y);
    rotate(this.angle);
    ellipse(0, 0, 4*scale,1*scale);
    ellipse(0+3*scale,0, 2.5*scale,2*scale);
    ellipse(0-4*scale,0, 4*scale,2*scale);
    rotate(-this.angle);
    translate(-this.pos.x,-this.pos.y);    
  }

  wallCollision(map,sensorOffset=4){
    
    for (let dir of this.directions) {
      let x = round(this.pos.x + dir.x * sensorOffset);
      let y = round(this.pos.y + dir.y * sensorOffset); 

      // Make sure we are inside canvas
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (this.pos.x < 0 || this.pos.x >= width || this.pos.y < 0 || this.pos.y >= height) this.pos=this.colonyPos.copy();

      let index = 4 * (y * width + x);

      let r = map.pixels[index + 0];
      let g = map.pixels[index + 1];
      let b = map.pixels[index + 2];

      // Compare manually
      if (r === this.wallC[0] &&
          g === this.wallC[1] &&
          b === this.wallC[2]) {
        let normal = dir.copy().mult(-1.1).normalize();
        this.pos.add(normal.mult(this.maxSpeed));
      }
    }
  }

  wallReflection(map,sensorOffset=8){

    this.desiredWallReflectionDir.set(0,0)
    
    for (let dir of this.directions) {
      let x = round(this.pos.x + dir.x * sensorOffset);
      let y = round(this.pos.y + dir.y * sensorOffset);

      let index = 4 * (y * width + x);

      let r = map.pixels[index + 0];
      let g = map.pixels[index + 1];
      let b = map.pixels[index + 2];

      // Compare manually
      if (r === this.wallC[0] &&
          g === this.wallC[1] &&
          b === this.wallC[2]) {
        let normal = dir.copy().mult(-1).normalize();
        this.desiredWallReflectionDir.add(normal);
      }
    }
  }

  foodDetection(foodMap,sensorOffset=5){
    this.desiredFoodDir.set(0,0);
    if(!this.hasFood){
      this.foodSensorDirections=[];

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
          let d = dir.mag();
          let normal = dir.copy().normalize().mult(1 / (d * d));
          this.desiredFoodDir.add(normal);
        }
      }
    }
  }

  collectFood(foodMap,mouthOffset=2,rip=false){
    if(!this.hasFood){
      let x = round(this.pos.x + cos(this.angle) * mouthOffset);
      let y = round(this.pos.y + sin(this.angle) * mouthOffset);
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      let index = 4 * (y * width + x);

      let a = foodMap.pixels[index + 3];
      // Compare manually
      if (a === 255) {
        foodMap.noStroke();
        foodMap.blendMode(REMOVE);
        foodMap.ellipse(x,y,10);
        foodMap.blendMode(BLEND);
        this.hasFood = true;
        this.walkTime = 0;
        this.angle += PI;
        this.vel = createVector(cos(this.angle),sin(this.angle));

      }
    }
  }

  storeFood(){
    if(p5.Vector.dist(this.pos,this.colonyPos)<=this.colonySize&&this.hasFood ){
      this.hasFood = false;
      this.walkTime = 0;
      this.angle += PI;
      this.vel = createVector(cos(this.angle),sin(this.angle));
      this.pos.set(this.colonyPos);
    }
  }

  addPheromone(homePheromoneMap,foodPheromoneMap,map_resolution,maps_scale){
    let x = round((this.pos.x-maps_scale/2)/maps_scale);
    let y = round((this.pos.y-maps_scale/2)/maps_scale);
    let index = (y * map_resolution[0] + x);
    let p = this.pheromoneIntensity - min(this.pheromoneIntensity * this.walkTime * this.walkTimePheromoneDecay , this.pheromoneIntensity);

    if(!this.hasFood && frameCount%this.pheromoneAddInterval==0){
      homePheromoneMap[index] += p; 
    }else if(this.hasFood && frameCount%this.pheromoneAddInterval==0){
      foodPheromoneMap[index] += p;
    }
  }

  detectPheromone(homePheromoneMap,foodPheromoneMap,map_resolution,maps_scale,sensorOffset=15){
    this.desiredPheromoneDir.set(0,0);

    this.pheromoneSensorDirections=[];
    for (let i = -1; i <= 1; i+=1/(this.pheromoneCheckPoints-1)*2) {
      this.pheromoneSensorDirections.push(createVector(cos(i*this.pheromoneSensorAngle+this.angle), sin(i*this.pheromoneSensorAngle+this.angle)));
      this.pheromoneSensorValues.push(0);
    }
    let v=0;
    for (let dir of this.pheromoneSensorDirections) {
      let x = round(((this.pos.x + dir.x * sensorOffset)-maps_scale/2)/maps_scale);
      let y = round(((this.pos.y + dir.y * sensorOffset)-maps_scale/2)/maps_scale);

      if (x < 0 || x >= map_resolution[0] || y < 0 || y >= map_resolution[1]) continue;
      let index = (y * map_resolution[0] + x);

      let r = homePheromoneMap[index];
      let b = foodPheromoneMap[index];
      
      // Compare manually
      if (this.hasFood) {
        this.pheromoneSensorValues[v] = r;
      }else {
        this.pheromoneSensorValues[v] = b;
      }

      v++;
    }

    let left = this.pheromoneSensorValues[0];
    let mid = this.pheromoneSensorValues[1];
    let right = this.pheromoneSensorValues[2];

    if(mid>=Math.max(right,left))
    {
      this.desiredPheromoneDir.add(this.pheromoneSensorDirections[1].copy().normalize());
    }
    else if(left>right)
    {
      this.desiredPheromoneDir.add(this.pheromoneSensorDirections[0].copy().normalize());
    }
    else if(left<right)
    {
      this.desiredPheromoneDir.add(this.pheromoneSensorDirections[2].copy().normalize());
    }
    this.pheromoneSensorValues = [];
  }

  move(){

    this.desiredDir = this.vel.copy().normalize();

    let randomUnitVector = p5.Vector.random2D();
    randomUnitVector.mult(this.wanderStrength);
    this.desiredDir.add(randomUnitVector);

    this.desiredWallReflectionDir.mult(this.wallReflectStrength);
    this.desiredDir.add(this.desiredWallReflectionDir);

    if (!p5.Vector.equals(this.desiredFoodDir, createVector(0, 0))){
      this.desiredFoodDir.mult(this.foodFollowStrength);
      this.desiredDir.add(this.desiredFoodDir);
    }

    this.desiredPheromoneDir.mult(this.pheromoneFollowStrength);
    this.desiredDir.add(this.desiredPheromoneDir);

    this.desiredDir.normalize();

    this.desiredVel = this.desiredDir.copy();
    this.desiredVel.mult(this.maxSpeed);
    
    this.desiredTurningForce = p5.Vector.sub(this.desiredVel, this.vel);
    this.desiredTurningForce.mult(this.turningStrength);
    this.acc = this.desiredTurningForce.copy();
    this.acc.limit(this.turningStrength);
        
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    this.angle = atan2(this.vel.y,this.vel.x);

  }
  update(map,foodMap,homePheromoneMap,foodPheromoneMap,mapLowRes,mapsScale){

    this.collectFood(foodMap);
    this.storeFood();

    this.wallCollision(map,5,homePheromoneMap,foodPheromoneMap,mapLowRes,mapsScale);
    this.wallReflection(map,15);
    this.foodDetection(foodMap,15);
    this.detectPheromone(homePheromoneMap,foodPheromoneMap,mapLowRes,mapsScale,35);


    this.move();
    
    this.walkTime += 1;
  }

  reset(startAngle = 0){
    this.angle = startAngle;
    this.vel = createVector(cos(this.angle),sin(this.angle));
    this.setPos(this.colonyPos.x,this.colonyPos.y);
  }
}