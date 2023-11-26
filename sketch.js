// Déclaration des variables
let vehicles = [];
let enemies = [];
let shooting = false;
let bullets = [];
let useBehavior1 = true;
let target; // Déclaration de la cible à une portée supérieure

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Création de 10 véhicules avec des positions aléatoires
  for (let i = 0; i < 10; i++) {
    let v = new Vehicle(random(width), random(height));
    v.maxSpeed = 5;
    v.maxForce = 2;
    vehicles.push(v);
  }
}

function drawStars(numStars) {
  fill(255); // Définir la couleur de remplissage en blanc
  noStroke(); // Pas de contour pour les étoiles

  for (let i = 0; i < numStars; i++) {
    let x = random(width);
    let y = random(height);
    ellipse(x, y, 2, 2); // Dessiner de petits ellipses comme étoiles
  }
}

function draw() {
  background(0);

  // Dessiner les étoiles
  drawStars(100);

  if (useBehavior1) {
    // Comportement 1
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
      shooting = false; // Arrêter de générer des ennemis
    }

    // Mettre à jour et dessiner les ennemis
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      enemy.update();
      enemy.show();

      // Vérifier si une balle touche l'ennemi
      for (let j = bullets.length - 1; j >= 0; j--) {
        let bullet = bullets[j];
        let d = dist(bullet.pos.x, bullet.pos.y, enemy.pos.x, enemy.pos.y);
        if (d < 10) {
          bullets.splice(j, 1); // Supprimer la balle
          enemy.hp -= 10; // Diminuer les points de vie de l'ennemi
        }
      }
      // Supprimer les ennemis morts
      if (enemy.isDead()) {
        enemies.splice(i, 1);
      }
    }

    // Mettre à jour et dessiner les balles
    for (let i = bullets.length - 1; i >= 0; i--) {
      let bullet = bullets[i];
      bullet.update();
      bullet.show();

      // Vérifier si la balle est hors des limites
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
    // Comportement 2
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
  
      
  
      // Mettre à jour et dessiner les ennemis
      for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.update();
        enemy.show();
  
        // Vérifier si une balle touche l'ennemi
        for (let j = bullets.length - 1; j >= 0; j--) {
          let bullet = bullets[j];
          let d = dist(bullet.pos.x, bullet.pos.y, enemy.pos.x, enemy.pos.y);
          if (d < 10) {
            bullets.splice(j, 1); // Supprimer la balle
            enemy.hp -= 10; // Diminuer les points de vie de l'ennemi
          }
        }
        // Supprimer les ennemis morts
        if (enemy.isDead()) {
          enemies.splice(i, 1);
        }
      }
  
      // Mettre à jour et dessiner les balles
      for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.update();
        bullet.show();
  
        // Vérifier si la balle est hors des limites
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
    // Basculer entre le comportement 1 et le comportement 2
    useBehavior1 = !useBehavior1;
  }
}

// Vérifier si la souris est cliquée
function mousePressed() {
  shooting = true; // Commencer à générer des ennemis
  for (let v of vehicles) {
    let enemy = new Enemy(mouseX, mouseY);
    enemies.push(enemy);
    for (let enemy of enemies) {
      let bullet = new Bullet(v.pos.x, v.pos.y, enemy.pos);
      bullets.push(bullet);
    }
  }
}