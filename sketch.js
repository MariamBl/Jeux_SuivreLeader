let vehicles = [];
let enemies = [];
let shooting = false;
let bullets = [];
let useBehavior1 = true;
let target; // Declare target at a higher scope

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create 10 vehicles with random positions
  for (let i = 0; i < 10; i++) {
    let v = new Vehicle(random(width), random(height));
    v.maxSpeed = 5;
    v.maxForce = 2;
    vehicles.push(v);
  }
}

function drawStars(numStars) {
  fill(255); // Set the fill color to white
  noStroke(); // No outline for stars

  for (let i = 0; i < numStars; i++) {
    let x = random(width);
    let y = random(height);
    ellipse(x, y, 2, 2); // Draw small ellipses as stars
  }
}

function draw() {
  background(0);

  // Draw stars
  drawStars(100);

  if (useBehavior1) {
    // Behavior 1
    if (frameCount % 30 === 0) {
      for (let v of vehicles) {
        for (let enemy of enemies) {
          let bullet = new Bullet(v.pos.x, v.pos.y, enemy.pos);
          bullets.push(bullet);
        }
      }
    }

    if (shooting) {
      let enemy = new Enemy(mouseX, mouseY);
      enemies.push(enemy);
      shooting = false; // Stop spawning enemies
    }

    // Update and draw the enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      enemy.update();
      enemy.show();

      // Check if a bullet hits the enemy
      for (let j = bullets.length - 1; j >= 0; j--) {
        let bullet = bullets[j];
        let d = dist(bullet.pos.x, bullet.pos.y, enemy.pos.x, enemy.pos.y);
        if (d < 10) {
          bullets.splice(j, 1); // Remove the bullet
          enemy.hp -= 10; // Decrease enemy HP
        }
      }
      // Remove dead enemies
      if (enemy.isDead()) {
        enemies.splice(i, 1);
      }
    }

    // Update and draw the bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      let bullet = bullets[i];
      bullet.update();
      bullet.show();

      // Check if the bullet is out of bounds
      if (
        bullet.pos.x < 0 ||
        bullet.pos.x > width ||
        bullet.pos.y < 0 ||
        bullet.pos.y > height
      ) {
        bullets.splice(i, 1);
      }
    }
    target = createVector(mouseX, mouseY);
    fill(82, 221, 137);
    noStroke();
    ellipse(target.x, target.y, 32);

    for (let i = 0; i < vehicles.length; i++) {
      let v = vehicles[0].vel.copy();
      v.normalize();
      v.mult(-100);
      v.add(vehicles[0].pos);
      fill(0, 255, 0);
      circle(v.x, v.y, 15);

      if (i === 0) {
        let steering = vehicles[i].arrive(target);
        vehicles[i].applyForce(steering);
      } else {
        let avoidForce = vehicles[i].avoid(vehicles[0]);
        avoidForce.mult(0.3);
        vehicles[i].applyForce(avoidForce);

        let separation = vehicles[i].separation(vehicles);
        separation.mult(0.2);
        vehicles[i].applyForce(separation);

        let steering = vehicles[i].arrive(v);
        steering.mult(0.6);
        vehicles[i].applyForce(steering);
      }

      vehicles[i].update();
      vehicles[i].show();
      
    }
  } else {
    // Behavior 2
    target = createVector(mouseX, mouseY);
    fill(82, 221, 137);
    noStroke();
    ellipse(target.x, target.y, 32);

    for (let i = 0; i < vehicles.length; i++) {
      let followIndex = i > 0 ? i - 1 : vehicles.length - 1;

      if (i === 0) {
        let steering = vehicles[i].arrive(target);
        vehicles[i].applyForce(steering);
      } else {
        let separation = vehicles[i].separation(vehicles);
        separation.mult(0.2);
        vehicles[i].applyForce(separation);

        let steering = vehicles[i].arrive(vehicles[followIndex].pos);
        vehicles[i].applyForce(steering);
      }

      vehicles[i].update();
      vehicles[i].show();
      if (frameCount % 30 === 0) {
        for (let v of vehicles) {
          for (let enemy of enemies) {
            let bullet = new Bullet(v.pos.x, v.pos.y, enemy.pos);
            bullets.push(bullet);
          }
        }
      }
  
      
  
      // Update and draw the enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.update();
        enemy.show();
  
        // Check if a bullet hits the enemy
        for (let j = bullets.length - 1; j >= 0; j--) {
          let bullet = bullets[j];
          let d = dist(bullet.pos.x, bullet.pos.y, enemy.pos.x, enemy.pos.y);
          if (d < 10) {
            bullets.splice(j, 1); // Remove the bullet
            enemy.hp -= 10; // Decrease enemy HP
          }
        }
        // Remove dead enemies
        if (enemy.isDead()) {
          enemies.splice(i, 1);
        }
      }
  
      // Update and draw the bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.update();
        bullet.show();
  
        // Check if the bullet is out of bounds
        if (
          bullet.pos.x < 0 ||
          bullet.pos.x > width ||
          bullet.pos.y < 0 ||
          bullet.pos.y > height
        ) {
          bullets.splice(i, 1);
        }
      }
    }
  }
}

function keyPressed() {
  if (key === 'l') {
    // Toggle between behavior 1 and behavior 2
    useBehavior1 = !useBehavior1;
  }
}

// Check if the mouse is clicked
function mousePressed() {
  shooting = true; // Start spawning enemies
  for (let v of vehicles) {
    let enemy = new Enemy(mouseX, mouseY);
    enemies.push(enemy);
    for (let enemy of enemies) {
      let bullet = new Bullet(v.pos.x, v.pos.y, enemy.pos);
      bullets.push(bullet);
    }
  }
}