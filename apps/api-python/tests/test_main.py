import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_root():
    """测试根路径"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "🐍 Turborepo Python API"

def test_health_check():
    """测试健康检查"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert "uptime" in data

def test_get_users():
    """测试获取用户列表"""
    response = client.get("/api/users/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert isinstance(data["data"], list)

def test_create_user():
    """测试创建用户"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User"
    }
    response = client.post("/api/users/", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == user_data["email"]
    assert data["data"]["name"] == user_data["name"]

def test_404_error():
    """测试404错误"""
    response = client.get("/nonexistent")
    assert response.status_code == 404 