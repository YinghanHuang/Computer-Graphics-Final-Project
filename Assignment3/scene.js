"use strict";

var canvas;
var gl;

var numVerticesInAllSphereFaces;
var sphere_indices;
var sphere_vertices;
var sphere_object;
var sphere_normals;
var sphere_texture_coords;

var numVerticesInAllToroidFaces;
var toroid_indices;
var toroid_vertices;
var toroid_object;
var toroid_normals;
var toroid_texture_coords;

var aspect; // Viewport aspect ratio

// TODO: Uncomment the lines in this function when getOrderedNormalsFromObj() and
// getOrderedTextureCoordsFromObj() are completed.
function loadedSphere(data, _callback) {
  sphere_object = loadOBJFromBuffer(data);
  console.log("sphere", sphere_object);
  sphere_indices = sphere_object.i_verts;
  sphere_vertices = sphere_object.c_verts;
  numVerticesInAllSphereFaces = sphere_indices.length;
  sphere_normals = getOrderedNormalsFromObj(sphere_object);
  sphere_texture_coords = getOrderedTextureCoordsFromObj(sphere_object);
  _callback();
}

// TODO: Uncomment the lines in this function when getOrderedNormalsFromObj() and
// getOrderedTextureCoordsFromObj() are completed.
function loadedToroid(data, _callback) {
  toroid_object = loadOBJFromBuffer(data);
  console.log("toroid", toroid_object);
  toroid_indices = toroid_object.i_verts;
  // console.log("toroid_indices",toroid_indices);
  toroid_vertices = toroid_object.c_verts;
  console.log("toroid_vertices", toroid_vertices);
  numVerticesInAllToroidFaces = toroid_indices.length;
  toroid_normals = getOrderedNormalsFromObj(toroid_object);
  toroid_texture_coords = getOrderedTextureCoordsFromObj(toroid_object);
  console.log("toroid_texture_coords", toroid_texture_coords);
  _callback();
}

// TODO: Implement function to properly order the normals from the OBJ files.
// Hint: look at the console log for the toroid or sphere objects.
function getOrderedNormalsFromObj(obj_object) {
  var normalsOrderedWithVertices = [];
  normalsOrderedWithVertices = obj_object.c_norms;
  return normalsOrderedWithVertices;
}

// TODO: Implement function to properly order the texture coordinates from the OBJ files.
// Hint: look at the console log for the toroid or sphere objects.
function getOrderedTextureCoordsFromObj(obj_object) {
  var texCoordsOrderedWithVertices = [];
  // console.log("obj_object.c_uvt", obj_object.c_uvt);
  texCoordsOrderedWithVertices.length = obj_object.i_verts.length;
  // console.log("texCoordsOrderedWithVertices", texCoordsOrderedWithVertices);
  var i;
  for (i = 1; i < texCoordsOrderedWithVertices.length; i++) {
    var m = obj_object.i_verts[i - 1];
    var n = obj_object.i_uvt[i - 1];
    texCoordsOrderedWithVertices[2 * m] = obj_object.c_uvt[2 * n];
    texCoordsOrderedWithVertices[2 * m + 1] = obj_object.c_uvt[2 * n + 1];
  }
  return texCoordsOrderedWithVertices;
}

// You probably don't want to edit this function.
function readToroid() {
  loadOBJFromPath("toroid.obj", loadedToroid, setupAfterDataLoad);
}

var texture1;
var texture2;

// You probably don't want to edit this function.
function configureTexture(image) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

function setupAfterDataLoad() {
  gl.enable(gl.DEPTH_TEST);

  setupFirstShaderBuffers();

  setupSecondShaderBuffers();

  var image = document.getElementById("texImage");
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.uniform1i(gl.getUniformLocation(program_texture_shader, "texture"), 0);
  texture1 = configureTexture(image);

  var image2 = document.getElementById("texImage2");
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.uniform1i(gl.getUniformLocation(program_texture_shader2, "texture2"), 1);
  texture2 = configureTexture(image2);

  render();
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  aspect = canvas.width / canvas.height;
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  ellipse();

  // Load OBJ file using objLoader.js functions
  // This loads the sphere and then loads the toroid in the callback.
  loadOBJFromPath("sphere2.obj", loadedSphere, readToroid);
};

var program_texture_shader, program_texture_shader2;
var vBuffer, vBuffer2;
var vPosition, vPosition2;
var texCoord, texCoord2;
var normal, normal2;
var iBuffer, iBuffer2;
var vtBuffer, vtBuffer2;
var nBuffer, nBuffer2;
var projectionMatrixLoc2, modelViewMatrixLoc2;
var projectionMatrixLoc, modelViewMatrixLoc;
var lightPositionLoc;

// TODO: Edit this function as needed.
function setupFirstShaderBuffers() {
  //  Load shaders and initialize attribute buffers
  program_texture_shader = initShaders(
    gl,
    "vertex-shader-texture",
    "fragment-shader-texture"
  );
  gl.useProgram(program_texture_shader);

  // array element buffer
  iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(toroid_indices),
    gl.STATIC_DRAW
  );

  // vertex array attribute buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(toroid_vertices),
    gl.STATIC_DRAW
  );

  modelViewMatrixLoc = gl.getUniformLocation(
    program_texture_shader,
    "modelViewMatrix"
  );
  projectionMatrixLoc = gl.getUniformLocation(
    program_texture_shader,
    "projectionMatrix"
  );

  vPosition = gl.getAttribLocation(program_texture_shader, "vPosition");

  vtBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vtBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(toroid_texture_coords),
    gl.STATIC_DRAW
  );
  texCoord = gl.getAttribLocation(program_texture_shader, "texCoord");

  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(toroid_normals),
    gl.STATIC_DRAW
  );
  normal = gl.getAttribLocation(program_texture_shader, "normal");

  console.log("texcoord", texCoord, "vposition", vPosition);
}

// TODO: Edit this function as needed.
function setupSecondShaderBuffers() {
  // add a second shader
  program_texture_shader2 = initShaders(
    gl,
    "vertex-shader-texture2",
    "fragment-shader-texture2"
  );
  gl.useProgram(program_texture_shader2);

  // array element buffer
  iBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer2);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(sphere_indices),
    gl.STATIC_DRAW
  );

  // vertex array attribute buffer
  vBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(sphere_vertices),
    gl.STATIC_DRAW
  );

  modelViewMatrixLoc2 = gl.getUniformLocation(
    program_texture_shader2,
    "modelViewMatrix"
  );
  projectionMatrixLoc2 = gl.getUniformLocation(
    program_texture_shader2,
    "projectionMatrix"
  );

  vPosition2 = gl.getAttribLocation(program_texture_shader2, "vPosition");

  vtBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vtBuffer2);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(sphere_texture_coords),
    gl.STATIC_DRAW
  );
  texCoord = gl.getAttribLocation(program_texture_shader, "texCoord");

  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(toroid_normals),
    gl.STATIC_DRAW
  );
  normal = gl.getAttribLocation(program_texture_shader, "normal");

  // console.log("texcoord", texCoord, "vposition", vPosition);
}

// TODO: Edit this function as needed.
function renderFirstObject() {
  // 1st object shader
  gl.useProgram(program_texture_shader);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, vtBuffer);
  gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoord);

  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normal);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  gl.uniform4iv(lightPositionLoc, lightPosition);
  // console.log(vtBuffer);
  gl.drawElements(
    gl.TRIANGLES,
    numVerticesInAllToroidFaces,
    gl.UNSIGNED_SHORT,
    0
  );
}

// TODO: Edit this function as needed.
function renderSecondObject() {
  // 2nd object shader
  gl.useProgram(program_texture_shader2);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer2);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
  gl.vertexAttribPointer(vPosition2, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition2);

  gl.bindBuffer(gl.ARRAY_BUFFER, vtBuffer2);
  gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoord);

  gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc2, false, flatten(projectionMatrix));

  // console.log(numVerticesInAllSphereFaces);
  gl.drawElements(
    gl.TRIANGLES,
    numVerticesInAllSphereFaces,
    gl.UNSIGNED_SHORT,
    0
  );
}

var circlePoints = [];
var circleNormal;
var rotationSpeed;
// TODO: implement this function to return an ellipical camera path.
// The ellipse should have its center at the origin and should lie in the plane x = y in 3D.
// For hint, see: https://web.archive.org/web/20181018084937/http://mathforum.org/library/drmath/view/63373.html
// The function should set global variables circlePoints and circleNormal.
function ellipse() {
  var a = 1.0; //the short radius of ellipse
  var b = 2.0; //the long radius of ellipse
  circlePoints[0] = Math.sin((rotationSpeed * Math.PI) / 180) * a;
  circlePoints[1] = Math.cos((rotationSpeed * Math.PI) / 180) * b;
}

var modelViewMatrix, projectionMatrix;
var lightPosition;

// TODO: Edit this function as needed.
var t_last = Date.now();
console.clear;
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var now = Date.now();
  var span = now - t_last;
  var step = 0.1;
  rotationSpeed = span * step;
  // console.log(rotationSpeed);
  ellipse();
  // console.log(circlePoints[0], circlePoints[1]);
  var scale = 10;
  //Setup ModelView and Projection Matrices.
  var eye = vec3(circlePoints[0] * scale, circlePoints[1] * scale, scale * 0.5);
  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0.0, 0.0, 1.0);

  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(55, 1.0, 2.0, -2.0);
  lightPosition = vec4(
    circlePoints[0] * scale,
    circlePoints[1] * scale,
    scale * 0.5,
    1.0
  );
  var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);


  //   projectionMatrix = ortho(
  //     -1.0 * scale,
  //     1.0 * scale,
  //     -1.0 * scale,
  //     1.0 * scale,
  //     -1.0 * scale,
  //     1.0 * scale
  //   );

  renderFirstObject();

  renderSecondObject();

  requestAnimFrame(render);
}
