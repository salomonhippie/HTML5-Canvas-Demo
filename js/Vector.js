function Vector (x, y) {
    if (x) this.x = x; else this.x = 0;
    if (y) this.y = y; else this.y = 0;
}

Vector.prototype = {
    add : function(v) {
	return new Vector(this.x + v.x, this.y + v.y);
    },
    sub : function(v) {
	return new Vector(this.x - v.x, this.y - v.y);
    },
    mul : function(s) {
	return new Vector(this.x * s, this.y * s);
    },
    length : function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    unit : function() {
	var l = this.length();
	return new Vector(this.x / l, this.y / l);
    },
    clone : function() {
	return new Vector(this.x, this.y);
    }
}
