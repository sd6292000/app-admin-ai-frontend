# Gateway Admin 数据库表结构设计

## 概述
本文档描述了网关管理系统的数据库表结构设计，使用MySQL作为数据库，支持JPA Envers进行版本管理和审计。

## 数据库配置
- **数据库类型**: MySQL 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **版本管理**: Hibernate Envers
- **审计表后缀**: _AUDIT

## 核心表结构

### 1. gateway_configs (网关配置主表)

网关配置的核心表，存储所有网关配置的基本信息。

```sql
CREATE TABLE gateway_configs (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    request_path_pattern VARCHAR(500) NOT NULL,
    backend_forward_path VARCHAR(500) NOT NULL,
    cmdb_project VARCHAR(100),
    status ENUM('ACTIVE', 'DISABLED', 'DRAFT', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    extension_type VARCHAR(50),
    extension_data JSON,
    description VARCHAR(1000),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    UNIQUE KEY uk_domain_path (domain, request_path_pattern),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_extension_type (extension_type)
);
```

**字段说明**:
- `id`: 主键，UUID格式
- `domain`: 域名，与request_path_pattern组成唯一约束
- `request_path_pattern`: 请求路径模式
- `backend_forward_path`: 后端转发路径
- `cmdb_project`: CMDB项目标识
- `status`: 配置状态
- `extension_type`: 扩展类型，用于未来功能扩展
- `extension_data`: 扩展数据，JSON格式
- `version`: 版本号，用于版本管理
- `created_at/updated_at`: 创建和更新时间
- `created_by/updated_by`: 创建和更新用户

### 2. backend_servers (后端服务器表)

存储网关配置关联的后端服务器信息。

```sql
CREATE TABLE backend_servers (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gateway_config_id VARCHAR(36) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    protocol ENUM('HTTP', 'HTTPS') NOT NULL DEFAULT 'HTTP',
    region ENUM('EU', 'AS', 'AM') NOT NULL,
    data_center VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    weight INT NOT NULL DEFAULT 1,
    health_check_url VARCHAR(500),
    timeout_seconds INT NOT NULL DEFAULT 30,
    retry_count INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (gateway_config_id) REFERENCES gateway_configs(id) ON DELETE CASCADE,
    INDEX idx_gateway_config_id (gateway_config_id),
    INDEX idx_hostname (hostname),
    INDEX idx_enabled (enabled)
);
```

### 3. limiter_configs (限流配置表)

存储网关的限流和熔断器配置。

```sql
CREATE TABLE limiter_configs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gateway_config_id VARCHAR(36) NOT NULL,
    max_concurrent INT,
    max_per_minute INT,
    max_per_second INT,
    allowed_methods JSON,
    rate_limit_window_seconds INT NOT NULL DEFAULT 60,
    burst_size INT,
    circuit_breaker_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    error_threshold_percentage INT DEFAULT 50,
    recovery_time_seconds INT DEFAULT 60,
    half_open_max_calls INT DEFAULT 5,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (gateway_config_id) REFERENCES gateway_configs(id) ON DELETE CASCADE,
    INDEX idx_gateway_config_id (gateway_config_id)
);
```

### 4. ip_rules (IP规则表)

存储IP白名单/黑名单规则。

```sql
CREATE TABLE ip_rules (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    limiter_config_id BIGINT NOT NULL,
    ip_or_cidr VARCHAR(50) NOT NULL,
    mode ENUM('ALLOW', 'DENY') NOT NULL,
    description VARCHAR(500),
    priority INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (limiter_config_id) REFERENCES limiter_configs(id) ON DELETE CASCADE,
    INDEX idx_limiter_config_id (limiter_config_id),
    INDEX idx_ip_cidr (ip_or_cidr),
    INDEX idx_mode (mode)
);
```

### 5. cookie_configs (Cookie配置表)

存储Cookie处理策略配置。

```sql
CREATE TABLE cookie_configs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gateway_config_id VARCHAR(36) NOT NULL,
    global_strategy ENUM('PASSTHROUGH', 'PERSIST') NOT NULL DEFAULT 'PASSTHROUGH',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (gateway_config_id) REFERENCES gateway_configs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_gateway_config_id (gateway_config_id)
);
```

### 6. cookie_exceptions (Cookie异常规则表)

存储Cookie处理的异常规则。

```sql
CREATE TABLE cookie_exceptions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cookie_config_id BIGINT NOT NULL,
    cookie_name VARCHAR(255) NOT NULL,
    strategy ENUM('PASSTHROUGH', 'PERSIST') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cookie_config_id) REFERENCES cookie_configs(id) ON DELETE CASCADE,
    INDEX idx_cookie_config_id (cookie_config_id)
);
```

### 7. header_configs (Header配置表)

存储请求和响应Header配置，包括CSP和Cache配置。

```sql
CREATE TABLE header_configs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gateway_config_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (gateway_config_id) REFERENCES gateway_configs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_gateway_config_id (gateway_config_id)
);
```

### 8. headers (Header规则表)

存储具体的Header规则。

```sql
CREATE TABLE headers (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    header_config_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    header_type ENUM('REQUEST', 'RESPONSE') NOT NULL,
    override BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (header_config_id) REFERENCES header_configs(id) ON DELETE CASCADE,
    INDEX idx_header_config_id (header_config_id),
    INDEX idx_header_type (header_type),
    INDEX idx_name (name)
);
```

### 9. csp_headers (CSP Header表)

存储内容安全策略配置，作为响应Header。

```sql
CREATE TABLE csp_headers (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    header_config_id BIGINT NOT NULL,
    template_type ENUM('STRICT', 'BASIC', 'CUSTOM') NOT NULL DEFAULT 'BASIC',
    csp_policy TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (header_config_id) REFERENCES header_configs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_header_config_id (header_config_id)
);
```

### 10. cache_headers (Cache Header表)

存储HTTP缓存策略配置，作为响应Header。

```sql
CREATE TABLE cache_headers (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    header_config_id BIGINT NOT NULL,
    cache_control VARCHAR(500),
    etag_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    max_age_seconds INT,
    stale_while_revalidate_seconds INT,
    stale_if_error_seconds INT,
    vary_headers JSON,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (header_config_id) REFERENCES header_configs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_header_config_id (header_config_id)
);
```

### 11. response_body_decorators (响应体装饰器表)

存储错误页面映射配置。

```sql
CREATE TABLE response_body_decorators (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gateway_config_id VARCHAR(36) NOT NULL,
    status_code VARCHAR(10) NOT NULL,
    page_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (gateway_config_id) REFERENCES gateway_configs(id) ON DELETE CASCADE,
    INDEX idx_gateway_config_id (gateway_config_id),
    INDEX idx_status_code (status_code)
);
```

### 12. extension_configs (扩展配置表)

存储扩展功能配置，支持结构化数据。

```sql
CREATE TABLE extension_configs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gateway_config_id VARCHAR(36) NOT NULL,
    extension_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (gateway_config_id) REFERENCES gateway_configs(id) ON DELETE CASCADE,
    INDEX idx_gateway_config_id (gateway_config_id),
    INDEX idx_extension_type (extension_type),
    INDEX idx_enabled (enabled)
);
```

### 13. security_auth_configs (安全认证配置表)

存储安全认证相关配置。

```sql
CREATE TABLE security_auth_configs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    extension_config_id BIGINT NOT NULL,
    auth_type ENUM('BASIC', 'API_KEY', 'JWT', 'OAUTH2', 'CUSTOM') NOT NULL DEFAULT 'BASIC',
    username VARCHAR(100),
    password VARCHAR(255),
    api_key VARCHAR(255),
    api_key_header VARCHAR(100) DEFAULT 'X-API-Key',
    jwt_secret VARCHAR(255),
    jwt_issuer VARCHAR(100),
    jwt_audience VARCHAR(100),
    oauth2_client_id VARCHAR(100),
    oauth2_client_secret VARCHAR(255),
    oauth2_authorization_url VARCHAR(500),
    oauth2_token_url VARCHAR(500),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (extension_config_id) REFERENCES extension_configs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_extension_config_id (extension_config_id)
);
```

### 14. dynamic_header_injections (动态Header注入表)

存储动态Header注入配置。

```sql
CREATE TABLE dynamic_header_injections (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    extension_config_id BIGINT NOT NULL,
    header_name VARCHAR(255) NOT NULL,
    header_value TEXT,
    value_type ENUM('STATIC', 'DYNAMIC', 'EXPRESSION') NOT NULL DEFAULT 'STATIC',
    value_expression TEXT,
    condition_expression TEXT,
    priority INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (extension_config_id) REFERENCES extension_configs(id) ON DELETE CASCADE,
    INDEX idx_extension_config_id (extension_config_id),
    INDEX idx_header_name (header_name),
    INDEX idx_enabled (enabled)
);
```

## 审计表结构

所有主表都有对应的审计表，命名规则为：`原表名_AUDIT`

### 示例：gateway_configs_AUDIT

```sql
CREATE TABLE gateway_configs_AUDIT (
    id VARCHAR(36) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    request_path_pattern VARCHAR(500) NOT NULL,
    backend_forward_path VARCHAR(500) NOT NULL,
    cmdb_project VARCHAR(100),
    status ENUM('ACTIVE', 'DISABLED', 'DRAFT', 'ARCHIVED') NOT NULL,
    extension_type VARCHAR(50),
    extension_data JSON,
    description VARCHAR(1000),
    version INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    REV INT NOT NULL,
    REVTYPE TINYINT,
    
    PRIMARY KEY (id, REV),
    FOREIGN KEY (REV) REFERENCES REVINFO(REV)
);
```

## 扩展性设计

### 1. extension_type 字段
- 用于标识配置的扩展类型
- 支持未来功能扩展
- 可以关联到扩展表

### 2. extension_data 字段
- JSON格式存储扩展数据
- 支持灵活的扩展配置
- 无需修改表结构即可添加新字段

### 3. 结构化扩展配置
- `extension_configs` 表支持结构化数据扩展
- `security_auth_configs` 安全认证配置
- `dynamic_header_injections` 动态Header注入配置
- 支持多种扩展类型和优先级

### 4. Header整合设计
- CSP和Cache配置整合到Header系统中
- 作为特殊的响应Header处理
- 通过Service层转换为合适的DTO

## 索引策略

### 主键索引
- 所有表都有主键索引
- UUID主键使用B-tree索引

### 唯一索引
- `gateway_configs`: (domain, request_path_pattern)
- 一对一关系表的外键唯一索引

### 普通索引
- 外键字段索引
- 查询频繁的字段索引
- 状态字段索引

## 数据完整性约束

### 外键约束
- 所有关联表都有外键约束
- 级联删除配置
- 防止孤立数据

### 检查约束
- 枚举字段的值检查
- 数值字段的范围检查
- 字符串字段的长度检查

## 版本管理

### Envers配置
- 审计表自动生成
- 版本历史记录
- 变更追踪

### 版本控制策略
- 每次修改自动创建新版本
- 版本号递增
- 支持版本回滚 