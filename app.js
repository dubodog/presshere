// 游戏状态管理
let currentStep = 1;
const buttons = [];

// 音频初始化
let pressSound;
let lightSound;

// 存储事件处理函数的对象，用于后续移除事件监听器
const eventHandlers = {};

function initAudioContext() {
    try {
        pressSound = new Audio('./press.mp3');
        lightSound = new Audio('./light.mp3');
    } catch (error) {
        console.error('音频初始化失败:', error);
        updateInstruction('音频初始化失败，请轻点重试');
    }
}

function playSound(audio) {
    if (!audio){ console.log('音效为空，查看文件是否加载'); return;}
    try {
        console.log('播放音效:',audio.src);
        console.trace('播放音效调用栈:');
        // 克隆音频对象以确保每次播放都是新的实例
        const newAudio = new Audio(audio.src);
        newAudio.play().catch(e => {
            console.error('音效播放失败:', e);
        });
    } catch (e) {
        console.error('音效播放失败:', e);
    }
}

function updateInstruction(text) {
    const instructionEl = document.getElementById('instruction');
    instructionEl.textContent = text;
    if (/iPhone|iPad|iPod/.test(navigator.userAgent) && window.navigator.vibrate) {
        try {
            window.navigator.vibrate([30, 50, 30]);
            
        } catch (vibrationError) {
            
        }
    }
}

// 初始化游戏
function initGame() {
    createInitialButton();
    setupDeviceMotion();
}

// 在首次交互时初始化音频
function handleFirstInteraction() {
    initAudioContext();  // 直接调用音频初始化
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('mousedown', handleFirstInteraction);
}

document.addEventListener('touchstart', handleFirstInteraction);
document.addEventListener('mousedown', handleFirstInteraction);

// 创建初始按钮 - 作为所有按钮的参照点
function createInitialButton() {
    const container = document.getElementById('buttonsContainer');
    const containerRect = container.getBoundingClientRect();
    const buttonWidth = 60; // 按钮宽度
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    console.log('创建初始按钮 - 位置:', centerX, centerY);
    // 创建第一个黄色按钮，并将其作为参照点
    const btn = createButton(centerX - buttonWidth / 2, centerY - buttonWidth / 2, 'yellow');
    // 添加一个标识，表示这是第一个参照按钮
    btn.setAttribute('data-reference', 'true');
    btn.classList.add('new'); // 添加渐变出现的动画效果
    
    // 设置初始提示文字
    updateInstruction('按一下这个黄点');
    
    // 使用命名函数作为事件处理器
    function handleInitialButtonClick(event) {
        handleFirstClick(event);
    }
    
    // 存储事件处理函数以便后续移除
    eventHandlers[btn.id] = {
        click: handleInitialButtonClick
    };
    
    btn.addEventListener('click', handleInitialButtonClick);
}

// 通用按钮创建方法
function createVerticalButtons(baseColor, columnIndex) {
    // 定义按钮位置，上下各两个，加上中间的参考按钮，共5个
    const positions = [-2, -1, 0, 1, 2]; // 相对位置
    const baseButtons = Array.from(document.querySelectorAll(`.${baseColor}`));
    
    // 如果columnIndex是数字，则按索引获取参考按钮
    // 如果不是数字，则认为是一个位置值，找到最接近该位置的按钮
    let referenceButton;
    if (typeof columnIndex === 'number') {
        referenceButton = baseButtons[columnIndex];
    } else {
        // 找到水平位置最接近columnIndex的按钮
        referenceButton = baseButtons.reduce((closest, current) => {
            const currentRect = current.getBoundingClientRect();
            const closestRect = closest ? closest.getBoundingClientRect() : null;
            if (!closest) return current;
            return Math.abs(currentRect.left - columnIndex) < Math.abs(closestRect.left - columnIndex) ? current : closest;
        }, null);
    }
    
    if (!referenceButton) return;
    
    // 移除同列的其他按钮
    baseButtons.forEach(btn => {
        const btnRect = btn.getBoundingClientRect();
        const refRect = referenceButton.getBoundingClientRect();
        if (Math.abs(btnRect.left - refRect.left) < 10 && btn !== referenceButton) {
            if (baseColor === 'yellow') {
                console.log(`移除按钮 - 位置: x=${btn.style.left}, y=${btn.style.top}`);
                console.log(`当前步骤: ${currentStep}`);
            }
            // 移除事件监听器
            if (btn.id && eventHandlers[btn.id]) {
                for (const [eventType, handler] of Object.entries(eventHandlers[btn.id])) {
                    btn.removeEventListener(eventType, handler);
                }
                delete eventHandlers[btn.id];
            }
            btn.remove();
        }
    });
    
    const refRect = referenceButton.getBoundingClientRect();
    const container = document.getElementById('buttonsContainer');
    const containerRect = container.getBoundingClientRect();
    const buttonSize = 60; // 按钮大小
    
    // 修改：使用容器高度的百分比来计算按钮间距，而不是固定值
    // 计算合适的间距百分比，确保在小屏幕上也能完全显示所有按钮
    // 考虑到有5个按钮(-2,-1,0,1,2)，需要确保它们在容器高度内均匀分布
    const containerHeight = containerRect.height;
    const spacingPercent = 15; // 按钮间距为容器高度的15%
    
    // 创建垂直排列的按钮
    positions.forEach((position, index) => {
        // 跳过中间位置(0)，因为已经有参考按钮
        if (position === 0) return;
        
        setTimeout(() => {
            // 保持x坐标不变，只改变y坐标，确保按钮在同一列
            // 计算相对于容器的位置，而不是绝对位置
            const relativeX = (refRect.left - containerRect.left) / containerRect.width * 100;
            // 使用百分比间距计算按钮位置
            const relativeY = (refRect.top - containerRect.top) / containerRect.height * 100 + position * spacingPercent;
            const btn = createButton(`${relativeX}%`, `${relativeY}%`, baseColor);
            btn.style.opacity = 0;
            btn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                btn.style.opacity = 1;
                btn.style.transform = 'translateY(0)';
                btn.style.transition = 'all 0.5s ease-out';
            }, 50);
        }, Math.abs(position) * 100); // 按钮出现的时间间隔
    });
}

function createButton(x, y, color) {
    const btn = document.createElement('div');
    // 为按钮生成唯一ID，用于存储事件处理函数
    btn.id = 'button_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // 使用命名函数作为事件处理器
    function handleTouchEvent(e) {
        handleTouch(e);
    }
    
    function handleMouseoverEvent(e) {
        handleTouch(e);
    }
    
    function handleClickEvent(event) {
        btn.clickCount++;
        const counter = document.createElement('div');
        counter.className = 'click-counter';
        counter.textContent = `+${btn.clickCount}`;
        const rect = btn.getBoundingClientRect();
        const containerRect = document.getElementById('buttonsContainer').getBoundingClientRect();
        let clickX, clickY;
        if (event.touches && event.touches[0]) {
            clickX = event.touches[0].pageX - containerRect.left;
            clickY = event.touches[0].pageY - containerRect.top;
        } else {
            clickX = event.pageX - containerRect.left;
            clickY = event.pageY - containerRect.top;
        }
        counter.style.left = `${(clickX / containerRect.width) * 100}%`;
        counter.style.top = `${(clickY / containerRect.height) * 100}%`;
        document.getElementById('buttonsContainer').appendChild(counter);
        setTimeout(() => counter.remove(), 500);
    }
    
    // 存储事件处理函数以便后续移除
    eventHandlers[btn.id] = {
        touchstart: handleTouchEvent,
        mouseover: handleMouseoverEvent,
        click: handleClickEvent
    };
    
    btn.addEventListener('touchstart', handleTouchEvent);
    btn.addEventListener('mouseover', handleMouseoverEvent);
    btn.className = ['button', color].filter(Boolean).join(' ');
    btn.clickCount = 0;
    
    if (color === 'yellow') {
        console.log(`创建黄色按钮 - 位置: x=${x}, y=${y}`);
        console.log(`当前步骤: ${currentStep}`);
        console.log(`当前黄色按钮数量: ${document.querySelectorAll('.yellow').length + 1}`);
    }
    
    // 移除这一行，因为在上面已经存储并添加了click事件监听器
    // btn.addEventListener('click', handleClickEvent);
    
    // 处理位置设置
    const container = document.getElementById('buttonsContainer');
    
    // 检查x和y是否已经是DOM元素的位置
    if (x instanceof Element) {
        const rect = x.getBoundingClientRect();
        x = rect.left;
        y = rect.top;
    }
    
    // 检查是否是百分比值
    const isXPercentage = typeof x === 'string' && x.includes('%');
    const isYPercentage = typeof y === 'string' && y.includes('%');
    
    // 设置按钮位置
    // 修正位置计算逻辑，确保按钮位置正确
    const containerRect = container.getBoundingClientRect();
    btn.style.left = isXPercentage ? x : `${(x / containerRect.width) * 100}%`;
    btn.style.top = isYPercentage ? y : `${(y / containerRect.height) * 100}%`;
    
    container.appendChild(btn);
    console.log('Created button with classes:', btn.className, 'Computed color:', getComputedStyle(btn).backgroundColor);
    return btn;
}

// 触摸处理函数
function handleTouch(e) {
    console.log('触摸事件触发 - 当前步骤:', currentStep);
    console.log('按钮位置:', e.target.style.left, e.target.style.top);
    console.log('按钮类名:', e.target.className);
    console.log('事件类型:', e.type);

    const container = document.getElementById('buttonsContainer');
    const referenceButton = document.querySelector('[data-reference="true"]');
    const referenceRect = referenceButton.getBoundingClientRect();
    const targetRect = e.target.getBoundingClientRect();
    
    // 判断按钮位置（左侧或右侧）
    const isLeftButton = targetRect.left < referenceRect.left;
    const isRightButton = targetRect.left > referenceRect.left;

    if(currentStep === 3 && e.target.classList.contains('yellow')) {
        // 处理左边按钮变红逻辑
        if(isLeftButton) {
            e.preventDefault(); // 阻止默认事件
            e.target.style.transition = 'background-color 0.5s';
            playSound(pressSound);
            e.target.classList.remove('yellow');
            e.target.classList.add('red');
            updateInstruction('就是这样！再来摸摸右边的黄点');
            currentStep++;
        }
    } else if(currentStep === 4 && e.target.classList.contains('yellow') && isRightButton) {
        e.target.style.transition = 'background-color 0.5s';
        playSound(pressSound);
        e.target.classList.remove('yellow');
        e.target.classList.add('blue');
        updateInstruction('太棒啦，现在按五次黄点');
        currentStep++;
        
        // 设置中间黄色按钮的点击计数器
        let clickCount = 0;
        const centerBtn = document.querySelector('.button.yellow');
        
        // 移除原有的事件监听器，而不是替换DOM节点
        if (centerBtn.id && eventHandlers[centerBtn.id]) {
            for (const [eventType, handler] of Object.entries(eventHandlers[centerBtn.id])) {
                centerBtn.removeEventListener(eventType, handler);
            }
            // 清空存储的事件处理函数
            eventHandlers[centerBtn.id] = {};
        }
        
        // 创建新的事件处理函数并存储
        function handleCenterButtonClick(event) {
            playSound(pressSound);
            clickCount++;
            // 添加点击计数显示
            const counter = document.createElement('div');
            counter.className = 'click-counter';
            counter.textContent = `+${clickCount}`;
            const containerRect = container.getBoundingClientRect();
            let clickX, clickY;
            if (event.touches && event.touches[0]) {
                clickX = event.touches[0].pageX - containerRect.left;
                clickY = event.touches[0].pageY - containerRect.top;
            } else {
                clickX = event.pageX - containerRect.left;
                clickY = event.pageY - containerRect.top;
            }
            counter.style.left = `${(clickX / containerRect.width) * 100}%`;
            counter.style.top = `${(clickY / containerRect.height) * 100}%`;
            container.appendChild(counter);
            setTimeout(() => counter.remove(), 500);
            
            if(clickCount === 5) {
                // 在黄色按钮的上下方创建4个黄色按钮，形成垂直排列的5个按钮
                createVerticalButtons('yellow', 0); // 使用索引0获取中间的黄色按钮
                updateInstruction('再按五次红的……');
                currentStep = 6; // 修正为第6步状态
                setupRedButtonCounter();
            }
        }
        
        // 存储新的事件处理函数
        var newHandlers = {};
        if (eventHandlers[centerBtn.id]) {
            newHandlers = eventHandlers[centerBtn.id];
        }
        newHandlers.click = handleCenterButtonClick;
        if (eventHandlers[centerBtn.id] && eventHandlers[centerBtn.id].touchstart) {
            newHandlers.touchstart = eventHandlers[centerBtn.id].touchstart;
        }
        if (eventHandlers[centerBtn.id] && eventHandlers[centerBtn.id].mouseover) {
            newHandlers.mouseover = eventHandlers[centerBtn.id].mouseover;
        }
        eventHandlers[centerBtn.id] = newHandlers;
        
        // 添加新的事件监听器
        centerBtn.addEventListener('click', handleCenterButtonClick);
    }
}

// 步骤处理器
function handleFirstClick() {
    // 确保在用户交互上下文中播放
    if (pressSound) playSound(pressSound);
    // 获取参照按钮（第一个黄色按钮）
    const referenceButton = document.querySelector('[data-reference="true"]');
    const referenceRect = referenceButton.getBoundingClientRect();
    const container = document.getElementById('buttonsContainer');
    const containerRect = container.getBoundingClientRect();
    const spacing = containerRect.width * 0.2; // 按钮之间的间距为容器宽度的20%
    console.log('参照按钮位置:', referenceRect.left, referenceRect.top, spacing);
    
    if(currentStep === 1) {
        // 创建左侧按钮，与参照按钮保持相同的y坐标
        // 确保第二个按钮在第一个按钮的左侧，距离为3个按钮宽度
        // 计算相对于容器的位置，而不是相对于视口的位置
        const containerRect = container.getBoundingClientRect();
        const relativeX = (referenceRect.left - containerRect.left) - spacing * 1.5; // 约3个按钮宽度的距离
        const relativeY = referenceRect.top - containerRect.top; // 保持相同的y坐标
        console.log('创建左侧按钮 - 位置:', relativeX, relativeY);
        // 直接使用参照按钮的位置信息来确保新按钮在同一水平线上
        const leftBtn = createButton(relativeX, relativeY, 'yellow');
        leftBtn.classList.add('new'); // 添加渐变出现的动画效果
        updateInstruction('很好！再按一下');
        currentStep++;
        
        // 确保按钮位置正确
        console.log('参照按钮位置:', referenceRect.left, referenceRect.top);
        console.log('新按钮位置:', leftBtn.getBoundingClientRect().left, leftBtn.getBoundingClientRect().top);
    } else if(currentStep === 2) {
        // 创建右侧按钮，与参照按钮保持相同的y坐标
        // 使用相对于容器的位置计算
        const containerRect = container.getBoundingClientRect();
        const relativeX = (referenceRect.left - containerRect.left) + spacing * 1.5; // 约3个按钮宽度的距离
        const relativeY = referenceRect.top - containerRect.top; // 保持相同的y坐标
        console.log('创建右侧按钮 - 位置:', relativeX, relativeY);
        const rightBtn = createButton(relativeX, relativeY, 'yellow');
        rightBtn.classList.add('new'); // 添加渐变出现的动画效果
        updateInstruction('非常棒！现在用手指轻轻摸摸左边的黄点');
        currentStep++;
    }
}

// 更新提示文字
function updateInstruction(text) {
    const instructionEl = document.getElementById('instruction');
    instructionEl.textContent = text;
}

// 设备运动检测
function setupDeviceMotion() {
    if (typeof DeviceMotionEvent !== 'undefined') {
        const setupMotionListener = () => {
            window.addEventListener('devicemotion', handleMotion);
            console.log('设备运动监听器已设置');
        };

        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS 13+ 需要检查权限
            authButton.addEventListener('click', handleAuthButtonClick);
            
            // 创建命名函数作为事件处理器并存储
            function handleAuthButtonClick() {
                DeviceMotionEvent.requestPermission()
                    .then(newPermissionState => {
                        if (newPermissionState === 'granted') {
                            setupMotionListener();
                            authButton.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('权限请求错误:', error);
                    });
            }
            
            // 存储事件处理函数
            eventHandlers[authButton.id || 'authButton'] = {
                click: handleAuthButtonClick
            };
        } else {
            // 其他设备直接添加监听
            setupMotionListener();
        }
    }
}

// 运动处理
function setupRedButtonCounter() {
    let redClickCount = 0;
    const redButtons = document.querySelectorAll('.red');
    
    // 使用命名函数作为事件处理器
    function handleRedClick(event) {
        playSound(pressSound);
        redClickCount++;
        
        // 添加点击计数显示
        const counter = document.createElement('div');
        counter.className = 'click-counter';
        counter.textContent = `+${redClickCount}`;
        const containerRect = document.getElementById('buttonsContainer').getBoundingClientRect();
        let clickX = event.pageX - containerRect.left;
        let clickY = event.pageY - containerRect.top;
        counter.style.left = `${(clickX / containerRect.width) * 100}%`;
        counter.style.top = `${(clickY / containerRect.height) * 100}%`;
        document.getElementById('buttonsContainer').appendChild(counter);
        setTimeout(() => counter.remove(), 500);
        
        if(redClickCount === 5) {
            // 在红色按钮的上下方创建4个红色按钮，形成垂直排列的5个按钮
            createVerticalButtons('red', 0); // 使用索引0获取第一个红色按钮
            updateInstruction('然后按五次蓝的');
            currentStep = 7; // 修正为第7步
            setupBlueButtonCounter();
            
            // 移除所有红色按钮的点击事件监听
            redButtons.forEach(btn => {
                if (btn.id && eventHandlers[btn.id] && eventHandlers[btn.id].redClick) {
                    btn.removeEventListener('click', eventHandlers[btn.id].redClick);
                    // 从事件处理器对象中移除该事件
                    delete eventHandlers[btn.id].redClick;
                }
            });
        }
    };
    
    // 为每个红色按钮添加事件监听器并存储
    redButtons.forEach(btn => {
        // 存储事件处理函数
        if (!btn.id) {
            btn.id = 'button_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        
        // 存储事件处理函数
        var newHandlers = {};
        if (eventHandlers[btn.id]) {
            for (var key in eventHandlers[btn.id]) {
                newHandlers[key] = eventHandlers[btn.id][key];
            }
        }
        newHandlers.redClick = handleRedClick;
        eventHandlers[btn.id] = newHandlers;
        
        btn.addEventListener('click', handleRedClick);
    });
}

function setupBlueButtonCounter() {
    let blueClickCount = 0;
    const blueButtons = document.querySelectorAll('.blue');
    
    // 使用命名函数作为事件处理器
    function handleBlueClick(event) {
        playSound(pressSound);
        blueClickCount++;
        
        // 添加点击计数显示
        const counter = document.createElement('div');
        counter.className = 'click-counter';
        counter.textContent = `+${blueClickCount}`;
        const containerRect = document.getElementById('buttonsContainer').getBoundingClientRect();
        let clickX = event.pageX - containerRect.left;
        let clickY = event.pageY - containerRect.top;
        counter.style.left = `${(clickX / containerRect.width) * 100}%`;
        counter.style.top = `${(clickY / containerRect.height) * 100}%`;
        document.getElementById('buttonsContainer').appendChild(counter);
        setTimeout(() => counter.remove(), 500);
        
        if(blueClickCount === 5) {
            // 在蓝色按钮的上下方创建4个蓝色按钮，形成垂直排列的5个按钮
            createVerticalButtons('blue', 0); // 使用索引0获取第一个蓝色按钮
            updateInstruction('好极啦！现在拿起来摇一摇');
            currentStep = 8; // 修正为第8步
            
            // 移除所有蓝色按钮的点击事件监听
            blueButtons.forEach(btn => {
                if (btn.id && eventHandlers[btn.id] && eventHandlers[btn.id].blueClick) {
                    btn.removeEventListener('click', eventHandlers[btn.id].blueClick);
                    // 从事件处理器对象中移除该事件
                    delete eventHandlers[btn.id].blueClick;
                }
            });
        }
    };
    
    // 为每个蓝色按钮添加事件监听器并存储
    blueButtons.forEach(btn => {
        // 确保按钮有唯一ID
        if (!btn.id) {
            btn.id = 'button_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        
        // 存储事件处理函数
        var newHandlers = {};
        if (eventHandlers[btn.id]) {
            for (var key in eventHandlers[btn.id]) {
                newHandlers[key] = eventHandlers[btn.id][key];
            }
        }
        newHandlers.blueClick = handleBlueClick;
        eventHandlers[btn.id] = newHandlers;
        
        btn.addEventListener('click', handleBlueClick);
    });
}

function setupYellowButtonFinal() {
    let yellowClickCount = 0;
    const yellowButtons = document.querySelectorAll('.yellow');
    
    // 使用命名函数作为事件处理器
    function handleYellowFinalClick(event) {
        playSound(pressSound);
        this.style.transform = 'scale(0.9)';
        yellowClickCount++;
        
        if(yellowClickCount === 5) {
            playSound(lightSound);
            document.body.style.backgroundColor = '#000';
            updateInstruction('哎呀！天黑了？再按按看？');
            currentStep++;
        }
    }
    
    // 为每个黄色按钮添加事件监听器并存储
    yellowButtons.forEach(btn => {
        // 确保按钮有唯一ID
        if (!btn.id) {
            btn.id = 'button_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        
        // 存储事件处理函数
        var newHandlers = {};
        if (eventHandlers[btn.id]) {
            for (var key in eventHandlers[btn.id]) {
                newHandlers[key] = eventHandlers[btn.id][key];
            }
        }
        newHandlers.yellowFinalClick = handleYellowFinalClick;
        eventHandlers[btn.id] = newHandlers;
        
        btn.addEventListener('click', handleYellowFinalClick);
    });
}

function setupDarkMode() {
    document.body.style.backgroundColor = '#000';
    document.querySelectorAll('.button').forEach(btn => {
        if(!btn.classList.contains('yellow')) btn.style.opacity = '0.2';
    });
}

function handleMotion(event) {
    if(currentStep >= 8) {
        const acceleration = event.accelerationIncludingGravity || event.acceleration || { x: 0, y: 0, z: 0 };
        const shakeThreshold = 20;
        const strongShakeThreshold = 30; // 更强烈摇动的阈值
        
        const totalAcceleration = Math.sqrt(
            Math.pow((acceleration.x || 0), 2) + 
            Math.pow((acceleration.y || 0), 2) + 
            Math.pow((acceleration.z || 0), 2)
        );
        
        if (totalAcceleration > shakeThreshold) {
            console.log('检测到摇动，触发物理效果，加速度：', totalAcceleration);
            if (currentStep === 8) {
                // 初始化物理引擎
                if (typeof initPhysics === 'function') {
                    initPhysics();
                }
                updateInstruction('不错！再用力摇摇……');
                currentStep = 9;
            } else if (currentStep === 9 && totalAcceleration > strongShakeThreshold) {
                // 第10步：更强烈的摇动效果
                console.log('检测到强烈摇动，触发更激烈的物理效果');
                // 增强物理效果
                if (engine && engine.world) {
                    // 增加重力效果
                    engine.world.gravity.y = 2;
                }
                applyPhysicsEffects({
                    x: acceleration.x * 1.5, // 增强加速度效果
                    y: acceleration.y * 1.5
                });
                updateInstruction('好啦！非常好！现在向左边倾斜，看看会发生什么……');
                currentStep = 10;
            } else if (currentStep === 12) {
                // 第13步：摇动后重新排列按钮
                console.log('检测到摇动，重新排列按钮');
                currentStep = 13;
                // 重新排列按钮的逻辑在applyPhysicsEffects中已实现
                applyPhysicsEffects(acceleration);
            }
        }
        
        // 处理倾斜效果
        if(currentStep >= 10 && currentStep <= 12) {
            const tiltX = event.accelerationIncludingGravity.x;
            console.log('检测到倾斜，X轴加速度：', tiltX);
            
            if(tiltX < -3 && currentStep === 10) {
                // 第11步：向左倾斜
                console.log('检测到向左倾斜');
                applyTiltEffect(-10);
                updateInstruction('再往右呢？你要试试看吗？');
                currentStep = 11;
            } else if(tiltX > 3 && currentStep === 11) {
                // 第12步：向右倾斜
                console.log('检测到向右倾斜');
                applyTiltEffect(10);
                updateInstruction('棒极啦！再把书摇一摇，让点点们排列整齐');
                currentStep = 12;
            } else if(currentStep === 10 && tiltX < -3) {
                // 保持向左倾斜效果
                applyTiltEffect(-10);
            } else if(currentStep === 11 && tiltX > 3) {
                // 保持向右倾斜效果
                applyTiltEffect(10);
            }
        }
        
        // 应用物理效果
        if(currentStep === 9 || currentStep === 10) {
            applyPhysicsEffects(acceleration);
        }
    }
}

function applyPhysicsEffects(acceleration) {
    if(currentStep === 16) {
        // 最终阶段处理
        let totalClicks = 0;
        document.querySelectorAll('.button').forEach(btn => {
            // 确保按钮有唯一ID
            if (!btn.id) {
                btn.id = 'button_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            }
            
            // 移除之前的事件监听器
            if (btn.id && eventHandlers[btn.id] && eventHandlers[btn.id].finalClick) {
                btn.removeEventListener('click', eventHandlers[btn.id].finalClick);
            }
            
            // 创建新的事件处理函数
            function handleFinalClick() {
                if (pressSound) playSound(pressSound);
                if(++totalClicks === 15) {
                    if (lightSound) playSound(lightSound);
                    document.body.style.backgroundColor = '#fff';
                    updateInstruction('不错嘛……稍微摇一摇？');
                    currentStep++;
                }
            }
            
            // 存储事件处理函数
            var newHandlers = {};
            if (eventHandlers[btn.id]) {
                for (var key in eventHandlers[btn.id]) {
                    newHandlers[key] = eventHandlers[btn.id][key];
                }
            }
            newHandlers.finalClick = handleFinalClick;
            eventHandlers[btn.id] = newHandlers;
            
            // 添加新的事件监听器
            btn.addEventListener('click', handleFinalClick);
        });
    } else if(currentStep === 13) {
        // 重新排列按钮为红黄蓝间隔
        const container = document.getElementById('buttonsContainer');
        container.style.transform = 'none';
        const buttons = Array.from(document.querySelectorAll('.button'));
        
        // 确保有15个按钮
        while (buttons.length < 15) {
            const newBtn = createButton('10%', '10%', ['red', 'yellow', 'blue'][buttons.length % 3]);
            buttons.push(newBtn);
        }
        
        // 按照红黄蓝的顺序排列按钮
        buttons.forEach((btn, index) => {
            btn.style.transition = 'all 1s ease';
            // 计算按钮位置，5行3列排列
            const row = Math.floor(index / 3);
            const col = index % 3;
            btn.style.left = `${20 + col * 30}%`;
            btn.style.top = `${20 + row * 15}%`;
            
            // 设置按钮颜色为红黄蓝交替
            const colorClass = ['red', 'yellow', 'blue'][index % 3];
            btn.className = 'button ' + colorClass;
        });
        
        // 为所有黄色按钮添加点击事件
        let yellowClickCount = 0;
        const yellowButtons = document.querySelectorAll('.button.yellow');
        const totalYellowButtons = yellowButtons.length;
        
        yellowButtons.forEach(btn => {
            // 确保按钮有唯一ID
            if (!btn.id) {
                btn.id = 'button_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            }
            
            // 移除之前的事件监听器
            if (btn.id && eventHandlers[btn.id] && eventHandlers[btn.id].yellowArrangeClick) {
                btn.removeEventListener('click', eventHandlers[btn.id].yellowArrangeClick);
            }
            
            // 创建新的事件处理函数
            function handleYellowArrangeClick() {
                if (pressSound) playSound(pressSound);
                yellowClickCount++;
                
                // 添加点击计数显示
                const counter = document.createElement('div');
                counter.className = 'click-counter';
                counter.textContent = `+${yellowClickCount}`;
                const rect = btn.getBoundingClientRect();
                counter.style.left = btn.style.left;
                counter.style.top = btn.style.top;
                document.getElementById('buttonsContainer').appendChild(counter);
                setTimeout(() => counter.remove(), 500);
                
                // 当所有黄色按钮都被点击后
                if(yellowClickCount >= totalYellowButtons) {
                    if (lightSound) playSound(lightSound);
                    updateInstruction('太棒了！你完成了所有挑战！');
                    currentStep = 14;
                }
            }
            
            // 存储事件处理函数
            var newHandlers = {};
            if (eventHandlers[btn.id]) {
                for (var key in eventHandlers[btn.id]) {
                    newHandlers[key] = eventHandlers[btn.id][key];
                }
            }
            newHandlers.yellowArrangeClick = handleYellowArrangeClick;
            eventHandlers[btn.id] = newHandlers;
            
            // 添加新的事件监听器
            btn.addEventListener('click', handleYellowArrangeClick);
        });
        
        updateInstruction('嗯，漂亮！使劲儿按所有的黄点，看看会发生什么……');
        currentStep = 14;
    } else {
        // 原有的物理效果代码保持不变
        const container = document.getElementById('buttonsContainer');
        const containerRect = container.getBoundingClientRect();
        const marginPercent = 5; // 边距改为容器宽度的5%
        const buttons = document.querySelectorAll('.button');
        const buttonPositions = new Map();
        
        // 根据当前步骤调整物理效果的强度
        const intensityFactor = currentStep === 10 ? 1.5 : 1.0;
        const moveXPercent = (acceleration.x || 0) * 0.5 * intensityFactor; // 移动距离改为容器宽度的百分比
        const moveYPercent = (acceleration.y || 0) * 0.5 * intensityFactor;
        
        buttons.forEach(btn => {
            btn.style.transition = 'transform 0.1s linear';
            const btnRect = btn.getBoundingClientRect();
            let currentX = parseFloat(btn.style.left);
            let currentY = parseFloat(btn.style.top);
            
            let newX = currentX - moveXPercent;
            let newY = currentY - moveYPercent;
            
            let newMoveXPercent = moveXPercent;
            let newMoveYPercent = moveYPercent;
            
            if (newX <= marginPercent || newX >= 100 - marginPercent) {
                newMoveXPercent *= -0.8;
            }
            if (newY <= marginPercent || newY >= 100 - marginPercent) {
                newMoveYPercent *= -0.8;
            }
            
            newX = Math.max(marginPercent, Math.min(100 - marginPercent, newX));
            newY = Math.max(marginPercent, Math.min(100 - marginPercent, newY));
            
            buttonPositions.set(btn, {x: newX, y: newY, width: (btnRect.width / containerRect.width) * 100, height: (btnRect.height / containerRect.height) * 100, vx: newMoveXPercent, vy: newMoveYPercent});
        });
        
        buttons.forEach(btn1 => {
            const pos1 = buttonPositions.get(btn1);
            buttons.forEach(btn2 => {
                if(btn1 !== btn2) {
                    const pos2 = buttonPositions.get(btn2);
                    if(checkCollision(pos1, pos2)) {
                        // 播放碰撞音效
                        if (collisionSound) playSound(collisionSound);
                        
                        const tempVx = pos1.vx * 0.8;
                        const tempVy = pos1.vy * 0.8;
                        pos1.vx = pos2.vx * 0.8;
                        pos1.vy = pos2.vy * 0.8;
                        pos2.vx = tempVx;
                        pos2.vy = tempVy;
                        
                        const dx = pos2.x - pos1.x;
                        const dy = pos2.y - pos1.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDistance = pos1.width;
                        
                        if (distance < minDistance) {
                            const overlap = (minDistance - distance) / 2;
                            const nx = dx / distance;
                            const ny = dy / distance;
                            
                            pos1.x -= nx * overlap;
                            pos1.y -= ny * overlap;
                            pos2.x += nx * overlap;
                            pos2.y += ny * overlap;
                            
                            pos1.x = Math.max(marginPercent, Math.min(100 - marginPercent, pos1.x));
                            pos1.y = Math.max(marginPercent, Math.min(100 - marginPercent, pos1.y));
                            pos2.x = Math.max(marginPercent, Math.min(100 - marginPercent, pos2.x));
                            pos2.y = Math.max(marginPercent, Math.min(100 - marginPercent, pos2.y));
                        }
                    }
                }
            });
            
            btn1.style.left = `${pos1.x}%`;
            btn1.style.top = `${pos1.y}%`;
        });
    }
}

function checkCollision(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (pos1.width + pos2.width) / 2;
    return distance < minDistance;
}

function applyTiltEffect(angle) {
    const container = document.getElementById('buttonsContainer');
    container.style.transition = 'transform 0.3s ease';
    container.style.transform = `rotate(${angle}deg)`;
}

// 初始化游戏
initGame();