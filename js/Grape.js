function Missile(x, y) {
    this.pos.x = this.prevPos.x = x;
    this.pos.y = this.prevPos.y = y;
    this.imgMissile = document.getElementById("img-grape-missile");
    this.active = false;
}

Missile.prototype = new RigidBody();

Missile.prototype.draw = function(ctx) {
    if (!this.active) return;
    ctx.save();	
    
    // rotate missile to fit direction of velocity
    var v = this.pos.sub(this.prevPos).unit();
    var angle = Math.atan(v.y/v.x);

    ctx.translate(this.pos.x, this.pos.y);    
    ctx.rotate(angle);
    ctx.drawImage(this.imgMissile, -this.imgMissile.width/2, -this.imgMissile.height/2);

    ctx.restore();
}

Missile.prototype.notifyCollision = function(rb) {
    this.active = false;
}

function Grape (phys) {
    // this.pos = new Vector();
    // this.pos.x = this.prevX = 100;
    // this.pos.y = this.prevY = 4;    
    this.angle = Math.PI / 2.0;
    this.moveDir   = 0;
    this.facing    = 1;
    this.rotateDir = 0;
    
    this.backFootX  =  8;
    this.backFootY  = 21;
    this.frontFootX = -5;
    this.frontFootY = 23;
    this.armRotate  =  0;
    this.isFiring = false;

    this.imgBodyFire = document.getElementById("img-grape-body-fire");
    this.imgBody = document.getElementById("img-grape-body");
    this.imgFoot = document.getElementById("img-grape-foot");
    this.imgArm  = document.getElementById("img-grape-arm");
    
    // time used to compute feet and arm movement
    this.time = 0.0;

    // spring box
    // this.box = new SpringBox(100, 30, this.imgBody.width, this.imgBody.height);
    this.box = new SpringCircle(50, 50,  this.imgBody.height*0.6, 5);
    this.drawBox = true;

    // box center used to compute movement direction
    this.lastCenter = this.box.getCenter();

    // allocate missile
    this.missile = new Missile(0,0);
    phys.addRigidBody(this.missile);

}

// Grape.prototype = new RigidBody();
// Grape.prototype = new Springs();

Grape.prototype.toggleDrawBox = function() {
    this.drawBox = !this.drawBox;
}

Grape.prototype.draw = function(ctx) {
    if (this.missile) this.missile.draw(ctx);    

    ctx.save();	
    // ctx.translate(this.pos.x, this.pos.y);
    var p = this.box.getCenter();
    ctx.translate(p.x, p.y);

    
    var dir = p.sub(this.lastCenter);
    this.lastCenter = p;

    if (Math.abs(dir.x) > 0.01 && dir.length() > 0.01) {
	var angle = Math.atan(dir.y / dir.x);
	ctx.rotate(angle);
    }
    ctx.transform(this.facing, 0, 0, 1, 0, 0);
    
    // draw back foot
    ctx.save();
    ctx.translate(this.backFootX, this.backFootY);
    ctx.drawImage(this.imgFoot, -this.imgFoot.width/2, -this.imgFoot.height/2);
    ctx.restore();
    
    // draw body
    ctx.save();	
    ctx.rotate(this.angle);
    if (this.isFiring) {
	ctx.drawImage(this.imgBodyFire, -this.imgBodyFire.width/2, -this.imgBodyFire.height/2);
    }
    else {
	ctx.drawImage(this.imgBody, -this.imgBody.width/2, -this.imgBody.height/2);
	this.isFiring = false;
    }
    ctx.restore();
    
    // draw front foot
    ctx.save();	
    ctx.translate(this.frontFootX, this.frontFootY);
    ctx.drawImage(this.imgFoot, -this.imgFoot.width/2, -this.imgFoot.height/2);
    ctx.restore();
    
    // draw arm
    ctx.save();
    ctx.translate(-10, 10);
    ctx.translate(0, -10);
    ctx.rotate(this.armRotate);
    ctx.translate(0, 10);
    ctx.drawImage(this.imgArm, -this.imgArm.width/2, -this.imgArm.height/2);
    ctx.restore();

    
    ctx.restore();
    if (this.drawBox)
	this.box.draw(ctx);
}

Grape.prototype.rotate = function(dir) {
    this.rotateDir = dir;
}

Grape.prototype.move = function(dir) {
    this.moveDir = dir;
    if (dir != 0)
	this.facing = dir;
}

Grape.prototype.jump = function() {
    // if (this.box.getVelocity().y == 0) {
	this.jumpTime = 0;
    // }
}

Grape.prototype.fire = function(phys) {
    if (this.missile.active) return;
    var p = this.box.getCenter();
    this.missile.pos.x = p.x;
    this.missile.pos.y = p.y;
    var angle = this.angle + Math.PI / 2.0;
    var dir = new Vector((-this.facing) * Math.cos(angle), 
    			 -Math.sin(angle));
    this.missile.prevPos = this.missile.pos.sub(dir.mul(80.));
    this.missile.active = true;
}

Grape.prototype.update = function(dt) {
    this.time += this.moveDir * dt;
    const moveSpeed = 2200.0;
    const rotateSpeed = 5.00;
    
    const footSpeed = 20;
    const armSpeed = 10;

    if (this.jumpTime != null) {
	this.jumpTime += dt;
	this.box.addForce(new Vector(0,-9000.));
	if (this.jumpTime > 0.100) 
	    this.jumpTime = null;
    }
    // rotate aim
    this.angle += rotateSpeed * this.rotateDir * dt;
    if (this.angle < 0.0) this.angle = 0;
    if (this.angle > Math.PI / 2.0) this.angle = Math.PI / 2.0;
    
    // move forward/backwards and animate arms and legs
    if (this.moveDir) {
	// this.pos.x += moveSpeed * this.moveDir * dt;
	 this.box.addForce(new Vector(1,0).mul(moveSpeed * this.moveDir));
	//this.box.addForce(this.box.getDirection().mul(moveSpeed * this.moveDir));

	this.frontFootX = -5 + 4 * Math.sin(this.facing * this.time * footSpeed);
	this.frontFootY = 23 - 2 * Math.cos(this.facing * this.time * footSpeed);
	
	this.backFootX  = 8  + 4 * Math.sin(this.facing * (Math.PI / 2.0 + this.time * footSpeed));
	this.backFootY  = 19 - 2 * Math.cos(this.facing * (Math.PI / 2.0 + this.time * footSpeed));
	
	this.armRotate  = Math.PI / 6 * Math.sin(this.time * armSpeed);
    }
}

