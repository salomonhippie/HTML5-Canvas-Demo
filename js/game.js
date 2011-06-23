window.onload = function () {
    var canvas = document.getElementById("can");
    var context = canvas.getContext('2d');
    context.fillStyle = "rgb(255,255,255)";
    context.fillRect(0, 0, 800, 600);
    
    var map = new Map();
    var phys  = new Physics(map);
    var grape = new Grape(phys);
    var dt = 30;

    // phys.addRigidBody(grape);
    phys.addSprings(grape.box);

    window.onkeydown = 
	function (e) {
	    //alert(e.which);
	    switch (e.which) {
	      case 87: grape.rotate(-1); return false; // w
	      case 65: grape.move(-1);   return false; // a
	      case 83: grape.rotate(1);  return false; // s
	      case 68: grape.move(1);    return false; // d
	      case 13: grape.jump();     return false; // enter
	      case 32: grape.fire(phys); return false; // space
	      case 66: grape.toggleDrawBox(); return false; // b
	    }
	};


    window.onkeyup = 
	function (e) {
	    switch (e.which) {
		case 87: grape.rotate(0); return false; // w
		case 65: grape.move(0);   return false; // a
		case 83: grape.rotate(0); return false; // s
		case 68: grape.move(0);   return false; // d
	        case 13: grape.jumpTime = null;  return false; // enter
        	case 32: grape.isFiring = false; return false; // space
	    }
	};

    var timer = 
	setInterval(
	    function() { 
		context.fillStyle = "rgb(255,255,255)";
		context.fillRect(0,0,800,600);
		phys.update(dt/1000.0);
		grape.update(dt/1000.0);
		// map.updateScroll(parseInt(grape.box.getCenter().x), context);
		map.draw(context);
		grape.draw(context);
	    }, 
	    dt);
}
