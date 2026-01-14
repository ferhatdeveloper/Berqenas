# Auto-API Generator

**Automatic CRUD API generation from MSSQL database tables**

## Overview

The Auto-API Generator analyzes your MSSQL database structure and automatically generates:
- ✅ Pydantic models for each table
- ✅ FastAPI routers with full CRUD operations
- ✅ Type-safe API endpoints
- ✅ Automatic validation

## Features

### 1. Database Introspection
- Analyzes table structure
- Detects column types
- Identifies primary keys
- Handles nullable fields
- Detects identity columns

### 2. Model Generation
- Creates Pydantic models
- Maps SQL types to Python types
- Handles Optional fields
- Includes validation

### 3. Router Generation
- Full CRUD operations (Create, Read, Update, Delete)
- List with pagination
- Get by ID
- Automatic SQL query generation
- Error handling

## Usage

### CLI

#### 1. Analyze Database
```bash
berqenas autogen introspect \
  --server localhost \
  --database tenant_acme \
  --username sa \
  --password MyPassword123
```

#### 2. Generate API
```bash
berqenas autogen generate \
  --server localhost \
  --database tenant_acme \
  --username sa \
  --password MyPassword123 \
  --output ./generated_api/acme
```

### API

#### Introspect Database
```http
POST /api/v1/autogen/introspect
Content-Type: application/json

{
  "server": "localhost",
  "database": "tenant_acme",
  "username": "sa",
  "password": "MyPassword123",
  "schema": "dbo"
}
```

#### Generate API
```http
POST /api/v1/autogen/generate
Content-Type: application/json

{
  "connection": {
    "server": "localhost",
    "database": "tenant_acme",
    "username": "sa",
    "password": "MyPassword123",
    "schema": "dbo"
  },
  "output_dir": "./generated_api/acme"
}
```

## Generated Structure

```
generated_api/
├── models/
│   ├── users_models.py
│   ├── products_models.py
│   └── orders_models.py
├── routers/
│   ├── users_router.py
│   ├── products_router.py
│   └── orders_router.py
└── main_router.py
```

## Example Generated API

### Model (users_models.py)
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    is_active: Optional[bool] = None
    
    class Config:
        from_attributes = True
```

### Router (users_router.py)
```python
@router.get("/users", response_model=List[User])
async def list_users(skip: int = 0, limit: int = 100):
    """Get all users"""
    # Auto-generated CRUD logic

@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """Get single user"""
    # Auto-generated CRUD logic

@router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    """Create new user"""
    # Auto-generated CRUD logic

@router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user: UserUpdate):
    """Update user"""
    # Auto-generated CRUD logic

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Delete user"""
    # Auto-generated CRUD logic
```

## Type Mapping

| SQL Type | Python Type |
|----------|-------------|
| int, bigint, smallint | int |
| bit | bool |
| decimal, numeric, money, float | float |
| varchar, nvarchar, text | str |
| datetime, datetime2 | datetime |
| date | date |
| time | time |
| uniqueidentifier | str |

## Use Cases

### 1. Legacy System API
Quickly expose legacy MSSQL databases as modern REST APIs

### 2. Rapid Prototyping
Generate API scaffolding in seconds

### 3. Tenant Databases
Auto-generate APIs for each tenant's database

### 4. Microservices
Create database-specific microservices

## Best Practices

1. **Review Generated Code**: Always review before production
2. **Add Business Logic**: Extend generated routers with custom logic
3. **Security**: Add authentication/authorization
4. **Validation**: Add custom validators
5. **Testing**: Write tests for generated APIs

## Limitations

- Only supports MSSQL (PostgreSQL support coming soon)
- Basic CRUD operations (complex queries need manual implementation)
- No relationship handling (foreign keys)
- No transaction management

## Future Enhancements

- [ ] PostgreSQL support
- [ ] Relationship detection
- [ ] GraphQL generation
- [ ] OpenAPI spec generation
- [ ] Custom template support
- [ ] Migration generation
