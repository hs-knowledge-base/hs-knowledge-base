# Python数据库交互

数据库交互是几乎所有服务端应用的核心部分。Python提供了丰富的库和工具来与各种类型的数据库进行交互，从关系型数据库到NoSQL数据库。本文将介绍Python中常用的数据库交互方式和工具。

## 关系型数据库

### 直接使用数据库驱动

#### SQLite

Python标准库内置了SQLite支持：

```python
import sqlite3

# 连接到数据库（如果不存在则创建）
conn = sqlite3.connect('example.db')
cursor = conn.cursor()

# 创建表
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER
)
''')

# 插入数据
cursor.execute("INSERT INTO users (name, email, age) VALUES (?, ?, ?)", 
               ("Alice", "alice@example.com", 30))

# 查询数据
cursor.execute("SELECT * FROM users WHERE age > ?", (25,))
for row in cursor.fetchall():
    print(row)

# 提交更改并关闭连接
conn.commit()
conn.close()
```

#### PostgreSQL

使用psycopg2库连接PostgreSQL：

```python
import psycopg2

# 连接到数据库
conn = psycopg2.connect(
    host="localhost",
    database="mydatabase",
    user="myuser",
    password="mypassword"
)
cursor = conn.cursor()

# 创建表
cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL
)
''')

# 插入数据
cursor.execute(
    "INSERT INTO products (name, price, stock) VALUES (%s, %s, %s) RETURNING id",
    ("Laptop", 999.99, 10)
)
product_id = cursor.fetchone()[0]
print(f"Inserted product with ID: {product_id}")

# 查询数据
cursor.execute("SELECT * FROM products WHERE price < %s", (1000,))
for row in cursor.fetchall():
    print(row)

# 提交更改并关闭连接
conn.commit()
conn.close()
```

#### MySQL

使用mysql-connector-python库连接MySQL：

```python
import mysql.connector

# 连接到数据库
conn = mysql.connector.connect(
    host="localhost",
    database="mydatabase",
    user="myuser",
    password="mypassword"
)
cursor = conn.cursor()

# 创建表
cursor.execute('''
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATETIME NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL
)
''')

# 插入数据
cursor.execute(
    "INSERT INTO orders (customer_id, order_date, total_amount) VALUES (%s, %s, %s)",
    (101, "2023-01-15 14:30:00", 245.67)
)

# 查询数据
cursor.execute("SELECT * FROM orders WHERE total_amount > %s", (200,))
for row in cursor.fetchall():
    print(row)

# 提交更改并关闭连接
conn.commit()
conn.close()
```

### ORM (对象关系映射)

#### SQLAlchemy

SQLAlchemy是Python中最流行的ORM库：

```python
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# 创建引擎和基类
engine = create_engine('sqlite:///example.db', echo=True)
Base = declarative_base()

# 定义模型
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    orders = relationship("Order", back_populates="user")
    
    def __repr__(self):
        return f"<User(name='{self.name}', email='{self.email}')>"

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    product_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    user = relationship("User", back_populates="orders")
    
    def __repr__(self):
        return f"<Order(product_name='{self.product_name}', price={self.price})>"

# 创建表
Base.metadata.create_all(engine)

# 创建会话
Session = sessionmaker(bind=engine)
session = Session()

# 添加数据
new_user = User(name="Bob", email="bob@example.com")
session.add(new_user)
session.commit()

# 添加关联数据
new_order = Order(user_id=new_user.id, product_name="Tablet", price=399.99)
session.add(new_order)
session.commit()

# 查询数据
user = session.query(User).filter_by(name="Bob").first()
print(user)
print(user.orders)

# 关闭会话
session.close()
```

#### Django ORM

Django ORM是Django框架的一部分，但也可以独立使用：

```python
# 在Django项目中的models.py
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    published_date = models.DateField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    
    def __str__(self):
        return self.title

# 在视图或其他代码中使用
# 创建
author = Author.objects.create(name="Jane Doe", bio="A prolific writer")
Book.objects.create(
    title="Python Mastery", 
    author=author,
    published_date="2023-03-15",
    price=39.99
)

# 查询
books = Book.objects.filter(price__lt=50.0).order_by('-published_date')
for book in books:
    print(f"{book.title} by {book.author.name}")

# 更新
author.name = "Jane Smith"
author.save()

# 删除
book = Book.objects.get(title="Python Mastery")
book.delete()
```

#### Peewee

Peewee是一个轻量级的ORM库：

```python
from peewee import *
import datetime

# 创建数据库连接
db = SqliteDatabase('example.db')

# 定义基类
class BaseModel(Model):
    class Meta:
        database = db

# 定义模型
class Category(BaseModel):
    name = CharField(unique=True)
    description = TextField(null=True)

class Item(BaseModel):
    name = CharField()
    price = DecimalField(max_digits=10, decimal_places=2)
    created_at = DateTimeField(default=datetime.datetime.now)
    category = ForeignKeyField(Category, backref='items')

# 连接并创建表
db.connect()
db.create_tables([Category, Item])

# 创建数据
electronics = Category.create(name='Electronics', description='Electronic devices')
Item.create(name='Smartphone', price=699.99, category=electronics)
Item.create(name='Headphones', price=149.99, category=electronics)

# 查询数据
for item in Item.select().join(Category).where(Category.name == 'Electronics'):
    print(f"{item.name}: ${item.price} ({item.category.name})")

# 关闭连接
db.close()
```

### 数据库迁移工具

#### Alembic

Alembic与SQLAlchemy配合使用的迁移工具：

```python
# 初始化Alembic（在命令行执行）
# alembic init migrations

# 配置alembic.ini和env.py文件，设置数据库连接

# 创建迁移脚本（在命令行执行）
# alembic revision --autogenerate -m "Create users table"

# 迁移脚本示例 (migrations/versions/xxx_create_users_table.py)
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('email', sa.String(100), nullable=False, unique=True)
    )

def downgrade():
    op.drop_table('users')

# 应用迁移（在命令行执行）
# alembic upgrade head

# 回滚迁移（在命令行执行）
# alembic downgrade -1
```

#### Django Migrations

Django内置的迁移系统：

```bash
# 生成迁移文件
python manage.py makemigrations

# 应用迁移
python manage.py migrate

# 回滚迁移
python manage.py migrate app_name migration_name
```

## NoSQL数据库

### MongoDB

使用PyMongo连接MongoDB：

```python
from pymongo import MongoClient

# 连接到MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['mydatabase']
collection = db['users']

# 插入文档
user = {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 35,
    "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY"
    },
    "interests": ["reading", "hiking", "photography"]
}
result = collection.insert_one(user)
print(f"Inserted document with ID: {result.inserted_id}")

# 查询文档
for user in collection.find({"age": {"$gt": 30}}):
    print(f"{user['name']} is {user['age']} years old")

# 更新文档
collection.update_one(
    {"name": "John Doe"},
    {"$set": {"age": 36, "interests": ["reading", "hiking", "coding"]}}
)

# 删除文档
collection.delete_one({"name": "John Doe"})

# 关闭连接
client.close()
```

### Redis

使用redis-py连接Redis：

```python
import redis

# 连接到Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# 设置字符串值
r.set('user:1:name', 'Alice')
r.set('user:1:email', 'alice@example.com')
r.expire('user:1:name', 3600)  # 过期时间（秒）

# 获取值
name = r.get('user:1:name')
print(f"Name: {name.decode('utf-8')}")

# 列表操作
r.lpush('recent_users', 'user:1', 'user:2', 'user:3')
recent_user = r.lpop('recent_users')
print(f"Recent user: {recent_user.decode('utf-8')}")

# 集合操作
r.sadd('active_users', 'user:1', 'user:2')
r.sadd('premium_users', 'user:2', 'user:3')
common_users = r.sinter('active_users', 'premium_users')
print("Common users:", [user.decode('utf-8') for user in common_users])

# 哈希操作
r.hset('user:1', 'name', 'Alice')
r.hset('user:1', 'email', 'alice@example.com')
r.hset('user:1', 'age', 30)
user_data = r.hgetall('user:1')
print("User data:", {k.decode('utf-8'): v.decode('utf-8') for k, v in user_data.items()})

# 管道操作（批处理）
pipe = r.pipeline()
pipe.set('counter', 1)
pipe.incr('counter')
pipe.incr('counter')
results = pipe.execute()
print("Pipeline results:", results)
```

### Elasticsearch

使用elasticsearch-py连接Elasticsearch：

```python
from elasticsearch import Elasticsearch

# 连接到Elasticsearch
es = Elasticsearch(['http://localhost:9200'])

# 创建索引
es.indices.create(
    index='products',
    body={
        'mappings': {
            'properties': {
                'name': {'type': 'text'},
                'description': {'type': 'text'},
                'price': {'type': 'float'},
                'categories': {'type': 'keyword'},
                'created_at': {'type': 'date'}
            }
        }
    },
    ignore=400  # 忽略索引已存在的错误
)

# 索引文档
doc = {
    'name': 'Wireless Headphones',
    'description': 'High-quality wireless headphones with noise cancellation',
    'price': 199.99,
    'categories': ['electronics', 'audio'],
    'created_at': '2023-01-10T12:30:00'
}
es.index(index='products', body=doc)

# 搜索文档
query = {
    'query': {
        'bool': {
            'must': {'match': {'description': 'wireless'}},
            'filter': {'range': {'price': {'lte': 200}}}
        }
    }
}
results = es.search(index='products', body=query)

print(f"Found {results['hits']['total']['value']} documents")
for hit in results['hits']['hits']:
    print(f"Score: {hit['_score']}")
    print(f"Document: {hit['_source']}")

# 删除文档
es.delete_by_query(
    index='products',
    body={'query': {'match': {'name': 'Wireless Headphones'}}}
)
```

## 数据库连接池

### SQLAlchemy连接池

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# 创建带有连接池的引擎
engine = create_engine(
    'postgresql://user:password@localhost/mydatabase',
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800  # 重用连接前的秒数
)

# 使用连接
with engine.connect() as conn:
    result = conn.execute("SELECT * FROM users LIMIT 10")
    for row in result:
        print(row)
```

### DBUtils连接池

```python
from dbutils.pooled_db import PooledDB
import pymysql

# 创建连接池
pool = PooledDB(
    creator=pymysql,        # 使用的DB模块
    maxconnections=10,      # 连接池最大连接数
    mincached=2,            # 初始化时最小空闲连接数
    maxcached=5,            # 连接池最大空闲连接数
    maxshared=3,            # 连接池中最大共享连接数
    blocking=True,          # 连接池中如果没有可用连接是否阻塞等待
    maxusage=None,          # 一个连接最多被重复使用的次数
    host='localhost',
    port=3306,
    user='myuser',
    password='mypassword',
    database='mydatabase'
)

# 获取连接
conn = pool.connection()
cursor = conn.cursor()
cursor.execute("SELECT * FROM users LIMIT 10")
for row in cursor.fetchall():
    print(row)
cursor.close()
conn.close()  # 实际上是返回到连接池
```

## 异步数据库交互

### 异步SQLAlchemy (2.0+)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String
import asyncio

# 创建异步引擎
engine = create_async_engine(
    "postgresql+asyncpg://user:password@localhost/mydatabase",
    echo=True,
)

# 创建基类和模型
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)

# 创建异步会话
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def add_user(name, email):
    async with async_session() as session:
        user = User(name=name, email=email)
        session.add(user)
        await session.commit()
        return user.id

async def get_user(user_id):
    async with async_session() as session:
        user = await session.get(User, user_id)
        return user

async def main():
    await create_tables()
    user_id = await add_user("Alice", "alice@example.com")
    user = await get_user(user_id)
    print(f"User: {user.name} ({user.email})")

asyncio.run(main())
```

### Motor (异步MongoDB)

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    # 连接到MongoDB
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.mydatabase
    collection = db.users
    
    # 插入文档
    result = await collection.insert_one({
        "name": "Alice",
        "email": "alice@example.com",
        "age": 30
    })
    print(f"Inserted document with ID: {result.inserted_id}")
    
    # 查询文档
    async for document in collection.find({"age": {"$gte": 30}}):
        print(document)
    
    # 更新文档
    result = await collection.update_one(
        {"name": "Alice"},
        {"$set": {"age": 31}}
    )
    print(f"Modified {result.modified_count} document(s)")
    
    # 删除文档
    result = await collection.delete_one({"name": "Alice"})
    print(f"Deleted {result.deleted_count} document(s)")

asyncio.run(main())
```

### aioredis (异步Redis)

```python
import asyncio
import aioredis

async def main():
    # 连接到Redis
    redis = await aioredis.create_redis_pool('redis://localhost')
    
    # 设置和获取值
    await redis.set('key', 'value')
    value = await redis.get('key')
    print(value.decode())
    
    # 列表操作
    await redis.rpush('list', 'item1', 'item2', 'item3')
    items = await redis.lrange('list', 0, -1)
    print([item.decode() for item in items])
    
    # 哈希操作
    await redis.hmset_dict('hash', {
        'field1': 'value1',
        'field2': 'value2'
    })
    fields = await redis.hgetall('hash')
    print({k.decode(): v.decode() for k, v in fields.items()})
    
    # 管道操作
    pipe = redis.pipeline()
    pipe.set('counter', '0')
    pipe.incr('counter')
    pipe.incr('counter')
    results = await pipe.execute()
    print(results)
    
    # 关闭连接
    redis.close()
    await redis.wait_closed()

asyncio.run(main())
```

## 高级数据库模式

### 分片与分区

```python
# PostgreSQL表分区示例
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="mydatabase",
    user="myuser",
    password="mypassword"
)
cursor = conn.cursor()

# 创建分区表
cursor.execute('''
CREATE TABLE measurements (
    id SERIAL,
    device_id INTEGER NOT NULL,
    reading DECIMAL NOT NULL,
    time TIMESTAMP NOT NULL
) PARTITION BY RANGE (time);
''')

# 创建分区
cursor.execute('''
CREATE TABLE measurements_y2022m01 PARTITION OF measurements
FOR VALUES FROM ('2022-01-01') TO ('2022-02-01');
''')

cursor.execute('''
CREATE TABLE measurements_y2022m02 PARTITION OF measurements
FOR VALUES FROM ('2022-02-01') TO ('2022-03-01');
''')

# 插入数据会自动路由到正确的分区
cursor.execute('''
INSERT INTO measurements (device_id, reading, time)
VALUES (1, 23.5, '2022-01-15 12:00:00');
''')

cursor.execute('''
INSERT INTO measurements (device_id, reading, time)
VALUES (1, 24.1, '2022-02-15 12:00:00');
''')

conn.commit()
conn.close()
```

### 读写分离

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 创建主从数据库引擎
master_engine = create_engine('postgresql://user:password@master/db')
slave_engine = create_engine('postgresql://user:password@slave/db')

# 创建会话工厂
MasterSession = sessionmaker(bind=master_engine)
SlaveSession = sessionmaker(bind=slave_engine)

# 读操作使用从库
def read_data():
    session = SlaveSession()
    try:
        results = session.query(User).all()
        return results
    finally:
        session.close()

# 写操作使用主库
def write_data(user):
    session = MasterSession()
    try:
        session.add(user)
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
```

### 数据库事务

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="mydatabase",
    user="myuser",
    password="mypassword"
)

# 自动提交设置为False（默认）
conn.autocommit = False

try:
    cursor = conn.cursor()
    
    # 第一个操作
    cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    
    # 第二个操作
    cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
    
    # 如果两个操作都成功，提交事务
    conn.commit()
    print("Transaction completed successfully")
    
except psycopg2.Error as e:
    # 如果有任何错误，回滚事务
    conn.rollback()
    print(f"Transaction failed: {e}")
    
finally:
    conn.close()
```

## 安全最佳实践

### 参数化查询

```python
# 不安全的方式（容易受到SQL注入攻击）
username = "user' OR '1'='1"
unsafe_query = f"SELECT * FROM users WHERE username = '{username}'"

# 安全的方式（使用参数化查询）
cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
```

### 连接字符串安全

```python
import os
from urllib.parse import quote_plus

# 从环境变量获取敏感信息
db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")
db_host = os.environ.get("DB_HOST")
db_name = os.environ.get("DB_NAME")

# 使用URL编码处理特殊字符
password_encoded = quote_plus(db_password)

# 构建连接字符串
connection_string = f"postgresql://{db_user}:{password_encoded}@{db_host}/{db_name}"
```

### 最小权限原则

```python
# 创建只读用户（PostgreSQL）
cursor.execute('''
CREATE ROLE readonly WITH LOGIN PASSWORD 'password';
GRANT CONNECT ON DATABASE mydatabase TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
''')

# 创建应用专用用户（MySQL）
cursor.execute('''
CREATE USER 'app_user'@'%' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE ON myapp.* TO 'app_user'@'%';
REVOKE DELETE ON myapp.* FROM 'app_user'@'%';
FLUSH PRIVILEGES;
''')
```

## 总结

Python提供了丰富的工具和库来与各种类型的数据库进行交互。从直接使用数据库驱动到高级ORM，从关系型数据库到NoSQL数据库，Python生态系统都提供了完善的支持。

在选择数据库交互方式时，需要考虑以下因素：

1. **应用类型**：简单脚本可能只需要直接使用数据库驱动，而复杂应用可能受益于ORM
2. **性能需求**：直接SQL通常性能更好，但ORM提供更好的开发体验
3. **数据库类型**：关系型数据库还是NoSQL，不同类型有不同的交互方式
4. **同步/异步**：同步还是异步操作，取决于应用的并发需求

无论选择哪种方式，都应遵循安全最佳实践，如使用参数化查询防止SQL注入，安全管理连接凭据，以及遵循最小权限原则。 