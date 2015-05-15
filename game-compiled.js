/* jshint esnext: true */
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var canvas = document.getElementById('game');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var manager;

var start = function start() {
  console.log('start');
  manager = new Manager(canvas);
  var loop = function loop() {
    window.requestAnimationFrame(loop);
    manager.update();
    manager.draw();
  };
  loop();
};

var Manager = (function () {
  function Manager(canvas) {
    _classCallCheck(this, Manager);

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

  _createClass(Manager, [{
    key: 'update',
    value: function update() {
      this.currentScreen.update();
    }
  }, {
    key: 'draw',
    value: function draw() {
      this.currentScreen.draw();
    }
  }, {
    key: 'convertMouseCoordinates',
    value: function convertMouseCoordinates(mouseEvent) {
      return {
        x: mouseEvent.offsetX || mouseEvent.layerX || mouseEvent.pageX,
        y: mouseEvent.offsetY || mouseEvent.layerY || mouseEvent.pageY
      };
    }
  }, {
    key: 'enterGame',
    value: function enterGame() {
      console.log('changing currentScreen');
      this.currentScreen = new gameScreen(this.canvas, {
        parent: this
      });
    }
  }, {
    key: 'setupListeners',
    value: function setupListeners() {
      var self = this;
      window.addEventListener('click', function (event) {
        var simpleEvent = self.convertMouseCoordinates(event);
        if (self.currentScreen.detectHit(simpleEvent)) {
          self.currentScreen.hit(simpleEvent);
        } else {
          self.currentScreen.miss(simpleEvent);
        }
      });
    }
  }]);

  return Manager;
})();

var gameObject = (function () {
  function gameObject(canvas, options) {
    _classCallCheck(this, gameObject);

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

  _createClass(gameObject, [{
    key: 'detectHit',
    value: function detectHit(event) {
      return event.x > this.x && event.x < this.x + this.width && event.y > this.y && event.y < this.y + this.height;
    }
  }, {
    key: 'hit',
    value: function hit(event) {
      console.log('hit!');
    }
  }, {
    key: 'miss',
    value: function miss(event) {
      console.log('miss!');
    }
  }, {
    key: 'draw',
    value: function draw() {
      throw 'Subclasses should override';
    }
  }, {
    key: 'update',
    value: function update() {}
  }]);

  return gameObject;
})();

var startScreen = (function (_gameObject) {
  function startScreen() {
    _classCallCheck(this, startScreen);

    if (_gameObject != null) {
      _gameObject.apply(this, arguments);
    }
  }

  _inherits(startScreen, _gameObject);

  _createClass(startScreen, [{
    key: 'draw',
    value: function draw() {
      var y = this.context.canvas.height / 2;
      var title = 'The Paperless Post Game!';
      // fill the background
      this.context.fillStyle = 'cornflowerblue';
      this.context.fillRect(this.x, this.y, this.width, this.height);
      // draw the title
      this.context.fillStyle = 'white';
      this.context.font = '36px monospace';
      this.centerTextHorizontally(this.context, title, y);
      // draw the start text
      this.context.fillStyle = 'red';
      this.context.font = '20px monospace';
      this.centerTextHorizontally(this.context, 'Click to start', y + 30);
    }
  }, {
    key: 'centerTextHorizontally',
    value: function centerTextHorizontally(context, text, y) {
      var width = this.context.measureText(text).width;
      var x = (this.width - width) / 2;
      this.context.fillText(text, x, y);
    }
  }]);

  return startScreen;
})(gameObject);

var gameScreen = (function (_gameObject2) {
  function gameScreen(canvas, options) {
    _classCallCheck(this, gameScreen);

    _get(Object.getPrototypeOf(gameScreen.prototype), 'constructor', this).call(this, canvas, options);
    this.numberOfEnvelopes = 4;
    this.makeEnvelopes();
  }

  _inherits(gameScreen, _gameObject2);

  _createClass(gameScreen, [{
    key: 'update',
    value: function update() {
      this.envelopes.forEach(function (e) {
        return e.update();
      });
    }
  }, {
    key: 'draw',
    value: function draw() {
      // fill the background
      this.context.fillStyle = 'black';
      this.context.fillRect(this.x, this.x, this.canvas.width, this.canvas.height);

      this.envelopes.forEach(function (e) {
        return e.draw();
      });
    }
  }, {
    key: 'makeEnvelopes',
    value: function makeEnvelopes() {
      this.envelopes = [];
      for (var i = 0; i < this.numberOfEnvelopes; i++) {
        this.envelopes.push(new Envelope(this.canvas));
      }
    }
  }, {
    key: 'hit',
    value: function hit(event) {
      for (var i = 0; i < this.envelopes.length; i++) {
        var envelope = this.envelopes[i];
        if (envelope.detectHit(event)) {
          envelope.hit();
        }
      }
    }
  }]);

  return gameScreen;
})(gameObject);

var Envelope = (function (_gameObject3) {
  function Envelope(canvas, options) {
    _classCallCheck(this, Envelope);

    _get(Object.getPrototypeOf(Envelope.prototype), 'constructor', this).call(this, canvas, options);
    this.image = this.loadImage();
    this.width = this.height = 100;
    this.x = this.getRandomX();
    this.y = this.getRandomY();
    this.speed = 1;
    this.target = this.findNewTarget();
    this.color = null;
    console.log('target = %o', this.target);
  }

  _inherits(Envelope, _gameObject3);

  _createClass(Envelope, [{
    key: 'getRandomX',
    value: function getRandomX() {
      return Math.round(Math.random() * this.canvas.width);
    }
  }, {
    key: 'getRandomY',
    value: function getRandomY() {
      return Math.round(Math.random() * this.canvas.height);
    }
  }, {
    key: 'findNewTarget',
    value: function findNewTarget() {
      return {
        x: this.getRandomX(),
        y: this.getRandomY() };
    }
  }, {
    key: 'getRandomColor',
    value: function getRandomColor() {
      var colors = [];
      for (var i = 0; i < 3; i++) {
        colors.push(Math.round(Math.random() * 255));
      }
      return 'rgb(' + colors.join(', ') + ')';
    }
  }, {
    key: 'offscreen',
    value: function offscreen() {
      return this.x > _get(Object.getPrototypeOf(Envelope.prototype), 'x', this) && this.x < _get(Object.getPrototypeOf(Envelope.prototype), 'x', this) + _get(Object.getPrototypeOf(Envelope.prototype), 'width', this) && this.y > _get(Object.getPrototypeOf(Envelope.prototype), 'y', this) && this.y < _get(Object.getPrototypeOf(Envelope.prototype), 'y', this) + _get(Object.getPrototypeOf(Envelope.prototype), 'height', this);
    }
  }, {
    key: 'hit',
    value: function hit() {
      this.color = this.getRandomColor();
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.ready) return;
      // console.log("x  = " + this.x + " y = " + this.y);
      var deltaX = this.target.x - this.x;
      var deltaY = this.target.y - this.y;
      var closeToTarget = Math.pow(deltaX, 2) + Math.pow(deltaY, 2) < 16;
      if (closeToTarget) {
        // if we're relatively close to our target
        console.log('pretty close to target!');
        this.target = this.findNewTarget();
      } else if (this.offscreen()) {
        console.log('offscreen!');
        this.target = this.findNewTarget();
      } else {
        // keep moving towards target
        var orientation = Math.atan2(deltaY, deltaX);
        this.x += Math.cos(orientation) * this.speed;
        this.y += Math.sin(orientation) * this.speed;
      }
    }
  }, {
    key: 'loadImage',
    value: function loadImage() {
      var self = this;
      var image = new Image();
      image.onload = function () {
        self.ready = true;
        image.width = self.width;
        image.height = self.height;
        self.image = image;
      };
      image.src = 'http://www.clipartsfree.net/vector/small/Envelope_closed-bw_Clipart_Free.png';
    }
  }, {
    key: 'draw',
    value: function draw() {
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
  }]);

  return Envelope;
})(gameObject);

start();
