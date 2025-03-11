# 点点点 (Press Here)

一个有趣的互动网页游戏，灵感来源于著名的儿童绘本《Press Here》。玩家通过点击、触摸和摇晃设备与彩色按钮互动，体验一系列有趣的视觉效果和游戏玩法。

## 功能特点

- **多样化的互动方式**：点击、触摸、摇晃设备等多种互动方式
- **渐进式游戏体验**：游戏按照步骤逐渐展开，引导玩家探索
- **视觉反馈**：按钮颜色变化、动画效果和计数器
- **音效反馈**：点击音效和特殊事件音效
- **物理引擎集成**：使用Matter.js实现物理效果，按钮会根据设备倾斜而移动
- **响应式设计**：适配各种屏幕尺寸的设备

## 技术实现

- **前端**：纯原生JavaScript、HTML5和CSS3
- **物理引擎**：Matter.js
- **音频处理**：Web Audio API
- **设备传感器**：DeviceMotion API用于检测设备倾斜
- **HTTPS服务器**：Node.js实现的简单HTTPS服务器

## 如何使用

### 本地运行

1. 克隆仓库到本地
   ```
   git clone https://github.com/dubodog/presshere.git
   cd presshere
   ```

2. 生成SSL证书（HTTPS必需）
   ```
   ./generate-cert.sh
   ```
   或手动生成自签名证书，并命名为server.key和server.crt

3. 启动HTTPS服务器
   ```
   node server.js
   ```

4. 在浏览器中访问 https://localhost

### 游戏玩法

1. 按照屏幕上的指示操作
2. 点击黄色按钮开始游戏
3. 跟随指示触摸、点击不同颜色的按钮
4. 尝试摇晃设备，观察按钮的物理效果
5. 探索所有互动可能性！

## 文件结构

- `index.html` - 主HTML文件
- `styles.css` - 样式表
- `app.js` - 主要游戏逻辑
- `physics.js` - Matter.js物理引擎集成
- `server.js` - HTTPS服务器
- `*.mp3/wav` - 游戏音效文件
- `matter-0.19.0.min.js` - Matter.js物理引擎库

## 许可

[MIT](LICENSE)