class Ant{
  constructor(x,y,angle=0){
    this.pos=createVector(x,y);
    this.vel=createVector(cos(angle),sin(angle));
    this.acc=createVector(0,0);

    this.angle=angle;

    this.desiredDir=createVector(0,0);
    this.desiredVel=createVector(0,0);
    this.desiredTurningForce=createVector(0,0);
    
    this.maxSpeed=1;
    this.turningStrength=1;
    this.wanderStrength=0.1;
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

  move(){
    let randomUnitVector= p5.Vector.random2D();
    randomUnitVector.mult(this.wanderStrength)
    this.desiredDir.add(randomUnitVector)
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