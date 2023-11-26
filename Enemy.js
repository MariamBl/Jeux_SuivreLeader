class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(2);
    this.acc = createVector();
    this.hp = 30; // Hit points
    this.color = color(random(255), random(255), random(255),this.hp *5);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -1;
    }
    if (this.pos.y < 0 || this.pos.y > height) {
      this.vel.y = -1;
    }

  }

  applyForce(force) {
    this.acc.add(force);
  }

  show() {
    fill(this.color); // Color depends on HP
    noStroke();
    ellipse(this.pos.x, this.pos.y, 20, 20);
  }

  isDead() {
    return this.hp <= 0;
  }

  
}