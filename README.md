## COMP5411 Rendering Project

This repository contains rendering projects for COMP5411, Advanced Computer Graphics. In this project, we are going to implement the following features:

### Features
- shadowmap: with and without PCF, [PCSS](http://developer.download.nvidia.com/shaderlibrary/docs/shadow_PCSS.pdf) technology
- mirror surfaces: reflection of the environment - [environment mapping](https://en.wikipedia.org/wiki/Reflection_mapping)
- [Projective texture mapping](http://mrl.nyu.edu/~dzorin/cg05/projection-tex.pdf)
- Object interaction within 3D scenario through GPU. [Github](https://github.com/brianxu/GPUPicker)
- [Depth map](https://en.wikipedia.org/wiki/Depth_map)
- various types of light source: point light, projection light, etc.
- Weather effect, such as cloudy and rainy, through [sprites](https://en.wikipedia.org/wiki/Sprite_(computer_graphics)).


### Implementation
- Using three.js to implement features.
- Nodejs server

### Usage
- `npm install`
- use `gulp dev` to start development
- open `localhost:5411/src/` in the browser
* **Need to restart `gulp dev` if the `server.js` file is modified.** Find the server and webpack log in the root directory `*.log` files.

### References:
- [three.js](https://threejs.org/)
- [python flask server](http://flask.pocoo.org/)
- [shader school](https://github.com/stackgl/shader-school)
