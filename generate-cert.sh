#!/bin/bash

# 生成私钥
openssl genrsa -out server.key 2048

# 生成证书签名请求（CSR）
openssl req -new -key server.key -out server.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=Development/CN=localhost"

# 生成自签名证书
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# 删除不需要的CSR文件
rm server.csr

echo "SSL证书生成完成！"
echo "- server.key: 私钥文件"
echo "- server.crt: 证书文件"