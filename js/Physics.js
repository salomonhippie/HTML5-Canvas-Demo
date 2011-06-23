function RigidBody() {
    this.pos = new Vector(0,0);
    this.prevPos = new Vector(0,0);
    this.forces = new Vector(0,0);
    this.active = true;
}

RigidBody.prototype = {
    addForce : function(v) {
	this.forces = this.forces.add(v);
    },
    getForces : function() {
	return this.forces;
    },
    clearForces : function() {
	this.forces = new Vector(0,0);
    }
}

function Point(x, y) {
    this.pos = new Vector();
    this.prevPos = new Vector();
    this.forces = new Vector();
    if (x) this.pos.x = this.prevPos.x = x;
    if (y) this.pos.y = this.prevPos.y = y;
}

Point.prototype = new RigidBody();


function Constraint(p1, p2, dist) {
    this.p1 = p1;
    this.p2 = p2;
    this.dist = dist;
}

function Springs() {
    this.points = new Array();
    this.constraints = new Array();
}

Springs.prototype = {
    addPoint : function(p) {
	this.points[this.points.length] = p;
    },
    addConstraint : function(p1, p2, dist) {
	this.constraints[this.constraints.length] = new Constraint(p1, p2, dist);
    },
    addForce: function(v) {
	for (var i = 0; i < this.points.length; ++i) {
	    this.points[i].forces.x += v.x;
	    this.points[i].forces.y += v.y;
	}
    },

    draw : function(ctx) { 

   	for (var i = 0; i < this.points.length; ++i) {
	    ctx.fillStyle="#FF0000";
	    ctx.beginPath();
	    ctx.arc(this.points[i].pos.x, this.points[i].pos.y, 3, 0, Math.PI*2, true);
	    ctx.closePath();
	    ctx.fill();
	}

	
   	for (var i = 0; i < this.constraints.length; ++i) {
	    var p1 = this.constraints[i].p1;
	    var p2 = this.constraints[i].p2;

	    ctx.fillStyle="#00FF00";
	    ctx.beginPath();
	    ctx.moveTo(p1.pos.x,p1.pos.y);
	    ctx.lineTo(p2.pos.x,p2.pos.y);
	    ctx.stroke();
	}
	
	var c = this.getCenter();
	ctx.beginPath();
	ctx.arc(c.x, c.y, 3, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();


	// var d = this.getDirection();
	// ctx.beginPath();
	// ctx.moveTo(c.x,c.y);
	// ctx.lineTo(c.x+d.x*20,c.y+d.y*20);
	// ctx.stroke();
    }
}

function SpringBox(x, y, w, h) {
    var hw = w/2;
    var hh = h/2;

    var ul = new Point(x - hw, y - hh);
    var ur = new Point(x + hw, y - hh);
    var ll = new Point(x - hw, y + hh);
    var lr = new Point(x + hw, y + hh);
    
    this.addPoint(ul);
    this.addPoint(ur);
    this.addPoint(ll);
    this.addPoint(lr);

    this.addConstraint(ul, ur, w);
    this.addConstraint(ll, lr, w);

    this.addConstraint(ul, ll, h);
    this.addConstraint(ur, lr, h);

    this.addConstraint(ul, lr, Math.sqrt(w * w + h * h));
    this.addConstraint(ur, ll, Math.sqrt(h * h + w * w));


    // add extra points
    const count = 2;
    var dw = w / (count+2);
    var dh = h / (count+2);    
    var l1 = ul;
    var l2 = ur;
    var l3 = ll;
    var l4 = lr;
    for (k = 0; k < count; ++k) {
	var p1 = new Point(l1.pos.x + dw, l1.pos.y);
	var p2 = new Point(l2.pos.x, l2.pos.y - dh);
	var p3 = new Point(l3.pos.x, l3.pos.y + dh);
	var p4 = new Point(l4.pos.x - dw, l4.pos.y);

	this.addPoint(p1);
	this.addPoint(p2);
	this.addPoint(p3);
	this.addPoint(p4);

	this.addConstraint(l1, p1, dw);
	this.addConstraint(l2, p2, dh);
	this.addConstraint(l3, p3, dh);
	this.addConstraint(l4, p4, dw);

	l1 = p1;
	l2 = p2;
	l3 = p3;
	l4 = p4;
    }
    this.addConstraint(l1, ur, dw);
    this.addConstraint(l2, lr, dh);
    this.addConstraint(l3, ul, dh);
    this.addConstraint(l4, ll, dh);
    
}

SpringBox.prototype = new Springs();

SpringBox.prototype.getCenter = function () {
    return this.points[0].pos.add(this.points[3].pos).mul(0.5);
}

SpringBox.prototype.getRotation = function () {
    var v = this.getDirection();
    if (v.y == 0) return 0;
    return Math.atan(v.y/v.x);
}

SpringBox.prototype.getDirection = function () {
    // stuff is buggy
    var max1 = this.points[0].pos;
    var max2 = this.points[1].pos;

    if (max1.y > this.points[2].pos.y) max1 = this.points[2].pos;
    if (max2.y > this.points[3].pos.y) max2 = this.points[3].pos;

    if (this.points[3].pos != max2 && max1.y > this.points[3].pos.y) max1 = this.points[3].pos;
    if (this.points[2].pos != max1 && max2.y > this.points[2].pos.y) max2 = this.points[2].pos;


    if (max2.x > max1.x) {
	var tmp = max2;
	max2 = max1;
	max1 = tmp;
    }
    return max1.sub(max2).unit();
}



function SpringCircle(x, y, r, count) {
    var center = new Point(x, y);
    this.addPoint(center);
    
    var theta = 0;
    var dtheta = (Math.PI*2) / count;
    var lastPoint = new Point(r*Math.cos(theta)+center.pos.x, r*Math.sin(theta)+center.pos.y);
    this.addPoint(lastPoint);
    this.addConstraint(center, lastPoint, r)
    for (var i = 0; i < count; ++i) {
	theta += dtheta;
	var p = new Point(r*Math.cos(theta)+center.pos.x, r*Math.sin(theta)+center.pos.y);
	this.addPoint(p);
	this.addConstraint(center, p, r)	
	this.addConstraint(p, lastPoint, p.pos.sub(lastPoint.pos).length());
	lastPoint = p;
    }
    this.addConstraint(this.points[1], lastPoint, p.pos.sub(lastPoint.pos).length());
}

SpringCircle.prototype = new Springs();

SpringCircle.prototype.getCenter = function () {
    return this.points[0].pos;
}


function sign(x) {
    if (x < 0) return -1;
    if (x > 0) return 1;
    return 0;
}


function Physics (map) {
    this.rbs = new Array();
    this.sps = new Array();
    this.gravity = new Vector(0.0, 2*982);
    
    this.map = map;
}

Physics.prototype = {
    addRigidBody: function (rb) {
	this.rbs[this.rbs.length] = rb;
    },
    addSprings: function (springs) {
	this.sps[this.sps.length] = springs;
    },
    // verlet integration
    dynamics: function(rb, dt) {
	const damp = 0.8;
	var f = rb.getForces();
	var p = rb.pos.mul(1+damp).sub(rb.prevPos.mul(damp));
	f = f.add(this.gravity);
	p = p.add(f.mul(dt*dt));
	rb.prevPos = rb.pos;
	rb.pos = p;
	rb.clearForces();
    },
    relax: function(springs) {
	for (var k = 0; k < springs.constraints.length; ++k) {
	    var constraint = springs.constraints[k];
	    var dir = constraint.p2.pos.sub(constraint.p1.pos);
	    var l = dir.length();
	    var diff = (l - constraint.dist) * 0.5 / l;

	    constraint.p1.pos = constraint.p1.pos.add(dir.mul(diff));
	    constraint.p2.pos = constraint.p2.pos.sub(dir.mul(diff));
	}
    },    
    collision: function(rb, dt) {
	// map collision
	var intX = parseInt(rb.pos.x);
	var intY = parseInt(rb.pos.y);

	// trace back until clear of obstacle
	if (this.map.data[(intX + intY * this.map.width) * 4 + 3] != 0) {
	    var dirX = rb.prevPos.x - rb.pos.x;
	    var dirY = rb.prevPos.y - rb.pos.y;
	    const steps = 20;
	    
	    var stepX = dirX / steps;
	    var stepY = dirY / steps;

	    var x = rb.pos.x;
	    var y = rb.pos.y;
	    for (var k = 0; k < steps; ++k) {
		x += stepX;
		y += stepY;
		if (this.map.data[(parseInt(x) + parseInt(y) * this.map.width) * 4 + 3] == 0) {
		    rb.pos.x = x;
		    rb.pos.y = y;
		    break;
		}
	    }
	    return true;
	}
	return false;

	// if (this.map.data[(intX + intY * this.map.width) * 4 + 3] != 0) {
	//     var dir = rb.prevPos.sub(rb.pos);
	//     const steps = 20;
	    
	//     var x = intX;
	//     var y = intY;
	//     for (var k = 0; k < steps; ++k) {
	// 	y += sign(dir.y);
	// 	if (this.map.data[(x + y * this.map.width) * 4 + 3] == 0) {
	// 	    // var newP = new Vector(x,y);
	// 	    // var newDir = newP.sub(rb.pos).unit();
	// 	    // rb.pos = newP;
	// 	    // rb.prevPos = rb.pos.sub(newDir.mul(dir.length()));
	// 	    rb.pos.x = rb.prevPos.x = x;
	// 	    rb.pos.y = rb.prevPos.y = y;
	// 	    break;
	// 	}
	//     }

	//     for (var k = 0; k < steps; ++k) {
	//     	x -= sign(dir.x);
	//     	if (this.map.data[(x + y * this.map.width) * 4 + 3] == 0) {
	//     	    var newP = new Vector(x,y);
	//     	    var newDir = newP.sub(rb.pos).unit();
	//     	    rb.pos = newP;
	//     	    rb.prevPos = rb.pos.add(newDir.mul(dir.length()));
	//     	    break;
	//     	}
	//     }
	

    },
    update: function(dt) {

	for (var i = 0; i < this.sps.length; ++i) {
	    var springs = this.sps[i];
	    for (var j = 0; j < springs.points.length; ++j) {
		this.dynamics(springs.points[j], dt);
	    }

	    this.relax(springs);

	    for (var j = 0; j < springs.points.length; ++j) {
		this.collision(springs.points[j], dt);
	    }

	    this.relax(springs);

	    for (var j = 0; j < springs.points.length; ++j) {
		this.collision(springs.points[j], dt);
	    }

	    // this.relax(springs);

	    // for (var j = 0; j < springs.points.length; ++j) {
	    // 	this.collision(springs.points[j], dt);
	    // }

	    // this.relax(springs);

	    // for (var j = 0; j < springs.points.length; ++j) {
	    // 	this.collision(springs.points[j], dt);
	    // }

	}

	for (var i = 0; i < this.rbs.length; ++i) {
	    // dynamics
	    if (!this.rbs[i].active) continue;
	    this.dynamics(this.rbs[i], dt);
	    if (this.collision(this.rbs[i])) {
		this.map.notifyCollision(this.rbs[i]);
		this.rbs[i].notifyCollision(this.map);
	    }
	}
    }
}