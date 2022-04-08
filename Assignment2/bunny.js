"use strict";

var canvas;
var gl;
const TRANSLATE_STEP = 100;
const ROTATE_STEP = 100;
var numVerticesInAllBunnyFaces;

var bunny_indices;
var bunny_vertices;
var bunny_vertex_colors;
var m;
var endX = 0;
var endY = 0;
var tx = 0;
var ty = 0;
var flag = 0;
var upupdateAll, downupdateAll, leftupdateAll, rightupdateAll, clickupdateALL;

// We're starting out by rendering this cube with tmp_vertices and tmp_indices.
// TODO: Change the file to render the bunny shape and then delete these two variables.

// You probably don't want to change this function.
function loaded(data, _callback) {
  m = loadOBJFromBuffer(data);
  console.log(m);
  bunny_indices = m.i_verts;
  bunny_vertices = m.c_verts;
  numVerticesInAllBunnyFaces = bunny_vertices.length;
  bunny_vertex_colors = assign_vertex_colors(bunny_vertices);
  _callback();
}

// TODO: Write this function.
function assign_vertex_colors(input_vertices) {
  var color = new Array(input_vertices.length);
  var min = input_vertices[0];
  var max = input_vertices[0];
  //the color of x R
  for (var i = 0; i < input_vertices.length; i = i + 3) {
    if (input_vertices[i] < min) {
      min = input_vertices[i];
    }
    if (input_vertices[i] > max) {
      max = input_vertices[i];
    }
  }
  var range = max - min;
  for (var i = 0; i < input_vertices.length; i = i + 3) {
    color[i] = (input_vertices[i] - min) / range;
  }
  console.log(max);
  console.log(min);

  //the color of y G
  max = input_vertices[1];
  min = input_vertices[1];
  for (var i = 1; i < input_vertices.length; i = i + 3) {
    if (input_vertices[i] < min) {
      min = input_vertices[i];
    }
    if (input_vertices[i] > max) {
      max = input_vertices[i];
    }
  }
  var range = max - min;
  for (var i = 1; i < input_vertices.length; i = i + 3) {
    color[i] = (input_vertices[i] - min) / range;
  }
  console.log(max);
  console.log(min);

  //the color of z B
  max = input_vertices[2];
  min = input_vertices[2];
  for (var i = 2; i < input_vertices.length; i = i + 3) {
    if (input_vertices[i] < min) {
      min = input_vertices[i];
    }
    if (input_vertices[i] > max) {
      max = input_vertices[i];
    }
  }
  var range = max - min;
  for (var i = 2; i < input_vertices.length; i = i + 3) {
    color[i] = (input_vertices[i] - min) / range;
  }
  console.log(max);
  console.log(min);
  return color;
}

// You probably don't want to change this function.
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  // Load OBJ file using objLoader.js functions
  // These callbacks ensure the data is loaded before rendering occurs.
  loadOBJFromPath("bunny.obj", loaded, setup_after_data_load);
};

// TODO: Edit this function.
window.addEventListener(
  "keydown",
  function () {
    switch (event.keyCode) {
      case 38:
        {
          console.log("upkeydown");
          flag = 1;
        } // up arrow key
        break;
      case 40:
        {
          console.log("downkeydown");
          flag = 2;
        } // down arrow key
        break;
      case 37:
        {
          console.log("leftkeydown");
          flag = 3;
        } // left arrow key
        break;
      case 39:
        {
          console.log("rightdown");
          flag = 4;
        } // right arrow key
        break;
      case 32:
        {
          console.log("spacebardown");
          flag = 0;
        } // spacebar
        break;
    }
  },
  true
);

// TODO: Edit this function.
function setup_after_data_load() {
  gl.enable(gl.DEPTH_TEST);
  // Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Array element buffer
  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(bunny_indices),
    gl.STATIC_DRAW
  );

  // Vertex array attribute buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(bunny_vertices),
    gl.STATIC_DRAW
  );

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Load the color data into the GPU
  var bufferIdColors = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdColors);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(bunny_vertex_colors),
    gl.STATIC_DRAW
  );

  // Associate shader variables with our vertex data buffer.
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
  console.log(bunny_vertex_colors);

  //bunny state init
  var jscale;
  var scale = gl.getUniformLocation(program, "scale");
  var cosB, sinB;
  var formMatrix = new Float32Array([
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
  ]);
  var rotate = gl.getUniformLocation(program, "rotate");
  gl.uniformMatrix4fv(rotate, false, formMatrix);
  var rotateA = gl.getUniformLocation(program, "rotateA");
  gl.uniformMatrix4fv(rotateA, false, formMatrix);
  var jtranslation = new Float32Array([
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
  ]);
  var translation = gl.getUniformLocation(program, "translation");
  gl.uniformMatrix4fv(translation, false, jtranslation);
  console.log(tx, ty);

  //update everyframe
  var B = 0;
  var t_last = Date.now();
  function upupdate() {
    var now = Date.now();
    var span = now - t_last;
    t_last = now;
    B += (span * ROTATE_STEP) / 1000;
    sinB = Math.sin((B * Math.PI) / 180);
    cosB = Math.cos((B * Math.PI) / 180);
    var xformMatrix = new Float32Array([
      1.0,
      0.0,
      0.0,
      0.0, //
      0.0,
      cosB,
      -sinB,
      0.0, //
      0.0,
      sinB,
      cosB,
      0.0, //
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    var rotateA = gl.getUniformLocation(program, "rotateA");
    gl.uniformMatrix4fv(rotateA, false, xformMatrix);
    console.log(xformMatrix);
  }
  upupdateAll = upupdate;

  var B = 0;
  var t_last = Date.now();
  function downupdate() {
    var now = Date.now();
    var span = now - t_last;
    t_last = now;
    B -= (span * ROTATE_STEP) / 1000;
    sinB = Math.sin((B * Math.PI) / 180);
    cosB = Math.cos((B * Math.PI) / 180);
    var xformMatrix = new Float32Array([
      1.0,
      0.0,
      0.0,
      0.0, //
      0.0,
      cosB,
      -sinB,
      0.0, //
      0.0,
      sinB,
      cosB,
      0.0, //
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    var rotateA = gl.getUniformLocation(program, "rotateA");
    gl.uniformMatrix4fv(rotateA, false, xformMatrix);
    console.log(xformMatrix);
  }
  downupdateAll = downupdate;

  var B = 0;
  var t_last = Date.now();
  function leftupdate() {
    var now = Date.now();
    var span = now - t_last;
    t_last = now;
    B += (span * ROTATE_STEP) / 1000;
    sinB = Math.sin((B * Math.PI) / 180);
    cosB = Math.cos((B * Math.PI) / 180);
    var xformMatrix = new Float32Array([
      cosB,
      0.0,
      sinB,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      -sinB,
      0.0,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    var rotateA = gl.getUniformLocation(program, "rotateA");
    gl.uniformMatrix4fv(rotateA, false, xformMatrix);
    console.log(xformMatrix);
  }
  leftupdateAll = leftupdate;

  var B = 0;
  var t_last = Date.now();
  function rightupdate() {
    var now = Date.now();
    var span = now - t_last;
    t_last = now;
    B -= (span * ROTATE_STEP) / 1000;
    sinB = Math.sin((B * Math.PI) / 180);
    cosB = Math.cos((B * Math.PI) / 180);
    var xformMatrix = new Float32Array([
      cosB,
      0.0,
      sinB,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      -sinB,
      0.0,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    var rotateA = gl.getUniformLocation(program, "rotateA");
    gl.uniformMatrix4fv(rotateA, false, xformMatrix);
    console.log(xformMatrix);
  }
  rightupdateAll = rightupdate;
  // Event listeners for button
  //front button
  document.getElementById("frontButton").onclick = function () {
    jscale = 1.0;
    gl.uniform1f(scale, jscale);
    document.getElementById("myRange").value = 10;
    gl.uniformMatrix4fv(rotate, false, formMatrix);
    gl.uniformMatrix4fv(translation, false, jtranslation);
    if (flag == 0) {
      var mformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
      ]);
      var rotateA = gl.getUniformLocation(program, "rotateA");
      gl.uniformMatrix4fv(rotateA, false, mformMatrix);
    }
  };
  //================
  //back button
  document.getElementById("backButton").onclick = function () {
    cosB = -1;
    sinB = 0;
    jscale = 1.0;
    var yformMatrix = new Float32Array([
      cosB,
      0.0,
      sinB,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      -sinB,
      0.0,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    gl.uniform1f(scale, jscale);
    gl.uniformMatrix4fv(rotate, false, yformMatrix);
    document.getElementById("myRange").value = 10;
    if (flag == 0) {
      var mformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
      ]);
      var rotateA = gl.getUniformLocation(program, "rotateA");
      gl.uniformMatrix4fv(rotateA, false, mformMatrix);
    }
  };
  //================
  //top button
  document.getElementById("topButton").onclick = function () {
    cosB = 0;
    sinB = 1;
    jscale = 1.0;
    var xformMatrix = new Float32Array([
      1.0,
      0.0,
      0.0,
      0.0,
      0.0,
      cosB,
      -sinB,
      0.0,
      0.0,
      sinB,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    gl.uniform1f(scale, jscale);
    gl.uniformMatrix4fv(rotate, false, xformMatrix);
    document.getElementById("myRange").value = 10;
    if (flag == 0) {
      var mformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
      ]);
      var rotateA = gl.getUniformLocation(program, "rotateA");
      gl.uniformMatrix4fv(rotateA, false, mformMatrix);
    }
  };
  //================
  //bottom button
  document.getElementById("bottomButton").onclick = function () {
    cosB = 0;
    sinB = -1;
    jscale = 1.0;
    var xformMatrix = new Float32Array([
      1.0,
      0.0,
      0.0,
      0.0,
      0.0,
      cosB,
      -sinB,
      0.0,
      0.0,
      sinB,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    gl.uniform1f(scale, jscale);
    gl.uniformMatrix4fv(rotate, false, xformMatrix);
    document.getElementById("myRange").value = 10;
    if (flag == 0) {
      var mformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
      ]);
      var rotateA = gl.getUniformLocation(program, "rotateA");
      gl.uniformMatrix4fv(rotateA, false, mformMatrix);
    }
  };
  //===============
  //left button
  document.getElementById("leftButton").onclick = function () {
    cosB = 0;
    sinB = 1;
    jscale = 1.0;
    var yformMatrix = new Float32Array([
      cosB,
      0.0,
      sinB,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      -sinB,
      0.0,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    gl.uniform1f(scale, jscale);
    gl.uniformMatrix4fv(rotate, false, yformMatrix);
    document.getElementById("myRange").value = 10;
    if (flag == 0) {
      var mformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
      ]);
      var rotateA = gl.getUniformLocation(program, "rotateA");
      gl.uniformMatrix4fv(rotateA, false, mformMatrix);
    }
  };
  //===================
  //right button
  document.getElementById("rightButton").onclick = function () {
    cosB = 0;
    sinB = -1;
    jscale = 1.0;
    var yformMatrix = new Float32Array([
      cosB,
      0.0,
      sinB,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      -sinB,
      0.0,
      cosB,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    gl.uniform1f(scale, jscale);
    gl.uniformMatrix4fv(rotate, false, yformMatrix);
    document.getElementById("myRange").value = 10;
    if (flag == 0) {
      var mformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
      ]);
      var rotateA = gl.getUniformLocation(program, "rotateA");
      gl.uniformMatrix4fv(rotateA, false, mformMatrix);
    }
  };
  //=====================

  //slide bar
  document.getElementById("myRange").onchange = function () {
    jscale = this.value / 10;
    console.log(jscale);
    var scale = gl.getUniformLocation(program, "scale");
    gl.uniform1f(scale, jscale);
  };

  //mousedown
  canvas.addEventListener("mousedown", doMouseDown, true);
  function getLocation(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height),
    };
  }
  var once;
  function doMouseDown(e) {
    var location = getLocation(e.clientX, e.clientY);
    endX = location.x;
    endY = location.y;
    // console.log(finalX, finalY);
    flag = 5;
    once = 0;
    console.clear();
  }

  var x = 0;
  var y = 0;
  var t_last = Date.now();

  function clickupdate() {
    if (once == 0) {
      t_last = Date.now();
      once = 1;
    }
    flag = 5;
    var now = Date.now();
    var span = now - t_last;
    t_last = now;
    var finalX = (endX - 256) / 256;
    var finalY = -(endY - 256) / 256;
    var prop = Math.abs(x - finalX) / Math.abs(y - finalY);
    console.log(finalX, finalY);

    if (x > finalX) {
      tx = x - (span * TRANSLATE_STEP * prop) / 100000;
      x = tx;
      if (tx <= finalX) {
        tx = finalX;
      }
    }
    if (x <= finalX) {
      tx = x + (span * TRANSLATE_STEP * prop) / 100000;
      x = tx;
      if (tx >= finalX) {
        tx = finalX;
      }
    }
    if (y > finalY) {
      ty = y - (span * TRANSLATE_STEP) / 100000;
      y = ty;
      if (ty <= finalY) {
        ty = finalY;
      }
    }
    if (y <= finalY) {
      ty = y + (span * TRANSLATE_STEP) / 100000;
      y = ty;
      if (ty >= finalY) {
        ty = finalY;
      }
    }
    if (tx == finalX && ty == finalY) {
      flag = 0;
    }
    var jtranslation = new Float32Array([
      1.0,
      0.0,
      0.0,
      tx,
      0.0,
      1.0,
      0.0,
      ty,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
    var translation = gl.getUniformLocation(program, "translation");
    gl.uniformMatrix4fv(translation, false, jtranslation);
    console.log(tx, ty);
    console.log(flag);
  }
  clickupdateALL = clickupdate;
  render();
}

// TODO: Edit this function.
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, bunny_indices.length, gl.UNSIGNED_SHORT, 0);
  if (flag == 1) {
    upupdateAll();
  }
  if (flag == 2) {
    downupdateAll();
  }
  if (flag == 3) {
    leftupdateAll();
  }
  if (flag == 4) {
    rightupdateAll();
  }
  if (flag == 5) {
    clickupdateALL();
  }
  requestAnimFrame(render);
}
