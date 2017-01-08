//wave
var wave = function (opts) {
    var me = this;
    this.devicePixelRatio = window.devicePixelRatio;
    this.canvas = opts.canvas;
    this.canvas2d = this.canvas.getContext("2d");
    this.canvas.wrap = this;
    this.canvas.width = opts.width * this.devicePixelRatio;
    this.canvas.height = opts.height * this.devicePixelRatio;
    this.canvas.style.width = opts.width + "px";
    this.canvas.style.height = opts.height + "px";
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.A = opts.A;
    this.fade = opts.fade;
    this.maxA = this.A;
    this.w = opts.w;
    this.v = opts.v;
    this.offsetX = 0;
};
wave.prototype.clear = function () {
    //清屏
    this.canvas2d.clearRect(0,0,this.canvas.width,this.canvas.height);
};
wave.prototype.drawSin = function (offsetX, color) {
    console.log(offsetX);
    this.canvas2d.beginPath();
    this.canvas2d.lineWidth = "1";
    this.canvas2d.strokeStyle = color;
    this.canvas2d.fillStyle = color;

    this.canvas2d.moveTo(0, this.height);

    for (var i = 0; i <= this.width; i += this.devicePixelRatio) {
        var y = this.A * Math.sin(i / this.w + this.offsetX + offsetX) + this.height / 2;
        this.canvas2d.lineTo(i, y);
    }

    this.canvas2d.lineTo(this.width, this.height);

    this.canvas2d.stroke();
    this.canvas2d.fill();
};
wave.prototype.animate = function () {
    this.offsetX += this.v;
    if (this.A > this.maxA || this.A < -this.maxA) {
        this.fade *= -1;
    }
    this.A -= this.fade;
};
wave.prototype.distroy = function () {
    clearInterval(this.timer);
};
wave.prototype.render = function () {
    clearInterval(this.timer);
    this.timer = setInterval(function(wave){
        wave.clear();
        wave.animate();
        wave.drawSin(Math.PI, "#ddf4ff");
        wave.drawSin(0, "#a9e4ff");
    }, 1000/60, this);
};
window.wave = wave;