function Map() {
    var imgMap = document.getElementById("img-map");
    this.width = imgMap.width;
    this.height = imgMap.height;

    this.can = document.createElement('canvas');
    this.can.width = this.width;
    this.can.height = this.height;


    this.ctx = this.can.getContext('2d');
    // ctx.fillStyle = "rgb(255,255,255)";
    // ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.drawImage(imgMap, 0, 0);

    this.imgData = this.ctx.getImageData(0, 0, imgMap.width, imgMap.height); 
    this.data = this.imgData.data;

    this.offset = 0;
}

Map.prototype = {
    draw: function(ctx) {
	ctx.putImageData(this.imgData, this.offset, 0);
    },
    updateScroll : function (x, ctx) {
	this.offset = -x;
    },
    notifyCollision: function(rb) {
	const rad = 30;
	var v = new Vector();

	// this.ctx.fillStyle="#FFFFFF";
	
	this.ctx.globalCompositeOperation = "copy";
	this.ctx.globalAlpha = 0.0;
	this.ctx.beginPath();
	this.ctx.arc(rb.pos.x, rb.pos.y, rad, 0, Math.PI*2, true);
	this.ctx.closePath();
	this.ctx.fill();
	this.imgData = this.ctx.getImageData(0, 0, this.width, this.height); 
	this.data = this.imgData.data;
    }
}

