(function(){
	var devicePixelRatio = window.devicePixelRatio;
	var win_width = $(window).width();
	var win_height = $(window).height();
	var devour = function(opts){
		this.mycanvas = opts.canvas;
		this.mycanvas2d = this.mycanvas.getContext('2d');
		this.padding = !!opts.padding?opts.padding:20;
		this.defaultColor = !!opts.defaultColor?opts.defaultColor:'#000000',
		this.running = true;
		this.timer = 0;
		this.all_star = [];
		this.init();
	};
	devour.prototype.init = function () {
		this.mycanvas.width = (win_width-2*this.padding)*devicePixelRatio;
		this.mycanvas.height = (win_height-2*this.padding)*devicePixelRatio;
		this.mycanvas.style.width = (win_width-2*this.padding) + "px";
		this.mycanvas.style.height = (win_height-2*this.padding) + "px";
		this.mycanvas.style.margin = this.padding + "px";
		this.starid = 0;
	};
	devour.prototype.erase = function () {
		this.mycanvas2d.clearRect(0, 0, this.mycanvas.width, this.mycanvas.height);
	};
	devour.prototype.createStar = function (opts) {
		var devour = this;
		var mystar = new star ({
			devour: devour,
			cx: opts.cx,
			cy: opts.cy,
			radius: opts.radius,
			color: !!opts.color?opts.color:devour.defaultColor,
			vx: opts.vx,
			vy: opts.vy,
			density: opts.density
		})
		this.starid++;
		this.doOutofBoundary(mystar);
		mystar.draw();
		this.all_star.push(mystar);
		return mystar;
	};
	devour.prototype.removeStar = function (id) {
		for (var i = 0; i < this.all_star.length; i++) {
			if (this.all_star[i].id == id) {
				this.all_star.splice(i,1);
			}
		}
	};
	devour.prototype.getDistance = function (x1, y1, x2, y2){
		var dx = x2 - x1;
		var dy = y2 - y1;
		var dist = Math.sqrt(dx * dx + dy * dy);
		return dist;
	};
	devour.prototype.rotate = function (x,y,sin,cos,reverse) {
		return {
			x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
			y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
		};
	};
	devour.prototype.isCollision = function (starA,starB) {
		if (this.getDistance(starA.cx,starA.cy,starB.cx,starB.cy) <= starA.radius + starB.radius) {
			return true;
		} else {
			return false;
		}
	};
	devour.prototype.doCollision = function (starA,starB) {
		if (this.isCollision(starA,starB)) {
			var dx = starB.cx - starA.cx;
			var dy = starB.cy - starA.cy;
			var angle = Math.atan2(dy,dx),
				sin = Math.sin(angle),
				cos = Math.cos(angle),
				pos0 = {x: 0,y: 0},
				pos1 = this.rotate(dx, dy, sin, cos, true),
				vel0 = this.rotate(starA.vx, starA.vy, sin, cos, true),
				vel1 = this.rotate(starB.vx, starB.vy, sin, cos, true),
				vxTotal = vel0.x + vel1.x;

			vel0.x = ((starA.mass - starB.mass) * vel0.x + 2 * starB.mass * vel1.x) / (starA.mass + starB.mass);
			vel1.x = vxTotal - vel0.x;

			var t = 0;
			var isError = false;
			var absV = Math.abs(vel0.x) + Math.abs(vel1.x),
				overlap = (starA.radius + starB.radius) - Math.abs(pos0.x - pos1.x);
			
			//做位置微调，使其无法重叠
			do {
				t++;
				if (t == 50) {
					isError = true;
				}
				pos0.x += vel0.x / absV * overlap;
				pos1.x += vel1.x / absV * overlap;
			} while (this.isCollision({
				cx:pos0.x,
				cy:pos0.y,
				radius:starA.radius
			},{
				cx:pos1.x,
				cy:pos1.y,
				radius:starB.radius
			}) && t <= 50)

			//异常处理
			if (isError) {
				this.doError(starA,starB);
			} else {
				var pos0F = this.rotate(pos0.x, pos0.y, sin, cos, false),
					pos1F = this.rotate(pos1.x, pos1.y, sin, cos, false);
				starB.cx = starA.cx + pos1F.x;
				starB.cy = starA.cy + pos1F.y;
				starA.cx = starA.cx + pos0F.x;
				starA.cy = starA.cy + pos0F.y;

				var vel0F = this.rotate(vel0.x, vel0.y, sin, cos, false),
					vel1F = this.rotate(vel1.x, vel1.y, sin, cos, false);
				starA.vx = vel0F.x;
				starA.vy = vel0F.y;
				starB.vx = vel1F.x;
				starB.vy = vel1F.y;
			}
		}
	};
	devour.prototype.doJet = function (star,click_coordinate) {
		//主星放出粒子做反冲运动
		var jet_v = 5//反冲粒子速度
		var delta_radius = star.radius / 50;
		var volume0 = star.volume;//原主星体积
		var volume1 = Math.pow(star.radius - delta_radius,3);//新主星体积
		var volume2 = volume0 - volume1;//喷出粒子体积

		var dx = click_coordinate.x - star.cx;
		var dy = click_coordinate.y - star.cy;
		var angle = Math.atan2(dy,dx),
			sin = Math.sin(angle),
			cos = Math.cos(angle),
			pos0 = {x: 0,y: 0},
			pos1 = this.rotate(dx, dy, sin, cos, true),
			vel0 = this.rotate(star.vx, star.vy, sin, cos, true),
			vel1 = {x: jet_v,y: 0}

		vel0.x = (volume0 * vel0.x - volume2 * vel1.x) / volume1;
		
		var vel0F = this.rotate(vel0.x, vel0.y, sin, cos, false),
			vel1F = this.rotate(vel1.x, vel1.y, sin, cos, false);


		star.radius -= delta_radius;
		star.volume = volume1;
		star.mass = star.density * star.volume;
		star.vx = vel0F.x;
		star.vy = vel0F.y;

		density2 = star.density;//喷出粒子的密度
		radius2 = (function(volume){
			var radius = 1;
			var loop = true;
			do {
				if (Math.pow(radius,3) > volume) {
					loop = false;
				} else {
					radius += 0.01;
				}
			} while (loop)
			radius -= 0.01;
			return radius;
		})(volume2);
		cx2 = star.cx + cos * (star.radius + radius2);
		cy2 = star.cy + sin * (star.radius + radius2);

		return this.createStar({
			cx:cx2,
			cy:cy2,
			radius:radius2,
			vx: vel1F.x,
			vy: vel1F.y,
			density: density2
		});
	};
	devour.prototype.doDevour = function (starA,starB) {
		if (this.isCollision(starA,starB)) {
			if (starA.radius > starB.radius) {
				var big_star = starA;
				var small_star = starB;
			} else if (starA.radius < starB.radius) {
				var big_star = starB;
				var small_star = starA;
			} else {
				this.doCollision(starA,starB);
				return;
			}
			var distance = this.getDistance(starA.cx, starA.cy, starB.cx, starB.cy);
			var small_mass = small_star.mass;
			if (distance <= big_star.radius) {
				big_star.mass = big_star.mass + small_star.radius;
				big_star.volume = big_star.mass / big_star.density;
				big_star.radius = (function(volume){
					var radius = 1;
					var loop = true;
					do {
						if (Math.pow(radius,3) > volume) {
							loop = false;
						} else {
							radius += 0.0001;
						}
					} while (loop)
					radius -= 0.0001;
					return radius;
				})(big_star.volume);
				this.removeStar(small_star.id);
			} else {
				var small_radius = distance - big_star.radius;
				var loop = true;
				var error = false;
				do {
					if (small_radius < 0) {
						error = true;
					}
					new_sum_mass = small_star.density * Math.pow(small_radius,3) + big_star.density * Math.pow(distance - small_radius,3);
					if (Math.abs(new_sum_mass - small_star.mass - big_star.mass) < 10) {
						loop = false;
					} else {
						small_radius -= 0.0001;
					}
				} while (loop && !error)
				if (loop) {
					console.log("loop");
				}

				if (small_radius <= 0) {
					small_radius = 0;
				}
				small_star.radius = small_radius;
				small_star.volume = Math.pow(small_star.radius,3);
				small_star.mass = small_star.density * small_star.volume;
				big_star.radius = distance - small_radius;
				big_star.volume = Math.pow(big_star.radius,3);
				big_star.mass = big_star.density * big_star.volume;
				
			}
			var delta_mass = small_mass - small_star.mass;
			var dx = small_star.cx - big_star.cx;
			var dy = small_star.cy - big_star.cy;
			var angle = Math.atan2(dy,dx),
				sin = Math.sin(angle),
				cos = Math.cos(angle),
				pos0 = {x: 0,y: 0},
				pos1 = this.rotate(dx, dy, sin, cos, true),
				vel0 = this.rotate(big_star.vx, big_star.vy, sin, cos, true),
				vel1 = this.rotate(small_star.vx, small_star.vy, sin, cos, true);

			var delta_v = delta_mass / big_star.mass * vel1.x;
			if (vel1.x >= 0) {
				vel0.x -= delta_v;
			} else {
				vel0.x += delta_v;
			}
			var vel0F = this.rotate(vel0.x, vel0.y, sin, cos, false),
				vel1F = this.rotate(vel1.x, vel1.y, sin, cos, false);
			big_star.vx = vel0F.x;
			big_star.vy = vel0F.y;
			small_star.vx = vel1F.x;
			small_star.vy = vel1F.y;
			if (small_star.radius < 1) {
				this.removeStar(small_star.id);
			}
		}
	};
	devour.prototype.doError = function (starA,starB) {
		console.log("error");
		this.isCollision(starA,starB);
		var dx = starB.cx - starA.cx;
		var dy = starB.cy - starA.cy;
		var angle = Math.atan2(dy,dx),
			sin = Math.sin(angle),
			cos = Math.cos(angle),
			pos0 = {x: 0,y: 0},
			pos1 = this.rotate(dx, dy, sin, cos, true),
			vel0 = this.rotate(starA.vx, starA.vy, sin, cos, true),
			vel1 = this.rotate(starB.vx, starB.vy, sin, cos, true);
		vel0.x = Math.sqrt(starA.vx * starA.vx + starA.vy * starA.vy);
		vel1.x = Math.sqrt(starB.vx * starB.vx + starB.vy * starB.vy);
		var vel0F = this.rotate(vel0.x, 0, sin, cos, false),
			vel1F = this.rotate(vel1.x, 0, sin, cos, false);
		starA.vx = vel0F.x;
		starA.vy = vel0F.y;
		starB.vx = vel1F.x;
		starB.vy = vel1F.y;
	};
	devour.prototype.doOutofBoundary = function (star) {
		if (star.cx < star.radius) {
			star.cx = 2 * star.radius - star.cx;
			star.vx = -star.vx;
		}
		if (this.mycanvas.width/devicePixelRatio - star.cx < star.radius) {
			star.cx = 2 * (this.mycanvas.width/devicePixelRatio -  star.radius) - star.cx;
			star.vx = -star.vx;
		}
		if (star.cy < star.radius) {
			star.cy = 2 * star.radius - star.cy;
			star.vy = -star.vy;
		}
		if (this.mycanvas.height/devicePixelRatio - star.cy < star.radius) {
			star.cy = 2 * (this.mycanvas.height/devicePixelRatio -  star.radius) - star.cy;
			star.vy = -star.vy;
		}
	};
	var star = function (opts) {
		this.devour = opts.devour;
		this.id = "star" + this.devour.starid;
		this.cx = opts.cx;
		this.cy = opts.cy;
		this.radius = opts.radius;
		this.color = opts.color;
		this.vx = opts.vx;
		this.vy = opts.vy;
		this.density = opts.density;
		this.volume = Math.pow(this.radius,3);
		this.mass = this.density * this.volume;
	};
	star.prototype.move = function () {
		this.cx += this.vx;
		this.cy += this.vy;
	};
	star.prototype.draw = function () {
		this.devour.mycanvas2d.beginPath();
		this.devour.mycanvas2d.arc(this.cx*devicePixelRatio,this.cy*devicePixelRatio,this.radius*devicePixelRatio,0,360,false);
		this.devour.mycanvas2d.lineWidth = 2*devicePixelRatio;
		this.devour.mycanvas2d.strokeStyle = this.color;
		this.devour.mycanvas2d.stroke();
		this.devour.mycanvas2d.closePath();
	};
	window.devour = devour;
})(Zepto);





if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
		return window.setTimeout(callback, 1000/60);
	});
}
if (!window.cancelRequestAnimationFrame) {
	window.cancelRequestAnimationFrame = (window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.clearTimeout);
}

if (getBrowserInfo().mobile) {
	var getClickCoordinate = function (el) {
		var touch = {x: null, y: null, isPressed: false};
		el.addEventListener('touchstart', function (e) {
			touch.isPressed = true;
			GetOffset(e);
			mydevour.doJet(mystar,touch);
		}, false);
		el.addEventListener('touchend', function (e) {
			touch.isPressed = false;
			touch.x = null;
			touch.y = null;
		}, false);
		el.addEventListener('touchmove', GetOffset, false);
		function GetOffset(e){
			var x, y;
			touch_event = e.targetTouches[0];

			if (touch_event.pageX || touch_event.pageY) {
				x = touch_event.pageX;
				y = touch_event.pageY;
			} else {
				x = touch_event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				y = touch_event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			x -= el.offsetLeft;
			y -= el.offsetTop;
			touch.x = x;
			touch.y = y;
		}
		return touch;
	};
} else {
	var getClickCoordinate = function (el) {
		var mouse = {x: 0, y: 0};
		el.addEventListener('mousedown', function(e){
			var x, y;
			if (e.pageX || e.pageY) {
				x = e.pageX;
				y = e.pageY;
			} else {
				x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			x -= el.offsetLeft;
			y -= el.offsetTop;
			mouse.x = x;
			mouse.y = y;
			mydevour.doJet(mystar,mouse);
		}, false);
		return mouse;
	};
}
window.onload = function () {
	var canvas = document.getElementById("devour");
	getClickCoordinate(canvas);
	mydevour = new devour({
		canvas: canvas,
		defaultColor: "#DF813E"
	})
	createStars(20);
	mystar = mydevour.all_star[0];
	mystar.id = "mystar";
	mystar.color = "#000000";

	fps = 0;
	fps_arr = [];
	animation();

	//记录帧频
	/*setInterval(function(){
		console.log(fps);
		fps_arr.push(fps);
		fps = 0;
	}, 1000);*/
};
function getBrowserInfo() {
    var browser = {
        versions: function() {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {//移动终端浏览器版本信息 
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }
    return browser;
}
function createStars (count) {
	//创建star对象
	var area = {
		width: Number(mydevour.mycanvas.style.width.slice(0,-2)),
		height: Number(mydevour.mycanvas.style.height.slice(0,-2))
	};
	for (var i = 0; i < count; i++) {
		//生成count个star
		do {
			//循环执行直到满足条件，生成一个star
			var loop = true;
			var noCollision = true;
			var radius = Math.floor(Math.random()*21+10);
			var cx = Math.floor(Math.random()*(area.width-2*radius)+radius);
			var cy = Math.floor(Math.random()*(area.height-2*radius)+radius);
			for (var j = 0; j < mydevour.all_star.length; j++) {
				//与已生成的star进行比较若不重叠则满足条件
				var isCollision = mydevour.isCollision({
					cx:cx,
					cy:cy,
					radius:radius
				},mydevour.all_star[j]);
				if (isCollision === false) {
					noCollision = true;
				} else {
					noCollision = false;
					break;
				}
			}
			if (noCollision) {
				loop = false;
				mydevour.createStar({
					cx:cx,
					cy:cy,
					radius:radius,
					vx: Math.random()*0.6-0.3,
					vy: Math.random()*0.6-0.3,
					density: 1
				});
			}
		} while (loop)
	}
}
function animation () {
	//重绘帧
	fps++;
	window.requestAnimationFrame(function(){
		mydevour.erase();
		for (var i = 0; i < mydevour.all_star.length; i++) {
			var star = mydevour.all_star[i];
			star.move();
			if (i + 1 < mydevour.all_star.length) {
				for (var j = i + 1; j < mydevour.all_star.length; j++) {
					var starA = star;
					var starB = mydevour.all_star[j];
					mydevour.doDevour(starA,starB);
				}
			}
			mydevour.doOutofBoundary(star);
			if (star.radius >= mystar.radius && star.id != "mystar") {
				star.color = "#F26262";
			} 
			if (star.radius < mystar.radius && star.id != "mystar") {
				star.color = "#727BBB";
			}
			star.draw();
		}
		animation();
	})
}