/* jshint esnext: true */
var canvas = document.getElementById('game');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var manager;

var start = function() {
  console.log("start");
  manager = new Manager(canvas);
  var loop = function() {
    window.requestAnimationFrame(loop);
    manager.update();
    manager.draw();
  };
  loop();
};

class Manager {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.setupListeners();

    this.currentScreen = new startScreen(this.canvas, {
      parent: this,
      hit: this.enterGame.bind(this)
    });
  }

  update() {
    this.currentScreen.update();
  }

  draw() {
    this.currentScreen.draw();
  }

  convertMouseCoordinates(mouseEvent) {
    return {
      x: mouseEvent.offsetX || mouseEvent.layerX || mouseEvent.pageX,
      y: mouseEvent.offsetY || mouseEvent.layerY || mouseEvent.pageY
    };
  }

  enterGame() {
    console.log("changing currentScreen");
    this.currentScreen = new gameScreen(this.canvas, {
      parent: this
    });
  }

  setupListeners() {
    var self = this;
    window.addEventListener('click', function(event) {
      var simpleEvent = self.convertMouseCoordinates(event);
      if (self.currentScreen.detectHit(simpleEvent)) {
        self.currentScreen.hit(simpleEvent);
      } else {
        self.currentScreen.miss(simpleEvent);
      }
    });
  }
}

class gameObject {
  constructor(canvas, options) {
    options = options || {};
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.parent = options.parent;
    this.width = options.width || this.canvas.width;
    this.height = options.height || this.canvas.height;
    this.x = options.x || 0;
    this.y = options.y || 0;

    this.hit = options.hit || this.hit;
    this.miss = options.miss || this.miss;
  }

  detectHit(event) {
    return (event.x > this.x) && (event.x < this.x + this.width) && (event.y > this.y) && (event.y < this.y + this.height);
  }

  hit(event) {
    console.log("hit!");
  }

  miss(event) {
    console.log("miss!");
  }

  draw() {
    throw "Subclasses should override";
  }

  update() {
  }
}

class startScreen extends gameObject {
  draw() {
    var y = this.context.canvas.height / 2;
    var title = "The Envelope Game!";
    // fill the background
    this.context.fillStyle = "cornflowerblue";
    this.context.fillRect(this.x, this.y, this.width, this.height);
    // draw the title
    this.context.fillStyle = "white";
    this.context.font = "36px monospace";
    this.centerTextHorizontally(this.context, title, y);
    // draw the start text
    this.context.fillStyle = "red";
    this.context.font = "20px monospace";
    this.centerTextHorizontally(this.context, "Click to start", y + 30);
  }

  centerTextHorizontally(context, text, y) {
    var width = this.context.measureText(text).width;
    var x = (this.width - width) / 2;
    this.context.fillText(text, x, y);
  }
}

class gameScreen extends gameObject {
  constructor(canvas, options) {
    super(canvas, options);
    this.numberOfEnvelopes = 4;
    this.makeEnvelopes();
  }

  update() {
    this.envelopes.forEach(e => e.update());
  }

  draw() {
    // fill the background
    this.context.fillStyle = "black";
    this.context.fillRect(this.x, this.x, this.canvas.width, this.canvas.height);

    this.envelopes.forEach(e => e.draw());
  }

  makeEnvelopes() {
    this.envelopes = [];
    for (var i = 0; i < this.numberOfEnvelopes; i++) {
      this.envelopes.push(new Envelope(this.canvas));
    }
  }

  hit(event) {
    for (var i = 0; i < this.envelopes.length; i++) {
      var envelope = this.envelopes[i];
      if (envelope.detectHit(event)) {
        envelope.hit();
      }
    }
  }
}

class Envelope extends gameObject {
  constructor(canvas, options) {
    super(canvas, options);
    this.image = this.loadImage();
    this.width = this.height = 100;
    this.x = this.getRandomX();
    this.y = this.getRandomY();
    this.speed = 1;
    this.target = this.findNewTarget();
    this.color = null;
    console.log("target = %o", this.target);
  }

  getRandomX() {
    return Math.round(Math.random() * this.canvas.width);
  }

  getRandomY() {
    return Math.round(Math.random() * this.canvas.height);
  }

  findNewTarget() {
    return {
      x: this.getRandomX(),
      y: this.getRandomY(),
    };
  }

  getRandomColor() {
    var colors = [];
    for (var i = 0; i < 3; i++) {
      colors.push(Math.round(Math.random() * 255));
    }
    return "rgb(" + colors.join(', ') + ")";
  }

  offscreen() {
    return (this.x > super.x) && (this.x < super.x + super.width) && (this.y > super.y) && (this.y < super.y + super.height);
  }

  hit() {
    this.color = this.getRandomColor();
  }

  update() {
    if (!this.ready) return;
    // console.log("x  = " + this.x + " y = " + this.y);
    var deltaX = this.target.x - this.x;
    var deltaY = this.target.y - this.y;
    var closeToTarget = Math.pow(deltaX, 2) + Math.pow(deltaY, 2) < 16;
    if (closeToTarget) { // if we're relatively close to our target
      console.log("pretty close to target!");
      this.target = this.findNewTarget();
    } else if (this.offscreen()) {
      console.log("offscreen!");
      this.target = this.findNewTarget();
    } else { // keep moving towards target
      var orientation = Math.atan2(deltaY, deltaX);
      this.x += Math.cos(orientation) * this.speed;
      this.y += Math.sin(orientation) * this.speed;
    }
  }

  loadImage() {
    var self = this;
    var image = new Image();
    image.onload = function() {
      self.ready = true;
      image.width = self.width;
      image.height = self.height;
      self.image = image;
    };
    image.src = "envelope.png";
  }

  draw() {
    if (!this.ready) return;

    this.context.save();
    this.context.translate(this.x, this.y);

    if (this.color) {
      this.context.fillStyle = this.color;
      this.context.fillRect(0, 0, this.width, this.height);
    }

    this.context.drawImage(this.image, 0, 0, this.width, this.height);

    this.context.restore();

    this.context.beginPath();
    this.context.fillStyle = 'rgba(255,0,0,0.5)';
    this.context.fill();
  }
}

start();