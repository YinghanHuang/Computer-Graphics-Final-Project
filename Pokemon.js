var time, showTime, startBn, restBn, pauseDate;

var bool = false;
var running = false;
var pauseTime = 0;
var mapsatatus = true;

init();
function init() {
  showTime = document.getElementById("showTime");
  startBn = document.getElementById("startBn");
  restBn = document.getElementById("restBn");
  setInterval(animation, 16);
}
//timer==============================================================================================
function animation() {
  if (!bool) return;
  var times = new Date().getTime() - time - pauseTime;
  var minutes = Math.floor(times / 60000);
  var seconds = Math.floor((times - minutes * 60000) / 1000);
  var ms = Math.floor((times - minutes * 60000 - seconds * 1000) / 10);
  showTime.innerHTML =
    (minutes < 10 ? "0" + minutes : minutes) +
    ":" +
    (seconds < 10 ? "0" + seconds : seconds) +
    ":" +
    (ms < 10 ? "0" + ms : ms);
}

//generate maze map.==================================================================================
var oC2 = document.getElementById("c2d");
var mazemap = oC2.getContext("2d");
var width = oC2.width;
var height = oC2.height;
var maxX = 18;
var maxY = 13;

var firstGrid;
var endGrid;

function Grid(x, y) {
  this.x = x;
  this.y = y;
  this.choosed = false;
  this.children = [];
  this.initNeighbor();
}

Grid.prototype.initNeighbor = function () {
  var x = this.x;
  var y = this.y;

  this.neighbor = [];

  if (y > 0) {
    this.neighbor.push({
      x: x,
      y: y - 1,
    });
  }

  if (y < maxY) {
    this.neighbor.push({
      x: x,
      y: y + 1,
    });
  }

  if (x > 0) {
    this.neighbor.push({
      x: x - 1,
      y: y,
    });
  }

  if (x < maxX) {
    this.neighbor.push({
      x: x + 1,
      y: y,
    });
  }

  this.neighbor.sort(function () {
    return 0.5 - Math.random();
  });
};

Grid.prototype.getNeighbor = function () {
  var x, y, neighbor;

  this.choosed = true;

  for (var i = 0; i < this.neighbor.length; i++) {
    x = this.neighbor[i].x;
    y = this.neighbor[i].y;

    neighbor = maze.grids[y][x];

    if (!neighbor.choosed) {
      neighbor.parent = this;

      return neighbor;
    }
  }

  if (this.parent === firstGrid) {
    return 0;
  } else {
    return 1;
  }
};

function Maze() {
  this.path = [];
  this.grids = [];
  this.stack = [];
  this.init();
}

Maze.prototype.init = function () {
  for (var i = 0; i <= maxY; i++) {
    this.grids[i] = [];
    for (var j = 0; j <= maxX; j++) {
      this.grids[i][j] = new Grid(j, i);
    }
  }

  firstGrid = this.grids[0][0];
  endGrid = this.grids[13][10];
};

Maze.prototype.findPath = function () {
  var tmp;
  var curr = firstGrid;
  while (1) {
    tmp = curr.getNeighbor();

    if (tmp === 0) {
      console.log("Maze successfully genegated");
      break;
    } else if (tmp === 1) {
      curr = curr.parent;
    } else {
      curr.children[curr.children.length] = tmp;
      curr = tmp;
    }
  }
};

function drawPath(node) {
  var i = 0;
  drawRect(node.x * 20, node.y * 20);
  for (; i < node.children.length; i++) {
    if (node.children[i]) {
      drawRect(
        node.x * 20 + (node.children[i].x - node.x) * 10,
        node.y * 20 + (node.children[i].y - node.y) * 10
      ); //  the path you've moved.
      drawPath(node.children[i]);
      // console.log(node.children[i].x, node.children[i].y);
    }
  }
}

function drawRect(x, y) {
  mazemap.fillRect(x + 10, y + 10, 10, 10);
}
// if crush the maze's wall.
function drawCrush(x, y, color) {
  // return ;
  mazemap.beginPath();
  mazemap.fillStyle = color;
  mazemap.arc(x, y, 1, 0, Math.PI * 2, false);
  mazemap.fill();
  mazemap.closePath();
}

mazemap.fillStyle = "black";
mazemap.fillRect(0, 0, width, height);
mazemap.fillStyle = "white";

var maze = new Maze();

maze.findPath();

drawPath(firstGrid);

drawStartEnd();

function drawStartEnd() {
  mazemap.fillRect(0, 10, 10, 10);
  mazemap.fillRect(19 * 20, 13 * 20 + 10, 10, 10);
  setTimeout(function () {
    // role.hide();
  }, 3000);
}

var rowWall = [];
var colWall = [];
var texData;

getWall();

function getWall() {
  texData = mazemap.getImageData(0, 0, width, height).data;

  getRowWall();
  getColWall();
}

function getRowWall() {
  var i = 0;
  var j = 0;
  var x1, x2;
  // console.log('getRowWall');
  for (; i < height; i += 10) {
    rowWall[i] = [];
    j = 0;
    while (j < width) {
      if (isBlack(j, i)) {
        x1 = j;

        j += 10;
        while (isBlack(j, i) && j < width) {
          j += 10;
        }

        x2 = j;
        if (x2 - x1 > 10) {
          rowWall[i].push({
            x1: 2 * (x1 / width) - 1,
            x2: 2 * (x2 / width) - 1,
          });
        }
      }

      j += 10;
    }
  }
}

function getColWall() {
  var i = 0;
  var j = 0;
  var y1, y2;
  // console.log('getRowWall');
  for (; i < width; i += 10) {
    colWall[i] = [];
    j = 0;
    while (j < height) {
      if (isBlack(i, j)) {
        y1 = j;

        j += 10;
        while (isBlack(i, j) && j < height) {
          j += 10;
        }

        y2 = j;
        if (y2 - y1 > 10) {
          colWall[i].push({
            y1: 2 * (y1 / height) - 1,
            y2: 2 * (y2 / height) - 1,
          });
        }
      }

      j += 10;
    }
  }

  // console.log(colWall);
}

function getPix(x, y) {
  var start = y * width * 4 + x * 4;
  var r = texData[start];
  var g = texData[start + 1];
  var b = texData[start + 2];
  var a = texData[start + 3];

  return [r, g, b, a];
}

function isBlack(x, y) {
  x += 1;
  y += 1;
  var start = x * 4 + y * width * 4;
  var r = texData[start];

  if (r === 0) {
    return true;
  } else {
    return false;
  }
}
//debug if camera crush the maze's wall
/*function isWall(x, y, cx, cy) {
            var start, r;
            var retX = true,
                retY = true;

            x += ((1 * cx) >> 0);

            if(x > 0 && y > 0) {
                start = y * width * 4 + x * 4;
                r = texData[start];
                if(r === 0) {
                   drawCrush(x, y, 'yellow');
                    retX = false;
                }
            }

            x -= (1 * cx);
            y += (1 * cy);
            if(y > 0 && x > 0) {
                start = y * width * 4 + x * 4;
                r = texData[start];
                if(r === 0) {
                    drawCrush(x, y, 'yellow');
                    retY = false;
                }
            }
            
            return {
                x: retX,
                y: retY
            };
        }*/

// generate maze in 3D with webgl
var canvas = document.getElementById("c3d");
var gl = canvas.getContext("webgl");

var vsScript = document.getElementById("vertex-shader").innerText;
var fsScript = document.getElementById("fragment-shader").innerText;

var vs = gl.createShader(gl.VERTEX_SHADER);
var fs = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vs, vsScript);
gl.shaderSource(fs, fsScript);

gl.compileShader(vs);
if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
  alert("vs error");
}
gl.compileShader(fs);
if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
  alert("fs error");
}

var program = gl.createProgram();

gl.attachShader(program, vs);
gl.attachShader(program, fs);

gl.linkProgram(program);
gl.useProgram(program);

var aVertex = gl.getAttribLocation(program, "aVertex");
var aColor = gl.getAttribLocation(program, "aColor");
var aMp = gl.getAttribLocation(program, "aMp");
var uPMatrix = gl.getUniformLocation(program, "uPMatrix");
var uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");
var uCRMatrix = gl.getUniformLocation(program, "uCRMatrix");
var uCMVMatrix = gl.getUniformLocation(program, "uCMVMatrix");
var uTex = gl.getUniformLocation(program, "uTex");
var isMaze = gl.getUniformLocation(program, "isMaze");

gl.enableVertexAttribArray(aVertex);
gl.disableVertexAttribArray(aColor);
gl.enableVertexAttribArray(aMp);

var position = [];
var index_data = [];
var mp_data = [];
var item, tmp;
var s = 0;
var k;
var count = 0;

var ground = Object.create(null);
position = [-20, -1.1, 20, 20, -1.1, 20, 20, -1.1, -20, -20, -1.1, -20];
index_data = [0, 1, 2, 2, 3, 0];

ground.poBuf = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, ground.poBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

ground.indexBuf = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground.indexBuf);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(index_data),
  gl.STATIC_DRAW
);

position = [];
index_data = [];

var k;

for (var i = 0; i < rowWall.length; i += 10) {
  // rowWall.length
  item = rowWall[i];
  while ((tmp = item.pop())) {
    k1 = (2 * i) / height - 1;
    k2 = (2 * (i + 10)) / height - 1;
    position.push.apply(position, [
      tmp.x1 * 120 + 0.01,
      -1.09,
      k1 * 120, // upperleft
      tmp.x2 * 120 + 0.01,
      -1.09,
      k1 * 120, // underleft
      tmp.x2 * 120 + 0.01,
      0.2,
      k1 * 120, // upperright
      tmp.x1 * 120 + 0.01,
      0.2,
      k1 * 120, // downright

      tmp.x2 * 120 + 0.01,
      -1.09,
      k1 * 120,
      tmp.x2 * 120 + 0.01,
      -1.09,
      k2 * 120,
      tmp.x2 * 120 + 0.01,
      0.2,
      k2 * 120,
      tmp.x2 * 120 + 0.01,
      0.2,
      k1 * 120,

      tmp.x1 * 120 + 0.01,
      -1.09,
      k2 * 120,
      tmp.x2 * 120 + 0.01,
      -1.09,
      k2 * 120,
      tmp.x2 * 120 + 0.01,
      0.2,
      k2 * 120,
      tmp.x1 * 120 + 0.01,
      0.2,
      k2 * 120,

      tmp.x1 * 120 + 0.01,
      -1.09,
      k1 * 120,
      tmp.x1 * 120 + 0.01,
      -1.09,
      k2 * 120,
      tmp.x1 * 120 + 0.01,
      0.2,
      k2 * 120,
      tmp.x1 * 120 + 0.01,
      0.2,
      k1 * 120,

      tmp.x1 * 120 + 0.01,
      0.2,
      k1 * 120,
      tmp.x2 * 120 + 0.01,
      0.2,
      k1 * 120,
      tmp.x2 * 120 + 0.01,
      0.2,
      k2 * 120,
      tmp.x1 * 120 + 0.01,
      0.2,
      k1 * 120,
    ]);

    count += 6 * 5;

    for (k = 0; k < 5; k++) {
      index_data.push(s, s + 1, s + 2, s + 2, s + 3, s);
      s += 4;
    }

    mp_data.push.apply(
      mp_data,
      [
        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,
      ]
    );
  }
}

maze.row = Object.create(null);
maze.row.count = count;

maze.row.poBuf = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, maze.row.poBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

maze.row.mpBuf = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, maze.row.mpBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mp_data), gl.STATIC_DRAW);

maze.row.indexBuf = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, maze.row.indexBuf);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(index_data),
  gl.STATIC_DRAW
);

s = 0;
count = 0;
position = [];
mp_data = [];
index_data = [];

// k1 k2 represents X axis
for (i = 0; i < colWall.length; i += 10) {
  item = colWall[i];
  while ((tmp = item.pop())) {
    k1 = 2 * (i / width) - 1;
    k2 = 2 * ((i + 10) / width) - 1;
    position.push.apply(position, [
      k1 * 120,
      -1.09,
      tmp.y1 * 120 + 0.01,
      k1 * 120,
      -1.09,
      tmp.y2 * 120 + 0.01,
      k1 * 120,
      0.2,
      tmp.y2 * 120 + 0.01,
      k1 * 120,
      0.2,
      tmp.y1 * 120 + 0.01,

      k1 * 120,
      -1.09,
      tmp.y1 * 120 + 0.01,
      k2 * 120,
      -1.09,
      tmp.y1 * 120 + 0.01,
      k2 * 120,
      0.2,
      tmp.y1 * 120 + 0.01,
      k1 * 120,
      0.2,
      tmp.y1 * 120 + 0.01,

      k2 * 120,
      -1.09,
      tmp.y1 * 120 + 0.01,
      k2 * 120,
      -1.09,
      tmp.y2 * 120 + 0.01,
      k2 * 120,
      0.2,
      tmp.y2 * 120 + 0.01,
      k2 * 120,
      0.2,
      tmp.y1 * 120 + 0.01,

      k1 * 120,
      -1.09,
      tmp.y2 * 120 + 0.01,
      k2 * 120,
      -1.09,
      tmp.y2 * 120 + 0.01,
      k2 * 120,
      0.2,
      tmp.y2 * 120 + 0.01,
      k1 * 120,
      0.2,
      tmp.y2 * 120 + 0.01,

      k1 * 120,
      0.2,
      tmp.y1 * 120 + 0.01,
      k1 * 120,
      0.2,
      tmp.y2 * 120 + 0.01,
      k2 * 120,
      0.2,
      tmp.y2 * 120 + 0.01,
      k2 * 120,
      0.2,
      tmp.y1 * 120 + 0.01,
    ]);

    count += 6 * 5;
    // count += (6);

    for (k = 0; k < 5; k++) {
      index_data.push(s, s + 1, s + 2, s + 2, s + 3, s);
      s += 4;
    }

    mp_data.push.apply(
      mp_data,
      [
        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,

        2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 0.0, 0.0,
      ]
    );
  }
}

maze.col = Object.create(null);
maze.col.count = count;

maze.col.poBuf = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, maze.col.poBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

maze.col.mpBuf = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, maze.col.mpBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mp_data), gl.STATIC_DRAW);

maze.col.indexBuf = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, maze.col.indexBuf);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(index_data),
  gl.STATIC_DRAW
);

gl.uniformMatrix4fv(
  uPMatrix,
  false,
  (function (a, r, n, f) {
    a = 1 / Math.tan((a * Math.PI) / 360);

    return [
      a / r,
      0,
      0,
      0,
      0,
      a,
      0,
      0,
      0,
      0,
      -(f + n) / (f - n),
      -1,
      0,
      0,
      (-2 * f * n) / (f - n),
      0,
    ];
  })(90, c2d.width / c2d.height, 0.1, 100)
);

gl.enable(gl.DEPTH_TEST);

var imgRow = new Image();
var imgCol = new Image();

imgRow.onload = function () {
  maze.row.texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, maze.row.texture);
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_GL, true);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgRow);

  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

  gl.uniform1i(uTex, 0);

  gl.bindTexture(gl.TEXTURE_2D, null);

  imgRow.loaded = true;

  if (imgCol.loaded) {
    setInterval(function () {
      draw(a);
    }, 16);
  }
};
imgCol.onload = function () {
  maze.col.texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, maze.col.texture);
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_GL, true);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgCol);

  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

  gl.uniform1i(uTex, 0);

  gl.bindTexture(gl.TEXTURE_2D, null);

  imgCol.loaded = true;

  if (imgRow.loaded) {
    setInterval(function () {
      draw(a);
    }, 16);
  }
};

imgRow.src = "wall.jpg";
imgCol.src = "wall.jpg";

gl.enable(gl.DEPTH_TEST);

var a = Math.PI / 2;

function draw(a) {
  if (KEYS[UP]) camera.move(0.2);
  if (KEYS[DOWN]) camera.move(-0.2);
  // if (KEYS[RIGHT]) camera.move(0, 0.2);
  drawGround();
  drawMaze(a);
}

function drawMaze(a) {
  var sin = Math.sin(a);
  var c = Math.cos(a);

  gl.uniformMatrix4fv(uMVMatrix, false, [
    1 * c,
    0,
    -1 * sin,
    0,
    0,
    5,
    0,
    0,
    1 * sin,
    0,
    1 * c,
    0,
    0,
    0,
    -120.5,
    1,
  ]);

  gl.uniformMatrix4fv(uCMVMatrix, false, camera.toMatrix());

  gl.uniformMatrix4fv(
    uCRMatrix,
    false,
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );

  gl.uniform1i(isMaze, true);

  gl.bindBuffer(gl.ARRAY_BUFFER, maze.row.poBuf);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, maze.row.mpBuf);
  gl.vertexAttribPointer(aMp, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, maze.row.texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, maze.row.indexBuf);

  gl.drawElements(gl.TRIANGLES, maze.row.count, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, maze.col.poBuf);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, maze.col.mpBuf);
  gl.vertexAttribPointer(aMp, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, maze.col.texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, maze.col.indexBuf);

  gl.drawElements(gl.TRIANGLES, maze.col.count, gl.UNSIGNED_SHORT, 0);
}

function drawGround() {
  gl.vertexAttrib3f(aColor, 0.4, 0.3, 0.0);

  gl.uniformMatrix4fv(
    uMVMatrix,
    false,
    [15, 0, 0, 0, 0, 5, 0, 0, 0, 0, 15, 0, 0, 0, -100, 1]
  );

  gl.uniformMatrix4fv(uCMVMatrix, false, camera.toMatrix());

  gl.uniformMatrix4fv(
    uCRMatrix,
    false,
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );

  gl.uniform1i(isMaze, false);

  gl.bindBuffer(gl.ARRAY_BUFFER, ground.poBuf);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground.indexBuf);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

//pokemon===========

//===================
//camera
var cx, cy, ret;
var globalRot = window.innerWidth / 2;
var camera = {
  rot: 0,
  x: 0,
  y: 0,
  z: 0,
  move: function (e) {
    cx = Math.sin(-this.rot) * e;
    cy = Math.cos(-this.rot) * e;
    this.x += cx;
    this.z += cy;
    ret = role.check(-this.x / 120, this.z / 242, -cx, cy);
    if (ret.x === 0) {
      this.x -= cx;
    } else {
      role.x = ret.x;
    }
    if (ret.y === 0) {
      this.z -= cy;
    } else {
      role.y = ret.y;
    }
    role.update();
  },
  toMatrix: function () {
    var s = Math.sin(this.rot),
      c = Math.cos(this.rot),
      x = this.x,
      z = this.z;

    return [
      c,
      0,
      -s,
      0,
      0,
      1,
      0,
      0,
      s,
      0,
      c,
      0,
      c * x + s * z,
      1,
      c * z - s * x,
      1,
    ];
  },
};

var LEFT = 37,
  UP = 87,
  //  RIGHT = 39,
  DOWN = 83,
  KEYS = {};

// var tests = [64,69,63,64]; //enter test
// var isIntests = false;

document.onkeydown = function (e) {
  KEYS[e.keyCode] = true;
  switch (event.keyCode) {
    case 87:
      if (bool === false) {
        bool = !bool;
      }

      if (bool) {
        pauseTime += !pauseDate ? 0 : new Date().getTime() - pauseDate;
        if (running === true) {
          pauseDate = null;
        }

        if (time) return;
        time = new Date().getTime();
        console.log(bool);
        running = !running;
        return;
      }
      //   console.log(bool);
      //   role.show();
      return;

    case 80:
      if (bool === true) {
        bool = false;
      }
      pauseDate = new Date().getTime();
      //   role.hide();
      return;
    case 32:
      if (mapsatatus === true) {
        role.hide();
        mapsatatus = false;
        console.log("hide");
      } else {
        role.show();
        mapsatatus = true;
        console.log("show");
      }
  }
};
document.onkeyup = function (e) {
  KEYS[e.keyCode] = false;
};
// mouse listener
document.onmousemove = function (e) {
  var x = e.clientX;
  if (e.clientX <= 2) {
    camera.rot += -0.08;
  } else if (e.clientX >= window.innerWidth - 2) {
    camera.rot += 0.08;
  } else {
    camera.rot += (x - globalRot) / 100;
  }
  globalRot = x;
};

//   test code
// function dotests() {
//     var div = document.getElementById('Wrap');
//     div.style.transform = 'translateY(0)';

//     var test = document.getElementById('test');
//     test.focus();

//     isIntests = true;
// }

// function closetests() {
//     var div = document.getElementById('testWrap');
//     div.style.transform = 'translateY(0)';

//     var test = document.getElementById('test');

//     if (test.value.toLowerCase() === 'alloyteam') {
//         console.log('test mode');
//         role.show();
//         document.body.removeChild(div);
//     } else {
//         console.log('error');
//         test.value = '';
//         test.blur();
//         div.style.transform = 'translateY(150%)';
//     }

//     isIntests = false;
// }

function Role() {
  this.main = document.createElement("div");
  this.main.className = "role";

  this.diffTop = oC2.offsetTop;
  this.diffLeft = oC2.offsetLeft;
  this.disX = oC2.offsetHeight;
  this.disY = oC2.offsetWidth + 1;

  this.x = 145;
  this.y = -1;
  document.body.appendChild(this.main);
}

Role.prototype.update = function (x, y) {
  this.x0 = this.x - 1;
  this.x2 = this.x + 1;
  this.y0 = this.y - 1;
  this.y2 = this.y + 1;
  this.main.style.top = this.diffTop + this.x - 4 + "px";
  this.main.style.left = this.diffLeft + this.y - 8 + "px";
};

Role.prototype.isWall = function (cx, cy) {
  var points = [];
  var collision;
  var collisionX = true,
    collisionY = true;
  if (cx === -1) {
    points.push(
      {
        x: this.y0,
        y: this.x0,
      },
      {
        x: this.y0,
        y: this.x2,
      }
    );

    if (cy === -1) {
      points.push({
        x: this.y2,
        y: this.x0,
      });
    } else {
      points.push({
        x: this.y2,
        y: this.x2,
      });
    }
  } else {
    points.push(
      {
        x: this.y2,
        y: this.x0,
      },
      {
        x: this.y2,
        y: this.x2,
      }
    );

    if (cy === -1) {
      points.push({
        x: this.y0,
        y: this.x0,
      });
    } else {
      points.push({
        x: this.y0,
        y: this.x2,
      });
    }
  }

  for (var i = 0; i < 3; i++) {
    collision = this.pointCheck(points[i].x, points[i].y, cx, cy);

    if (!collision.x) {
      collisionX = false;
    }

    if (!collision.y) {
      collisionY = false;
    }

    if (!collisionX && !collisionY) {
      break;
    }
  }

  return {
    x: collisionX,
    y: collisionY,
  };
};

Role.prototype.pointCheck = function (x, y, cx, cy) {
  var start, r;
  var retX = true,
    retY = true;

  x = x >> 0;
  y = y >> 0;

  x += (1 * cx) >> 0;

  if (x > 0 && y > 0) {
    start = y * width * 4 + x * 4;
    r = texData[start];
    if (r === 0) {
      drawCrush(x, y, "red");
      retX = false;
    }
  }

  x -= 1 * cx;
  y += 1 * cy;
  if (y > 0 && x > 0) {
    start = y * width * 4 + x * 4;
    r = texData[start];
    if (r === 0) {
      drawCrush(x, y, "red");
      retY = false;
    }
  }

  return {
    x: retX,
    y: retY,
  };
};

Role.prototype.check = function (x, y, cx, cy) {
  var ret, data;
  x = (x / 2 + 0.5) * this.disX;
  y = y * this.disY;

  cx = Math.abs(cx) < 0.01 ? 0 : cx / Math.abs(cx);
  cy = Math.abs(cy) < 0.01 ? 0 : cy / Math.abs(cy);

  drawCrush(this.y >> 0, this.x >> 0, "blue");
  console.log(this.x, this.y);
  if (this.x >= 270 && this.x <= 276) {
    if (this.y >= 385 && this.y <= 391) {
      alert("Congrats, you find the wat out!!!!!!");
    }
  }
  ret = this.isWall(cy, cx);

  data = {
    x: ret.y === true ? x : 0,
    y: ret.x === true ? y : 0,
  };

  return data;
};

Role.prototype.hide = function () {
  c2d.style.opacity = 0;
  this.main.style.opacity = 0;
};

Role.prototype.show = function () {
  c2d.style.opacity = 1;
  this.main.style.opacity = 1;
};

var role = new Role();
role.update();
