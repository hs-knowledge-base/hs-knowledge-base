# FastAPI框架

FastAPI是一个现代、高性能的Python Web框架，专为API开发而设计，基于标准Python类型提示提供自动API文档生成。由Sebastián Ramírez于2018年创建，FastAPI结合了Flask的易用性和高性能异步功能，已迅速成为Python Web开发社区的热门选择。

## FastAPI核心特性

### 性能与速度

FastAPI建立在Starlette和Pydantic之上，提供接近NodeJS和Go的性能：

- **基于Starlette**：高性能异步Web框架
- **异步支持**：原生支持`async`/`await`语法
- **超高性能**：与NodeJS和Go相当的性能表现

### 类型提示与验证

FastAPI充分利用Python类型提示：

```python
from fastapi import FastAPI, Path, Query
from pydantic import BaseModel, Field
from typing import Optional, List

app = FastAPI()

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    tax: Optional[float] = None
    tags: List[str] = []

@app.post("/items/")
async def create_item(item: Item):
    return item

@app.get("/items/{item_id}")
async def read_item(
    item_id: int = Path(..., gt=0),
    q: Optional[str] = Query(None, max_length=50)
):
    return {"item_id": item_id, "q": q}
```

### 自动文档生成

FastAPI自动生成交互式API文档：

- **Swagger UI**：访问`/docs`获取交互式文档
- **ReDoc**：访问`/redoc`获取替代文档视图
- **OpenAPI**：自动生成OpenAPI规范

### 依赖注入系统

强大的依赖注入系统简化代码组织：

```python
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user

@app.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
```

## FastAPI基础

### 安装与项目设置

```bash
# 安装FastAPI和ASGI服务器
pip install fastapi uvicorn

# 运行应用
uvicorn main:app --reload
```

最小化应用：

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

### 路径操作

FastAPI使用装饰器定义路径操作：

```python
@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

@app.post("/items/")
async def create_item(item: Item):
    return item

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"item_id": item_id, **item.dict()}

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    return {"deleted": item_id}
```

### 请求与响应

FastAPI自动处理请求解析和响应序列化：

```python
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, HTMLResponse

app = FastAPI()

@app.post("/files/")
async def create_file(
    file: bytes = File(...),
    fileb: UploadFile = File(...),
    token: str = Form(...)
):
    return {
        "file_size": len(file),
        "filename": fileb.filename,
        "token": token
    }

@app.get("/html/", response_class=HTMLResponse)
async def get_html():
    return """
    <html>
        <head>
            <title>Some HTML</title>
        </head>
        <body>
            <h1>Hello from FastAPI</h1>
        </body>
    </html>
    """
```

## FastAPI进阶

### 中间件

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 后台任务

```python
from fastapi import BackgroundTasks

@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email_notification, email, message="Important notification")
    return {"message": "Notification sent in the background"}
```

### WebSockets

```python
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")
```

## FastAPI应用结构

### 简单结构

适合小型项目：

```
my_fastapi_app/
├── main.py            # 应用入口
├── models.py          # 数据模型
├── schemas.py         # Pydantic模型
├── database.py        # 数据库连接
├── requirements.txt   # 项目依赖
└── .env               # 环境变量
```

### 模块化结构

适合中大型项目：

```
my_fastapi_app/
├── app/
│   ├── __init__.py
│   ├── main.py        # 应用入口
│   ├── dependencies.py # 依赖函数
│   ├── models/        # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── schemas/       # Pydantic模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── api/           # API路由
│   │   ├── __init__.py
│   │   ├── api.py     # API路由器
│   │   ├── endpoints/
│   │   │   ├── __init__.py
│   │   │   ├── users.py
│   │   │   └── items.py
│   ├── core/          # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── security.py
│   ├── db/            # 数据库
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── session.py
├── tests/             # 测试代码
├── alembic/           # 数据库迁移
├── pyproject.toml     # 项目配置
└── .env               # 环境变量
```

## FastAPI数据库集成

### SQLAlchemy ORM

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

# 依赖函数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```

### 异步ORM - SQLAlchemy 1.4+/2.0

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

@app.get("/users/{user_id}")
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## FastAPI认证与安全

### OAuth2 认证

```python
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
```

## FastAPI测试

### 使用TestClient

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"name": "Test Item", "price": 10.5}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Item"
```

### 异步测试

```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_read_main():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
```

## FastAPI部署

### 生产部署

```bash
# 安装生产依赖
pip install uvicorn[standard] gunicorn

# 使用Gunicorn和Uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker部署

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY .. .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## FastAPI与其他框架对比

### FastAPI vs Flask

| 特性 | FastAPI | Flask |
|------|---------|-------|
| 性能 | 非常高（基于Starlette） | 良好 |
| 异步支持 | 原生支持 | 有限 |
| API文档 | 内置（Swagger/ReDoc） | 需扩展 |
| 数据验证 | 内置（Pydantic） | 需扩展 |
| 类型提示 | 核心特性 | 可选 |
| 学习曲线 | 中等 | 低 |
| 社区与生态 | 增长迅速 | 成熟庞大 |

### FastAPI vs Django

| 特性 | FastAPI | Django |
|------|---------|--------|
| 范围 | API专注 | 全栈框架 |
| 性能 | 高性能 | 中等 |
| 电池包含 | 专注于API | 全面功能 |
| 异步支持 | 完全支持 | 部分支持 |
| 学习曲线 | 中等 | 陡峭 |
| 适用场景 | API服务、微服务 | 全栈Web应用 |

## 总结

FastAPI代表了Python Web开发的新一代框架，结合了高性能、强类型安全和开发者友好的特性。其主要优势包括：

1. **性能卓越**：基于Starlette的异步性能接近Go和NodeJS
2. **类型安全**：利用Python类型提示提供更好的代码补全和错误检查
3. **自动文档**：无需额外工作即可获得交互式API文档
4. **标准兼容**：遵循OpenAPI和JSON Schema标准
5. **易于学习**：直观的设计和全面的文档

对于API开发、微服务和需要高性能的现代Web应用，FastAPI是一个极具竞争力的选择。 