class ExplorerAnt extends Ant{
  constructor(startPos,angle = 0) {
    super(startPos,angle);

    this.pheromoneFoodFollowStrength = 1;
  }

  setStrengths(turningStrength = 0.8,wanderStrength = 0.5,wallReflectStrength = 0.3,foodFollowStrength = 1,pheromoneFollowStrength = 0.65,pheromoneFoodFollowStrength = 0.35){
    this.turningStrength = turningStrength;
    this.wanderStrength = wanderStrength;
    this.wallReflectStrength = wallReflectStrength;
    this.foodFollowStrength = foodFollowStrength;
    this.pheromoneFollowStrength = pheromoneFollowStrength;
    this.pheromoneFoodFollowStrength = pheromoneFoodFollowStrength;
  }

  move(){
    this.desiredDir = this.vel.copy().normalize();
    
    let randomUnitVector = p5.Vector.random2D();
    randomUnitVector.mult(this.wanderStrength);
    this.desiredDir.add(randomUnitVector);

    this.desiredWallReflectionDir.mult(this.wallReflectStrength);
    this.desiredDir.add(this.desiredWallReflectionDir);

    this.desiredFoodDir.mult(this.foodFollowStrength);
    this.desiredDir.add(this.desiredFoodDir);
    if(this.hasFood){
      this.desiredPheromoneDir.mult(this.pheromoneFollowStrength);
    }else{
      this.desiredPheromoneDir.mult(this.pheromoneFoodFollowStrength);
    }
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
}