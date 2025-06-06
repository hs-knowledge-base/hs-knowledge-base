# 浏览器API和Web API (二)：Canvas与WebGL图形处理

HTML5引入的Canvas和WebGL API使得在浏览器中创建高性能的2D和3D图形成为可能。这些强大的图形API让开发者能够构建从简单图表到复杂游戏的各种视觉体验。

## Canvas API

Canvas API提供了一个通过JavaScript和HTML的`<canvas>`元素来绘制图形的方式。它主要用于2D图形，但也是WebGL的基础。

### 基本用法

```javascript
// 获取Canvas元素
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 设置Canvas大小
canvas.width = 600;
canvas.height = 400;

// 绘制矩形
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 80);

// 绘制边框矩形
ctx.strokeStyle = 'red';
ctx.lineWidth = 3;
ctx.strokeRect(150, 10, 100, 80);

// 清除指定区域
ctx.clearRect(20, 20, 60, 40);
```

### 绘制路径

```javascript
// 绘制线条
ctx.beginPath();
ctx.moveTo(50, 150);
ctx.lineTo(150, 250);
ctx.lineTo(250, 150);
ctx.closePath(); // 闭合路径
ctx.strokeStyle = 'green';
ctx.stroke();

// 填充路径
ctx.beginPath();
ctx.moveTo(300, 150);
ctx.lineTo(400, 250);
ctx.lineTo(500, 150);
ctx.fillStyle = 'orange';
ctx.fill();

// 绘制圆形
ctx.beginPath();
ctx.arc(100, 300, 50, 0, Math.PI * 2);
ctx.fillStyle = 'purple';
ctx.fill();

// 绘制圆弧
ctx.beginPath();
ctx.arc(250, 300, 50, 0, Math.PI);
ctx.strokeStyle = 'brown';
ctx.lineWidth = 5;
ctx.stroke();
```

### 文本绘制

```javascript
// 设置文本样式
ctx.font = 'bold 24px Arial';
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// 填充文本
ctx.fillText('Hello Canvas!', 300, 50);

// 描边文本
ctx.strokeStyle = 'blue';
ctx.lineWidth = 1;
ctx.strokeText('Outlined Text', 300, 100);

// 测量文本宽度
const text = 'Measure this text';
const textWidth = ctx.measureText(text).width;
console.log(`Text width: ${textWidth}px`);
```

### 图像处理

```javascript
// 加载图像
const image = new Image();
image.src = 'example.jpg';

// 图像加载完成后绘制
image.onload = function() {
  // 绘制整个图像
  ctx.drawImage(image, 50, 350);
  
  // 绘制图像的一部分
  // 参数: 图像, 源x, 源y, 源宽, 源高, 目标x, 目标y, 目标宽, 目标高
  ctx.drawImage(image, 100, 100, 200, 200, 400, 350, 150, 150);
  
  // 图像数据操作
  const imageData = ctx.getImageData(50, 350, 100, 100);
  const data = imageData.data;
  
  // 反转颜色
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i];     // 红
    data[i + 1] = 255 - data[i + 1]; // 绿
    data[i + 2] = 255 - data[i + 2]; // 蓝
    // data[i + 3] 是透明度
  }
  
  // 将修改后的数据绘制回Canvas
  ctx.putImageData(imageData, 200, 350);
};
```

### 转换和动画

```javascript
// 保存当前状态
ctx.save();

// 平移坐标系
ctx.translate(300, 200);

// 旋转坐标系 (角度用弧度表示)
ctx.rotate(Math.PI / 4); // 旋转45度

// 缩放坐标系
ctx.scale(1.5, 0.5);

// 在变换后的坐标系中绘制
ctx.fillStyle = 'blue';
ctx.fillRect(-50, -50, 100, 100);

// 恢复到之前保存的状态
ctx.restore();

// 创建简单动画
let x = 0;
function animate() {
  // 清除Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制移动的圆
  ctx.beginPath();
  ctx.arc(x, 100, 20, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  
  // 更新位置
  x += 2;
  if (x > canvas.width) {
    x = 0;
  }
  
  // 请求下一帧
  requestAnimationFrame(animate);
}

// 开始动画
animate();
```

### 高级效果

```javascript
// 线段样式
ctx.beginPath();
ctx.moveTo(50, 450);
ctx.lineTo(550, 450);
ctx.lineWidth = 10;
ctx.lineCap = 'round'; // 'butt', 'round', 'square'
ctx.strokeStyle = 'blue';
ctx.stroke();

// 虚线
ctx.beginPath();
ctx.moveTo(50, 500);
ctx.lineTo(550, 500);
ctx.lineWidth = 5;
ctx.setLineDash([15, 5]); // 15px线, 5px间隔
ctx.strokeStyle = 'purple';
ctx.stroke();
ctx.setLineDash([]); // 重置为实线

// 渐变
const gradient = ctx.createLinearGradient(50, 550, 550, 550);
gradient.addColorStop(0, 'red');
gradient.addColorStop(0.5, 'green');
gradient.addColorStop(1, 'blue');

ctx.fillStyle = gradient;
ctx.fillRect(50, 550, 500, 50);

// 径向渐变
const radialGradient = ctx.createRadialGradient(300, 650, 10, 300, 650, 100);
radialGradient.addColorStop(0, 'white');
radialGradient.addColorStop(1, 'black');

ctx.fillStyle = radialGradient;
ctx.beginPath();
ctx.arc(300, 650, 100, 0, Math.PI * 2);
ctx.fill();

// 阴影效果
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;

ctx.fillStyle = 'orange';
ctx.fillRect(400, 600, 100, 100);
```

## 实用案例：图表绘制

```javascript
// 简单的柱状图
function drawBarChart(data, labels) {
  const canvas = document.getElementById('chartCanvas');
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const barSpacing = 10;
  
  // 清除画布
  ctx.clearRect(0, 0, width, height);
  
  // 找出最大值用于缩放
  const maxValue = Math.max(...data);
  
  // 计算每个柱子的宽度
  const barWidth = (width - padding * 2 - barSpacing * (data.length - 1)) / data.length;
  
  // 绘制坐标轴
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 绘制每个柱子
  for (let i = 0; i < data.length; i++) {
    const barHeight = ((height - padding * 2) * data[i]) / maxValue;
    const x = padding + i * (barWidth + barSpacing);
    const y = height - padding - barHeight;
    
    // 柱子
    ctx.fillStyle = `hsl(${i * 30}, 70%, 60%)`;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 柱子边框
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // 标签
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barWidth / 2, height - padding + 20);
    
    // 数值
    ctx.fillText(data[i].toString(), x + barWidth / 2, y - 10);
  }
}

// 使用图表
const data = [65, 42, 98, 56, 72];
const labels = ['A', 'B', 'C', 'D', 'E'];
drawBarChart(data, labels);
```

## WebGL

WebGL是一个用于在网页上渲染3D图形的JavaScript API。它基于OpenGL ES，直接访问GPU，提供硬件加速渲染能力。

### 基本设置

```javascript
// 获取WebGL上下文
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (!gl) {
  console.error('WebGL not supported');
}

// 设置视口大小
gl.viewport(0, 0, canvas.width, canvas.height);

// 设置清除颜色
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
```

### 绘制一个简单的三角形

```javascript
// 顶点着色器程序
const vsSource = `
  attribute vec4 aVertexPosition;
  
  void main() {
    gl_Position = aVertexPosition;
  }
`;

// 片段着色器程序
const fsSource = `
  precision mediump float;
  
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
  }
`;

// 编译着色器
function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

// 创建着色器程序
function createProgram(gl, vsSource, fsSource) {
  const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
  
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return null;
  }
  
  return program;
}

// 创建程序
const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

// 创建顶点缓冲区
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

// 定义三角形顶点（归一化坐标系）
const vertices = [
   0.0,  0.5,  0.0, // 顶部点
  -0.5, -0.5,  0.0, // 左下点
   0.5, -0.5,  0.0  // 右下点
];

// 写入缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// 获取顶点位置属性位置
const positionAttribLocation = gl.getAttribLocation(program, 'aVertexPosition');
gl.enableVertexAttribArray(positionAttribLocation);
gl.vertexAttribPointer(
  positionAttribLocation,
  3, // 每个顶点的分量数 (x, y, z)
  gl.FLOAT, 
  false, 
  0, 
  0
);

// 绘制三角形
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

### 添加颜色

```javascript
// 修改顶点着色器
const vsColorSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;
  
  varying lowp vec4 vColor;
  
  void main() {
    gl_Position = aVertexPosition;
    vColor = aVertexColor;
  }
`;

// 修改片段着色器
const fsColorSource = `
  precision mediump float;
  
  varying lowp vec4 vColor;
  
  void main() {
    gl_FragColor = vColor;
  }
`;

// 重新编译程序
const colorProgram = createProgram(gl, vsColorSource, fsColorSource);
gl.useProgram(colorProgram);

// 顶点位置
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(colorProgram, 'aVertexPosition');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// 顶点颜色
const colors = [
  1.0, 0.0, 0.0, 1.0, // 红色
  0.0, 1.0, 0.0, 1.0, // 绿色
  0.0, 0.0, 1.0, 1.0  // 蓝色
];

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

const colorLocation = gl.getAttribLocation(colorProgram, 'aVertexColor');
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

// 绘制彩色三角形
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

### 3D变换

```javascript
// 使用矩阵变换的顶点着色器
const vs3dSource = `
  attribute vec4 aVertexPosition;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

// 创建WebGL程序
const program3d = createProgram(gl, vs3dSource, fsSource);
gl.useProgram(program3d);

// 创建缓冲区并传入顶点...

// 获取矩阵统一变量位置
const modelViewMatrixLocation = gl.getUniformLocation(program3d, 'uModelViewMatrix');
const projectionMatrixLocation = gl.getUniformLocation(program3d, 'uProjectionMatrix');

// 设置透视投影矩阵
const fieldOfView = 45 * Math.PI / 180;   // 视场角 (弧度)
const aspect = canvas.width / canvas.height;
const zNear = 0.1;
const zFar = 100.0;
const projectionMatrix = mat4.create();

mat4.perspective(
  projectionMatrix,
  fieldOfView,
  aspect,
  zNear,
  zFar
);

// 设置模型视图矩阵
const modelViewMatrix = mat4.create();

// 将模型移到相机前方
mat4.translate(
  modelViewMatrix,
  modelViewMatrix,
  [0.0, 0.0, -6.0]
);

// 传递矩阵到着色器
gl.uniformMatrix4fv(
  projectionMatrixLocation,
  false,
  projectionMatrix
);
gl.uniformMatrix4fv(
  modelViewMatrixLocation,
  false,
  modelViewMatrix
);

// 绘制...
```

## WebGL库

直接使用WebGL进行编程很复杂，因此大多数开发者选择使用高级库来简化3D开发。

### Three.js

Three.js是最流行的WebGL库之一，提供了更高级的抽象。

```javascript
// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // 视场角
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近平面
  1000 // 远平面
);

// 设置相机位置
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 创建材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// 创建网格
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  // 旋转立方体
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  renderer.render(scene, camera);
}

animate();
```

### 更高级的Three.js示例

```javascript
// 创建场景、相机和渲染器
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加灯光
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 创建几何体
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);

// 创建材质
const material = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
  shininess: 100,
  specular: 0x111111
});

// 创建网格
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

// 添加轨道控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 添加窗口大小调整事件
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  torusKnot.rotation.x += 0.01;
  torusKnot.rotation.y += 0.01;
  
  controls.update();
  
  renderer.render(scene, camera);
}

animate();
```

## 性能优化

图形处理是计算密集型任务，优化性能对于提供流畅体验至关重要。

### Canvas性能优化

```javascript
// 1. 避免频繁的状态改变
ctx.fillStyle = 'red';
// 绘制所有红色物体
ctx.fillRect(10, 10, 100, 100);
ctx.fillRect(200, 10, 100, 100);
// 然后改变颜色
ctx.fillStyle = 'blue';
// 绘制所有蓝色物体

// 2. 使用离屏Canvas进行复杂绘制
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 100;
offscreenCanvas.height = 100;
const offCtx = offscreenCanvas.getContext('2d');

// 在离屏Canvas上绘制复杂图形
offCtx.fillStyle = 'red';
offCtx.beginPath();
offCtx.arc(50, 50, 40, 0, Math.PI * 2);
offCtx.fill();

// 多次绘制到主Canvas
for (let i = 0; i < 100; i++) {
  ctx.drawImage(offscreenCanvas, Math.random() * 500, Math.random() * 500);
}

// 3. 使用window.requestAnimationFrame而不是setTimeout
function animate() {
  // 更新和绘制代码
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### WebGL性能优化

```javascript
// 1. 最小化WebGL状态变化
// 按照材质、纹理等分组物体进行绘制

// 2. 使用批处理
// 合并多个相似的几何体

// 3. 使用顶点索引
const positions = new Float32Array([
  // 正方形的四个顶点
  -1, -1, 0,
   1, -1, 0,
   1,  1, 0,
  -1,  1, 0
]);

const indices = new Uint16Array([
  0, 1, 2, // 第一个三角形
  0, 2, 3  // 第二个三角形
]);

// 4. 使用适当的精度
// 顶点着色器中的精度限定符
// precision mediump float; // 中等精度，通常足够
```

## 总结

Canvas和WebGL是创建图形和可视化的强大工具，无论是简单的2D图表还是复杂的3D场景，它们都能满足需求。

- **Canvas API** 提供了简单直观的2D绘图功能，适合于简单图形、图表和基本游戏
- **WebGL** 提供了对GPU的直接访问，用于创建高性能的3D图形和复杂的视觉效果

通过结合这些技术，开发者可以在网页上创建从数据可视化到沉浸式3D体验的各种应用。在下一部分中，我们将探讨Web Components和其他现代Web API。 