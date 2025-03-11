const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置SSL证书
const options = {
    key: fs.readFileSync('server.key'),  // 私钥文件路径
    cert: fs.readFileSync('server.crt')   // 证书文件路径
};

// 创建HTTPS服务器
const server = https.createServer(options, (req, res) => {
    // 获取请求的文件路径
    let filePath = path.join(__dirname, req.url.split('?')[0]);
    if (filePath === path.join(__dirname, '/')) {
        filePath = path.join(__dirname, 'index.html');
    }

    // 获取文件扩展名
    const extname = path.extname(filePath);

    // 设置内容类型
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
    }[extname] || 'text/plain';

    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 443;
server.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});