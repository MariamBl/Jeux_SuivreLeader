class Vehicle {
    static debug = false;
    constructor(x, y) {
      // Position, vitesse et accélération du véhicule
      this.pos = createVector(x, y);
      this.vel = createVector(0, 0);
      this.acc = createVector(0, 0);
      
      // Limites de vitesse et de force
      this.maxSpeed = 4;
      this.maxForce = 0.4;
      
      // Rayon du véhicule pour le dessin
      this.r_pourDessin = 8;
      
      // Rayon du véhicule pour l'évitement d'obstacles
      this.r = this.r_pourDessin * 3;
  
      // Paramètres pour l'évitement d'obstacles
      this.largeurZoneEvitementDevantVaisseau = 40;
      this.rayonZoneDeFreinage = 200;
      this.perceptionRadius = 100;
    }
  
    // Méthode pour éviter un autre véhicule
    evade(vehicle) {
      let pursuit = this.pursue(vehicle);
      pursuit.mult(-1);
      return pursuit;
    }
  
    // Méthode pour poursuivre un autre véhicule
    pursue(vehicle) {
      let target = vehicle.pos.copy();
      let prediction = vehicle.vel.copy();
      prediction.mult(10);
      target.add(prediction);
      fill(0, 255, 0);
      circle(target.x, target.y, 16);
      return this.seek(target);
    }
  
    // Méthode pour la séparation des véhicules
    separation(boids) {
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (other != this && d < this.perceptionRadius) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.div(d * d);
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }
  
    // Méthode pour arriver à une cible
    arrive(target) {
      // 2nd argument true enables the arrival behavior
      return this.seek(target, true);
    }
  
    // Méthode pour fuir une cible
    flee(target) {
      return this.seek(target).mult(-1);
    }
  
    // Méthode pour se diriger vers une cible
    seek(target, arrival = false) {
      let force = p5.Vector.sub(target, this.pos);
      let desiredSpeed = this.maxSpeed;
      
      if (arrival) {
        // On définit un rayon de 100 pixels autour de la cible
        // si la distance entre le véhicule courant et la cible
        // est inférieure à ce rayon, on ralentit le véhicule
        // desiredSpeed devient inversement proportionnelle à la distance
        // si la distance est petite, force = grande
        // Vous pourrez utiliser la fonction P5 
        // distance = map(valeur, valeurMin, valeurMax, nouvelleValeurMin, nouvelleValeurMax)
        // qui prend une valeur entre valeurMin et valeurMax et la transforme en une valeur
        // entre nouvelleValeurMin et nouvelleValeurMax
  
        // TODO !
        
        let rayon = this.rayonZoneDeFreinage;
        // 0 - ceci est un test, on essaye de faire varier la taille
        // de la zone de freinage en fonction de la vitesse
        //rayon = rayon * this.vel.mag() * 0.25;
        //rayon = max(50, rayon);
  
        // 1 - dessiner le cercle de rayon 100 autour du véhicule
        if(Vehicle.debug)
        {
          noFill();
          stroke(random(255),random(255),random(255))
          circle(this.pos.x, this.pos.y, rayon);
        }
       
  
        // 2 - calcul de la distance entre la cible et le véhicule
        let distance = p5.Vector.dist(this.pos, target);
  
        // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
        // qui devient inversement proportionnelle à la distance.
        // si d = rayon alors desiredSpeed = maxSpeed
        // si d = 0 alors desiredSpeed = 0
  
        if(distance < rayon) {
          desiredSpeed = map(distance, 0, rayon, 0, this.maxSpeed);
        }
      }
  
      force.setMag(desiredSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    }
  
    // Méthode pour appliquer une force au véhicule
    applyForce(force) {
      this.acc.add(force);
    }
  
    // Méthode pour mettre à jour la position, la vitesse et l'accélération du véhicule
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
    }
  
    // Méthode pour afficher le véhicule
    show() {
      stroke(255);
      strokeWeight(2);
      fill(255);
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
      pop();
    }
  
    // Méthode pour gérer les bords de l'écran
    edges() {
      if (this.pos.x > width + this.r) {
        this.pos.x = -this.r;
      } else if (this.pos.x < -this.r) {
        this.pos.x = width + this.r;
      }
      if (this.pos.y > height + this.r) {
        this.pos.y = -this.r;
      } else if (this.pos.y < -this.r) {
        this.pos.y = height + this.r;
      }
    }
  
    // Méthode pour éviter un autre véhicule
    avoid(vehicule) {
      // calcul d'un vecteur ahead devant le véhicule
      // il regarde par exemple 50 frames devant lui
      let ahead = vehicule.vel.copy();
      ahead.normalize();
      ahead.mult(50);
  
      if(Vehicle.debug){
        // on le dessine
        this.drawVector(vehicule.pos, ahead, "blue");
      }
      
  
      // On calcule la distance entre le cercle et le bout du vecteur ahead
      let pointAuBoutDeAhead = p5.Vector.add(vehicule.pos, ahead);
      if(Vehicle.debug){
        // On dessine ce point pour debugger
        fill("red");
        noStroke();
        circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
     
        // On dessine la zone d'évitement
        // On trace une ligne large qui va de la position du vaisseau
        // jusqu'au point au bout de ahead
        stroke(color(255, 200, 0, 30)); // gros, semi transparent
        strokeWeight(20);
        line(vehicule.pos.x, vehicule.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
      }
      
      let distance = pointAuBoutDeAhead.dist(vehicule.pos);
  
      // si la distance est < rayon de l'obstacle
      if (distance < vehicule.r + this.largeurZoneEvitementDevantVaisseau + this.r ) {
        // calcul de la force d'évitement. C'est un vecteur qui va
        // du centre de l'obstacle vers le point au bout du vecteur ahead
        let force = p5.Vector.sub(pointAuBoutDeAhead, vehicule.pos);
        // on le dessine pour vérifier qu'il est ok (dans le bon sens etc)
        if(Vehicle.debug){
          this.drawVector(vehicule.pos, force, "red");
        }
        // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
        // on limite ce vecteur à la longueur maxSpeed
        force.setMag(this.maxSpeed);
        // on calcule la force à appliquer pour atteindre la cible
        force.sub(this.vel);
        // on limite cette force à la longueur maxForce
        force.limit(this.maxForce);
        return force;
      } else {
        // pas de collision possible
        return createVector(0, 0);
      }
    }
  
    // Méthode pour dessiner un vecteur
    drawVector(pos, v, color) {
      push();
      // Dessin du vecteur vitesse
      // Il part du centre du véhicule et va dans la direction du vecteur vitesse
      strokeWeight(3);
      stroke(color);
      line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
      // dessine une petite fleche au bout du vecteur vitesse
      let arrowSize = 5;
      translate(pos.x + v.x, pos.y + v.y);
      rotate(v.heading());
      translate(-arrowSize / 2, 0);
      triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
      pop();
    }
  
}
  
class Target extends Vehicle {
    constructor(x, y) {
      super(x, y);
      this.vel = p5.Vector.random2D();
      this.vel.mult(5);
    }
  
    // Méthode pour afficher la cible
    show() {
      stroke(255);
      strokeWeight(2);
      fill("#F063A4");
      push();
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
      pop();
    }

    // Méthode pour rester avec le leader
    stayWithLeader(leader) {
        // Calculate the desired position behind the leader
        let desired = p5.Vector.sub(leader.pos, this.pos);
        desired.setMag(this.maxSpeed*25);
        let behindLeader = p5.Vector.add(leader.pos, p5.Vector.mult(desired, -10)); // Adjust the distance
      
        // Calculate the force to reach the desired position
        let force = p5.Vector.sub(behindLeader, this.pos);
        force.limit(this.maxForce);
        return force;
      }
      
    // Méthode pour éviter le leader
    avoidLeader(leader, avoidanceRadius) {
        let distance = p5.Vector.dist(this.pos, leader.pos);
        if (distance < avoidanceRadius) {
          let desired = p5.Vector.sub(this.pos, leader.pos);
          desired.setMag(this.maxSpeed);
          let steer = p5.Vector.sub(desired, this.vel);
          steer.limit(this.maxForce);
          return steer;
        } else {
          return createVector(0, 0);
        }
    }
  
    // Méthode pour se séparer des autres véhicules
    separateFromOthers(vehicles, separationRadius) {
        let sum = createVector();
        let count = 0;
        for (let other of vehicles) {
          if (other !== this) {
            let distance = p5.Vector.dist(this.pos, other.pos);
            if (distance < separationRadius) {
              let diff = p5.Vector.sub(this.pos, other.pos);
              diff.normalize();
              diff.div(distance);
              sum.add(diff);
              count++;
            }
          }
        }
        if (count > 0) {
          sum.div(count);
          sum.setMag(this.maxSpeed);
          let steer = p5.Vector.sub(sum, this.vel);
          steer.limit(this.maxForce);
          return steer;
        } else {
          return createVector(0, 0);
        }
    }
}
