# Web 3D与游戏开发

## 简介

随着WebGL和WebGPU等技术的发展，浏览器已经成为一个强大的3D渲染和游戏开发平台。Web 3D和游戏开发结合了图形学、物理模拟、用户交互等多个领域的技术，为用户提供沉浸式的Web体验。

## 核心技术

### WebGL
- OpenGL ES 2.0/3.0 Web实现
- 着色器编程(GLSL)
- 3D数学基础
- 渲染管线与性能优化

### WebGPU
- 新一代Web图形API
- 计算着色器支持
- 多线程渲染
- 与原生GPU API对齐

### Three.js
- 场景、相机与灯光
- 几何体与材质
- 动画与变换
- 加载器与导出工具

### 游戏引擎
- Babylon.js全功能引擎
- PlayCanvas云端开发
- Phaser 2D游戏开发
- PixiJS高性能渲染

## 3D建模与资源

### 模型格式
- glTF/GLB标准格式
- FBX与OBJ导入
- DRACO压缩
- 模型优化策略

### 材质与纹理
- PBR物理材质
- 法线贴图与置换贴图
- 环境贴图与反射
- 纹理压缩与流式加载

### 动画系统
- 骨骼动画
- 变形目标动画
- 关键帧插值
- 动作混合与过渡

## 物理与交互

### 物理引擎
- Ammo.js/cannon.js
- 刚体动力学
- 碰撞检测
- 约束与关节

### 用户交互
- 鼠标与触摸控制
- VR控制器
- 射线投射与拾取
- 手势识别

### 粒子系统
- GPU加速粒子
- 粒子发射器
- 物理驱动粒子
- 特效与视觉反馈

## 性能优化

### 渲染优化
- 层次细节(LOD)
- 实例化渲染
- 遮挡剔除
- 渲染队列管理

### 资源管理
- 资源预加载
- 延迟加载
- 内存管理
- 资源池与复用

### 移动设备优化
- 自适应分辨率
- 着色器复杂度控制
- 电池与热量管理
- 触摸控制优化

## WebXR与沉浸式体验

### 虚拟现实(VR)
- WebXR Device API
- 立体渲染
- 空间音频
- VR交互设计

### 增强现实(AR)
- WebXR AR模块
- 平面检测
- 图像追踪
- AR内容放置

### 沉浸式Web
- 空间界面设计
- 3D音频集成
- 多用户交互
- 可访问性考虑

## 游戏开发流程

### 架构设计
- 实体组件系统
- 游戏循环
- 状态管理
- 事件系统

### 游戏玩法
- 角色控制器
- 相机系统
- AI与寻路
- 关卡设计

### 多人在线
- WebRTC点对点连接
- WebSocket服务器
- 状态同步与预测
- 延迟补偿

## 代码示例

```javascript
// Three.js基础场景示例
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x336699);

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.5, 3);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// 添加灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// 添加地面
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x999999,
  roughness: 0.8,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 加载3D模型
const loader = new GLTFLoader();
loader.load(
  'models/character.glb',
  (gltf) => {
    const model = gltf.scene;
    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
      }
    });
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);
    
    // 动画
    const mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;
    if (animations && animations.length) {
      const idleAnimation = mixer.clipAction(animations[0]);
      idleAnimation.play();
    }
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  (error) => {
    console.error('An error happened', error);
  }
);

// 处理窗口大小变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  mixer?.update(delta);
  
  controls.update();
  renderer.render(scene, camera);
}

animate();
``` 