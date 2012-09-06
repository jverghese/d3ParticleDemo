[d3ParticleDemo](http://jverghese.github.com/d3ParticleDemo)
================
Simple particle system demo built using d3. Click the link above. Drag and drop your images to transform them to particles.  

Decrease step-size to increase photorealism but at the cost of performance. Currently the default is at 10 which favors medium-sized images.

Code Structure:  
ParticleSet manages a set of particles belonging to say an image.  
Stage manages where the particles are displayed and transitions between particle sets.  

```js
var Stage = new Stage(container);
```

Dependencies
------------
d3js - https://github.com/mbostock/d3  
Javascript Load Image - https://github.com/blueimp/JavaScript-Load-Image

Contributing
------------
Contributions/fixes are most welcome. Thank you!

Todo
------------
* Auto step calculation based on image resolution.
* Add canvas/webgl renderer.
* Add image thumbnails and transition sequence.
* More effects like rain, page in.
