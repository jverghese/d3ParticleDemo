var ParticleSet = function (settings) {
  settings = settings || {};
  this.step = settings.step || 10;
  this.transparentColor = settings.transparentColor || 'rgb(255, 255, 255)';
  this.canvas = document.createElement('canvas');
  this.data = [];
};

ParticleSet.prototype.processImg = function (img) {
  var x, y, color, parsedColor,
      data = [],
      canvas = this.canvas,
      context = canvas.getContext('2d'),
      step = this.step;
  canvas.width = img.width;
  canvas.height = img.height;
  context.fillStyle = this.transparentColor;
  context.fillRect(0, 0, img.width, img.height);
  context.drawImage(img, 0, 0, img.width, img.height);
  this.imageData = context.getImageData(0, 0, img.width, img.height).data;
  for(x = 0; x < canvas.width; x += step) {
    for(y = 0; y < canvas.height; y+= step) {
      color = this.getColor(x + step, y + step);
      parsedColor = this.parseColor(color);
      if (parsedColor !== null) {
        if (!this.isTransparentColor(parsedColor)) {
          data.push({ x : x, y : y, color : color});
        }
      }
    }
  }
  this.data = data;
};

ParticleSet.prototype.isTransparentColor = function (c) {
  var t = this.parseColor(this.transparentColor);
  if (t === null) { return false; }
  return t.r === c.r && t.g === c.g && t.b === c.b;
};

ParticleSet.prototype.getData = function () {
  return this.data;
};

ParticleSet.prototype.getStep = function () {
  return this.step;
};

ParticleSet.prototype.parseColor = function (color) {
  var digits = /rgb\((\d+), (\d+), (\d+)\)/.exec(color);
  if (digits === null) {
    return null;
  }
  return {
    r: parseInt(digits[1], 10),
    g: parseInt(digits[2], 10),
    b: parseInt(digits[3], 10)
  };
};

ParticleSet.prototype.getColor = function (x, y) {
  var i = (this.canvas.width * y + x) * 4,
      imageData = this.imageData;
  return 'rgb(' + imageData[i] + ', '
         + imageData[i + 1] + ', '
         + imageData[i + 2] + ')';
};

var Stage = function (container) {
  var $c = $(container);
  this.container = container;
  this.width = $c.width();
  this.height = $c.height();
  this.svg = d3.select(container).append('svg')
    .attr('class', 'chart')
    .attr('width', this.width)
    .attr('height', this.height);
  this.message = this.svg.append('text')
    .attr('class', 'stage-message');
  this.setupDragDrop_();
};

Stage.prototype.setupDragDrop_ = function () {
  var self = this;
  this.setMessage('DROP AN IMAGE HERE..');
  $(this.container)
    .on('dragover', function(e) {
      e = e.originalEvent;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      self.setMessage('DROP THAT IMAGE!');
    })
    .on('dragleave', function(e) {
      self.setMessage('DROP AN IMAGE HERE..');
    })
    .on('drop', this.loadImage.bind(this));
};

Stage.prototype.setMessage = function (msg) {
  var msgWidth;
  this.message
    .style('font-family', 'Arial')
    .style('font-size', '30px')
    .attr('dy', this.height/2)
    .attr('dx', this.width/2)
    .text(msg);
  msgWidth = this.message.style('width');
  msgWidth = parseInt(msgWidth.substring(0, msgWidth.length - 3), 10);
  this.message
    .attr('dx', (this.width - msgWidth)/2);
};

Stage.prototype.loadImage = function (e) {
  var self = this;
  this.setMessage('');
  e = e.originalEvent;
  e.preventDefault();
  window.loadImage(
    (e.dataTransfer || e.target).files[0],
    function(img) {
      var particleSet = new ParticleSet();
      particleSet.processImg(img);
      self.addParticleSet(particleSet);
    }, {
      maxWidth: this.width
    });
};

Stage.prototype.addParticleSet = function (ps) {
  var data = ps.getData(),
      vis = this.svg.selectAll('circle')
                .data(data, function(d,i) { return i; }),
      self = this;

  vis.enter().append('circle')
    .attr('cx', function(d, i) { return d.x; })
    .attr('cy', function(d,i) { return d.y; })
    .attr('r', ps.getStep())
    .attr('fill', function(d, i) { return d.color; })
    .attr('r', 0)
    .transition()
    .attr('r', 3);
  vis.exit().transition()
    .attr('r', 0).remove();
  this.transition(10,10, data, vis);
  this.vis = vis;
  $(this.container).click(function(e) {
    self.transition(e.clientX, e.clientY, data, vis);
  });
};

Stage.prototype.explode = function () {
  var xcompressor = d3.scale.linear().domain([0,1]).range([0,this.width]),
      ycompressor = d3.scale.linear().domain([0,1]).range([0,this.height]);
  this.svg.selectAll('circle').transition()
    .attr('cy', function(){ return ycompressor(Math.random()); })
    .attr('cx', function(){ return xcompressor(Math.random()); })
    .duration(1000)
    .ease('out-elastic',1,1);
};

Stage.prototype.transition = function (x, y, data, vis) {
  var xcompressor = d3.scale.linear().domain([0, 1]).range([0, this.width]),
      ycompressor = d3.scale.linear().domain([0, 1]).range([0, this.height]),
      rcompressor = d3.scale.linear().domain([0, 1]).range([20, 50]);

  vis.data(data, function(d,i) { return i; }).transition()
      .attr('cx', function(d, i) { return x + d.x/2; })
      .attr('cy', function(d,i) { return y + d.y/2; })
      .attr('r', 5)
      .attr('fill', function(d,i) { return d.color; })
      .duration(1000);
  vis.on('mouseover', function(){
    d3.select(this).transition()
    .attr('cy', function(){return ycompressor(Math.random());})
    .attr('cx', function(){return xcompressor(Math.random());})
    .duration(1000)
    .ease('out-elastic',1,1);});
};
