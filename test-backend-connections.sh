#!/bin/bash

echo "🧪 测试所有后端服务的MySQL和Redis连接"
echo "================================================"

# 检查基础服务状态
echo "🔍 检查基础服务状态..."
echo "MySQL状态:"
docker-compose ps mysql | grep -E "(healthy|unhealthy)" || echo "❌ MySQL未运行"
echo "Redis状态:"
docker-compose ps redis | grep -E "(healthy|unhealthy)" || echo "❌ Redis未运行"
echo ""

# 测试各个后端服务
echo "1️⃣ 测试Node.js API (端口3002)"
echo "-----------------------------------"
if curl -s http://localhost:3002/health >/dev/null 2>&1; then
    echo "✅ Node.js API响应正常"
    curl -s http://localhost:3002/health | jq '.status, .uptime, .environment' 2>/dev/null
    
    # 测试API功能
    echo "📋 测试用户API:"
    user_count=$(curl -s http://localhost:3002/api/users | jq '.data | length' 2>/dev/null)
    if [ "$user_count" != "null" ] && [ "$user_count" != "" ]; then
        echo "✅ 数据库连接正常 (用户数: $user_count)"
    else
        echo "❌ 数据库连接异常"
    fi
else
    echo "❌ Node.js API未响应"
fi
echo ""

echo "2️⃣ 测试Python API (端口3003)"
echo "-----------------------------------"
if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    echo "✅ Python API响应正常"
    curl -s http://localhost:3003/health | jq '.status, .services' 2>/dev/null
    
    # 测试API功能
    echo "📋 测试用户API:"
    user_response=$(curl -s http://localhost:3003/api/users/ 2>/dev/null)
    if echo "$user_response" | jq -e '.success == true' >/dev/null 2>&1; then
        user_count=$(echo "$user_response" | jq '.data | length' 2>/dev/null)
        echo "✅ 数据库连接正常 (用户数: $user_count)"
    else
        echo "❌ 数据库连接异常"
    fi
else
    echo "❌ Python API未响应"
    echo "检查启动日志:"
    docker-compose logs python-api --tail=5
fi
echo ""

echo "3️⃣ 测试PHP应用 (端口3005)"
echo "-----------------------------------"
if curl -s http://localhost:3005/health >/dev/null 2>&1; then
    echo "✅ PHP应用响应正常"
    curl -s http://localhost:3005/health | jq '.status, .environment' 2>/dev/null
    
    # 测试数据库连接
    echo "📋 测试用户API:"
    user_response=$(curl -s http://localhost:3005/api/users 2>/dev/null)
    if echo "$user_response" | jq -e '.success == true' >/dev/null 2>&1; then
        user_count=$(echo "$user_response" | jq '.count' 2>/dev/null)
        echo "✅ 数据库连接正常 (用户数: $user_count)"
    else
        echo "❌ 数据库连接异常"
    fi
    
    # 测试Redis连接
    echo "🔴 测试Redis连接:"
    redis_response=$(curl -s http://localhost:3005/api/cache/ping 2>/dev/null)
    if echo "$redis_response" | grep -q "PONG" 2>/dev/null; then
        echo "✅ Redis连接正常"
    else
        echo "❌ Redis连接异常: $redis_response"
    fi
else
    echo "❌ PHP应用未响应"
fi
echo ""

echo "4️⃣ 测试Java API (端口3006)"
echo "-----------------------------------"
if curl -s http://localhost:3006/health >/dev/null 2>&1; then
    echo "✅ Java API响应正常"
    curl -s http://localhost:3006/health | jq '.status, .checks' 2>/dev/null
    
    # 测试API功能
    echo "📋 测试用户API:"
    user_response=$(curl -s http://localhost:3006/api/users 2>/dev/null)
    if echo "$user_response" | jq -e '.success == true' >/dev/null 2>&1; then
        user_count=$(echo "$user_response" | jq '.count' 2>/dev/null)
        echo "✅ 数据库连接正常 (用户数: $user_count)"
    else
        echo "❌ 数据库连接异常"
    fi
else
    echo "❌ Java API未响应"
    echo "检查构建状态:"
    docker-compose ps java-api
fi
echo ""

echo "📊 总结"
echo "================================================"
echo "✅ 期望结果: 所有服务都连接MySQL和Redis"
echo "📝 注意: 如果某个服务未启动，请运行相应的启动命令"
echo ""
echo "启动命令:"
echo "  Node.js API: cd apps/api-node && npm run dev"
echo "  Python API:  npm run python:up"
echo "  PHP应用:     npm run php:up"
echo "  Java API:    npm run java:up" 