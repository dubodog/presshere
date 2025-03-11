// Matter.js 模块别名
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Runner = Matter.Runner;

// 创建引擎
let engine = Engine.create({
    gravity: { x: 0, y: 1 },
    enableSleeping: false
});

let world = engine.world;

// 存储按钮和对应的物理体的映射
const buttonBodies = new Map();

// 初始化碰撞音效
let collisionSound;
try {
    collisionSound = new Audio('./collision.mp3');
} catch (error) {
    console.error('碰撞音效初始化失败:', error);
}

// 播放音效函数
function playCollisionSound() {
    if (!collisionSound) return;
    try {
        const newSound = new Audio(collisionSound.src);
        newSound.play().catch(e => {
            console.error('碰撞音效播放失败:', e);
        });
    } catch (e) {
        console.error('碰撞音效播放失败:', e);
    }
}

// 创建按钮的物理体
function createButtonBody(button) {
    const rect = button.getBoundingClientRect();
    const container = document.getElementById('buttonsContainer');
    const containerRect = container.getBoundingClientRect();
    
    // 使用相对于容器的百分比位置
    const x = (rect.left - containerRect.left + rect.width / 2) / containerRect.width * containerRect.width;
    const y = (rect.top - containerRect.top + rect.height / 2) / containerRect.height * containerRect.height;
    
    const body = Bodies.circle(x, y, (rect.width / containerRect.width * 100) / 2, {
        restitution: 0.7,
        friction: 0.05,
        frictionAir: 0.001,
        density: 0.01
    });
    
    buttonBodies.set(button, body);
    World.add(world, body);
}

// 更新按钮位置
function updateButtonPositions() {
    buttonBodies.forEach((body, button) => {
        button.style.left = `${body.position.x - body.circleRadius}px`;
        button.style.top = `${body.position.y - body.circleRadius}px`;
    });
}

// 处理设备运动
function handleDeviceMotion(event) {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration) {
        // 调整重力方向和大小，显著增加系数以增强效果
        engine.world.gravity.x = acceleration.x * 0.3;
        engine.world.gravity.y = acceleration.y * 0.3;
    }
}

// 初始化物理世界
function initPhysics() {
    // 获取容器尺寸
    const container = document.getElementById('buttonsContainer');
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 重置物理引擎
    if (engine) {
        World.clear(world);
        Engine.clear(engine);
    }
    
    engine = Engine.create();
    world = engine.world;

    // 创建边界墙
    const wallThickness = 60;
    const walls = [
        Bodies.rectangle(containerWidth/2, -wallThickness/2, containerWidth, wallThickness, { isStatic: true }), // 上
        Bodies.rectangle(containerWidth/2, containerHeight + wallThickness/2, containerWidth, wallThickness, { isStatic: true }), // 下
        Bodies.rectangle(-wallThickness/2, containerHeight/2, wallThickness, containerHeight, { isStatic: true }), // 左
        Bodies.rectangle(containerWidth + wallThickness/2, containerHeight/2, wallThickness, containerHeight, { isStatic: true }) // 右
    ];

    World.add(world, walls);
    Runner.run(engine);

    // 为所有现有按钮创建物理体
    document.querySelectorAll('.button').forEach(createButtonBody);

    // 添加碰撞事件监听
    Events.on(engine, 'collisionStart', function(event) {
        event.pairs.forEach(function(pair) {
            if (!pair.bodyA.isStatic && !pair.bodyB.isStatic) {
                const relativeVelocity = Math.sqrt(
                    Math.pow(pair.bodyA.velocity.x - pair.bodyB.velocity.x, 2) +
                    Math.pow(pair.bodyA.velocity.y - pair.bodyB.velocity.y, 2)
                );
                if (relativeVelocity > 5) {
                    playCollisionSound();
                }
            }
        });
    });
}

// 添加更新循环
Events.on(engine, 'afterUpdate', updateButtonPositions);

// 添加设备运动监听
window.addEventListener('devicemotion', handleDeviceMotion);

// 导出初始化函数
window.initPhysics = initPhysics;