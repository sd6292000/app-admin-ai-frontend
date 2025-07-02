# Gateway Admin 数据库实体关系图

## ERD 图

```mermaid
erDiagram
    GATEWAY_CONFIGS {
        string id PK
        string domain
        string request_path_pattern
        string backend_forward_path
        string cmdb_project
        enum status
        string extension_type
        json extension_data
        string description
        int version
        timestamp created_at
        timestamp updated_at
        string created_by
        string updated_by
    }

    BACKEND_SERVERS {
        bigint id PK
        string gateway_config_id FK
        string hostname
        int port
        enum protocol
        enum region
        string data_center
        boolean enabled
        int weight
        string health_check_url
        int timeout_seconds
        int retry_count
        timestamp created_at
        timestamp updated_at
    }

    LIMITER_CONFIGS {
        bigint id PK
        string gateway_config_id FK
        int max_concurrent
        int max_per_minute
        int max_per_second
        json allowed_methods
        int rate_limit_window_seconds
        int burst_size
        boolean circuit_breaker_enabled
        int error_threshold_percentage
        int recovery_time_seconds
        int half_open_max_calls
        timestamp created_at
        timestamp updated_at
    }

    IP_RULES {
        bigint id PK
        bigint limiter_config_id FK
        string ip_or_cidr
        enum mode
        string description
        int priority
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    COOKIE_CONFIGS {
        bigint id PK
        string gateway_config_id FK
        enum global_strategy
        timestamp created_at
        timestamp updated_at
    }

    COOKIE_EXCEPTIONS {
        bigint id PK
        bigint cookie_config_id FK
        string cookie_name
        enum strategy
        timestamp created_at
        timestamp updated_at
    }

    HEADER_CONFIGS {
        bigint id PK
        string gateway_config_id FK
        timestamp created_at
        timestamp updated_at
    }

    HEADERS {
        bigint id PK
        bigint header_config_id FK
        string name
        text value
        enum header_type
        boolean override
        boolean enabled
        string description
        timestamp created_at
        timestamp updated_at
    }

    CSP_HEADERS {
        bigint id PK
        bigint header_config_id FK
        enum template_type
        text csp_policy
        boolean enabled
        string description
        timestamp created_at
        timestamp updated_at
    }

    CACHE_HEADERS {
        bigint id PK
        bigint header_config_id FK
        string cache_control
        boolean etag_enabled
        int max_age_seconds
        int stale_while_revalidate_seconds
        int stale_if_error_seconds
        json vary_headers
        boolean enabled
        string description
        timestamp created_at
        timestamp updated_at
    }

    RESPONSE_BODY_DECORATORS {
        bigint id PK
        string gateway_config_id FK
        string status_code
        string page_path
        timestamp created_at
        timestamp updated_at
    }

    EXTENSION_CONFIGS {
        bigint id PK
        string gateway_config_id FK
        string extension_type
        boolean enabled
        string description
        int priority
        timestamp created_at
        timestamp updated_at
    }

    SECURITY_AUTH_CONFIGS {
        bigint id PK
        bigint extension_config_id FK
        enum auth_type
        string username
        string password
        string api_key
        string api_key_header
        string jwt_secret
        string jwt_issuer
        string jwt_audience
        string oauth2_client_id
        string oauth2_client_secret
        string oauth2_authorization_url
        string oauth2_token_url
        boolean enabled
        string description
        timestamp created_at
        timestamp updated_at
    }

    DYNAMIC_HEADER_INJECTIONS {
        bigint id PK
        bigint extension_config_id FK
        string header_name
        text header_value
        enum value_type
        text value_expression
        text condition_expression
        int priority
        boolean enabled
        string description
        timestamp created_at
        timestamp updated_at
    }

    %% 关系定义
    GATEWAY_CONFIGS ||--o{ BACKEND_SERVERS : "has many"
    GATEWAY_CONFIGS ||--o| LIMITER_CONFIGS : "has one"
    GATEWAY_CONFIGS ||--o| COOKIE_CONFIGS : "has one"
    GATEWAY_CONFIGS ||--o| HEADER_CONFIGS : "has one"
    GATEWAY_CONFIGS ||--o{ RESPONSE_BODY_DECORATORS : "has many"
    GATEWAY_CONFIGS ||--o{ EXTENSION_CONFIGS : "has many"

    LIMITER_CONFIGS ||--o{ IP_RULES : "has many"
    COOKIE_CONFIGS ||--o{ COOKIE_EXCEPTIONS : "has many"
    HEADER_CONFIGS ||--o{ HEADERS : "has many"
    HEADER_CONFIGS ||--o| CSP_HEADERS : "has one"
    HEADER_CONFIGS ||--o| CACHE_HEADERS : "has one"

    EXTENSION_CONFIGS ||--o| SECURITY_AUTH_CONFIGS : "has one"
    EXTENSION_CONFIGS ||--o{ DYNAMIC_HEADER_INJECTIONS : "has many"
```

## 表关系说明

### 1. 核心关系
- **GATEWAY_CONFIGS** 是主表，包含所有网关配置的基本信息
- 每个网关配置可以有多个后端服务器（一对多）
- 每个网关配置有且仅有一个限流配置、Cookie配置、Header配置（一对一）
- 每个网关配置可以有多个响应体装饰器和扩展配置（一对多）

### 2. Header系统整合
- **HEADER_CONFIGS** 作为Header配置的主表
- **HEADERS** 存储普通的请求和响应Header
- **CSP_HEADERS** 存储内容安全策略配置，作为特殊的响应Header
- **CACHE_HEADERS** 存储缓存策略配置，作为特殊的响应Header

### 3. 扩展配置系统
- **EXTENSION_CONFIGS** 支持多种扩展类型
- **SECURITY_AUTH_CONFIGS** 安全认证配置（一对一）
- **DYNAMIC_HEADER_INJECTIONS** 动态Header注入配置（一对多）

### 4. 子表关系
- **LIMITER_CONFIGS** 可以有多个 **IP_RULES**（一对多）
- **COOKIE_CONFIGS** 可以有多个 **COOKIE_EXCEPTIONS**（一对多）
- **HEADER_CONFIGS** 可以有多个 **HEADERS**（一对多）

## 数据流图

```mermaid
flowchart TD
    A[前端请求] --> B[Controller层]
    B --> C[Service层]
    C --> D[Repository层]
    D --> E[数据库]
    
    E --> F[Envers审计表]
    E --> G[主数据表]
    
    C --> H[缓存层]
    H --> I[Redis/Memory]
    
    C --> J[版本管理]
    J --> K[版本历史]
    
    C --> L[扩展功能]
    L --> M[扩展表]
    
    C --> N[Header转换]
    N --> O[CSP Header]
    N --> P[Cache Header]
    N --> Q[普通Header]
```

## 索引策略

### 主键索引
- 所有表都有主键索引
- 使用B-tree索引提高查询性能

### 外键索引
- 所有外键字段都创建索引
- 提高JOIN查询性能

### 业务索引
- `gateway_configs.domain + request_path_pattern` 唯一索引
- `gateway_configs.status` 状态索引
- `gateway_configs.extension_type` 扩展类型索引
- `backend_servers.hostname` 主机名索引
- `ip_rules.ip_or_cidr` IP地址索引
- `headers.name` Header名称索引
- `extension_configs.extension_type` 扩展类型索引

## 数据完整性

### 外键约束
- 所有关联表都有外键约束
- 级联删除配置
- 防止数据不一致

### 唯一性约束
- 域名和路径组合唯一
- 一对一关系表的外键唯一

### 检查约束
- 枚举字段值检查
- 数值字段范围检查
- 字符串字段长度检查

## 性能优化

### 查询优化
- 使用合适的索引
- 避免全表扫描
- 优化JOIN查询

### 缓存策略
- 二级缓存配置
- 查询缓存使用
- 缓存失效策略

### 分页查询
- 使用LIMIT和OFFSET
- 避免深度分页问题
- 优化COUNT查询 