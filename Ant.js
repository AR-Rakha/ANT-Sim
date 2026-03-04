class Ant{
  constructor(x,y,angle=0,groundColor,wallColor,FoodColor){
    this.colonyPos=createVector(x,y);
    this.pos=createVector(x,y);
    this.vel=createVector(cos(angle),sin(angle));
    this.acc=createVector(0,0);

    this.angle=angle;

    this.desiredDir=createVector(cos(angle),sin(angle));
    this.desiredWallReflectionDir=createVector(0,0);
    
    this.desiredVel=createVector(0,0);
    this.desiredTurningForce=createVector(0,0);
    
    this.maxSpeed=2;
    this.turningStrength=1.2;
    this.wanderStrength=0.3;
    this.wallReflectStrength=0.4;

    this.groundC=groundColor;
    this.wallC=wallColor;
    this.FoodC=FoodColor;

    this.directions=[]
    this.checkPoints=16

    for (let i = 0; i < this.checkPoints; i++) {
      this.directions.push(createVector(cos(PI/(this.checkPoints/2)*i), sin(PI/(this.checkPoints/2)*i)))
      
    }
  }

  setPos(x,y){
    this.pos.set(x,y);
  }

  show(scale){
    noStroke();
    fill(0)
    translate(this.pos.x,this.pos.y)
    rotate(this.angle);
    ellipse(0, 0, 4*scale,1*scale);
    ellipse(0+3*scale,0, 2.5*scale,2*scale);
    ellipse(0-4*scale,0, 4*scale,2*scale);
    rotate(-this.angle);
    translate(-this.pos.x,-this.pos.y)
    
  }
  loadWall(map){
    map.loadPixels();
  }

  wallCollision(map,sensorOffset=3){

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
        this.pos.add(normal.mult(this.maxSpeed));
        this.desiredWallReflectionDir.add(normal);
      }

      if (r === this.groundC[0] &&
          g === this.groundC[1] &&
          b === this.groundC[2]) {
        //print("Ground");
      }
    }

  }

  move(){

    this.desiredDir = this.vel.copy().normalize();

    let randomUnitVector= p5.Vector.random2D();
    randomUnitVector.mult(this.wanderStrength)
    this.desiredDir.add(randomUnitVector)

    this.desiredWallReflectionDir.mult(this.wallReflectStrength)
    this.desiredDir.add(this.desiredWallReflectionDir)
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