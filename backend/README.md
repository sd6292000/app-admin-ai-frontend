# Gateway Admin Backend

## 项目概述

Gateway Admin Backend 是网关管理系统的后端服务，基于 Spring Boot 3 和 JPA 构建，提供完整的网关配置管理功能。

## 技术栈

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0+
- **ORM**: Spring Data JPA + Hibernate
- **版本管理**: Hibernate Envers
- **缓存**: Spring Cache
- **安全**: Spring Security
- **构建工具**: Maven
- **Java版本**: 17

## 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/gateway/admin/
│   │   │   ├── entity/           # 实体类
│   │   │   ├── repository/       # 数据访问层
│   │   │   ├── service/          # 业务逻辑层
│   │   │   ├── controller/       # 控制器层
│   │   │   ├── dto/              # 数据传输对象
│   │   │   ├── exception/        # 异常处理
│   │   │   └── config/           # 配置类
│   │   └── resources/
│   │       ├── application.yml   # 应用配置
│   │       └── sql/              # SQL脚本
│   └── test/                     # 测试代码
├── pom.xml                       # Maven配置
├── DATABASE_SCHEMA.md            # 数据库表结构文档
└── README.md                     # 项目说明
```

## 核心功能

### 1. 网关配置管理
- 创建、更新、删除网关配置
- 配置状态管理（启用/禁用）
- 配置搜索和分页查询
- 配置验证和唯一性检查

### 2. 后端服务器管理
- 多后端服务器配置
- 负载均衡权重设置
- 健康检查配置
- 区域和数据中心管理

### 3. 限流和熔断器
- 细粒度限流配置
- 熔断器参数设置
- IP白名单/黑名单
- 请求方法限制

### 4. 版本管理
- 基于 Envers 的版本控制
- 配置变更历史记录
- 版本回滚功能
- 变更审计追踪

### 5. 扩展功能
- CSP 配置管理
- 缓存策略配置
- Cookie 处理策略
- Header 管理

## 数据库设计

### 主要表结构
- `gateway_configs`: 网关配置主表
- `backend_servers`: 后端服务器表
- `limiter_configs`: 限流配置表
- `ip_rules`: IP规则表
- `cookie_configs`: Cookie配置表
- `header_configs`: Header配置表
- `csp_configs`: CSP配置表
- `cache_configs`: 缓存配置表

### 扩展性设计
- `extension_type`: 扩展类型字段
- `extension_data`: JSON格式扩展数据
- 支持未来功能扩展

## 快速开始

### 1. 环境要求
- JDK 17+
- MySQL 8.0+
- Maven 3.6+

### 2. 数据库配置
```sql
CREATE DATABASE gateway_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 应用配置
修改 `application.yml` 中的数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gateway_admin
    username: your_username
    password: your_password
```

### 4. 启动应用
```bash
mvn spring-boot:run
```

### 5. 访问应用
- 应用地址: http://localhost:8080
- API文档: http://localhost:8080/api

## API 接口

### 网关配置管理
- `GET /api/gateway-configs` - 获取配置列表
- `POST /api/gateway-configs` - 创建新配置
- `GET /api/gateway-configs/{id}` - 获取配置详情
- `PUT /api/gateway-configs/{id}` - 更新配置
- `DELETE /api/gateway-configs/{id}` - 删除配置
- `POST /api/gateway-configs/{id}/enable` - 启用配置
- `POST /api/gateway-configs/{id}/disable` - 禁用配置

### 搜索功能
- `GET /api/gateway-configs/search` - 搜索配置
- `GET /api/gateway-configs/statistics` - 获取统计信息

### 版本管理
- `GET /api/gateway-configs/{id}/versions` - 获取版本历史
- `POST /api/gateway-configs/{id}/rollback/{version}` - 版本回滚

## 开发指南

### 1. 添加新实体
1. 在 `entity` 包中创建实体类
2. 添加 `@Audited` 注解支持版本管理
3. 在 `repository` 包中创建对应的 Repository
4. 在 `service` 包中创建业务逻辑

### 2. 扩展功能
1. 使用 `extension_type` 和 `extension_data` 字段
2. 创建扩展表（使用 `ext_` 前缀）
3. 实现扩展逻辑

### 3. 缓存配置
- 使用 `@Cacheable` 注解缓存查询结果
- 使用 `@CacheEvict` 注解清除缓存
- 配置缓存策略和过期时间

### 4. 异常处理
- 继承 `GatewayConfigException` 创建业务异常
- 在 Controller 层统一处理异常
- 返回标准化的错误响应

## 测试

### 单元测试
```bash
mvn test
```

### 集成测试
```bash
mvn test -Dtest=IntegrationTest
```

### 性能测试
```bash
mvn test -Dtest=PerformanceTest
```

## 部署

### 1. 打包
```bash
mvn clean package
```

### 2. 运行
```bash
java -jar target/gateway-admin-backend-1.0.0.jar
```

### 3. Docker 部署
```bash
docker build -t gateway-admin-backend .
docker run -p 8080:8080 gateway-admin-backend
```

## 监控和维护

### 健康检查
- 端点: `/actuator/health`
- 数据库连接检查
- 缓存状态检查

### 指标监控
- 端点: `/actuator/metrics`
- 请求统计
- 性能指标

### 日志管理
- 日志文件: `logs/gateway-admin.log`
- 日志级别配置
- 日志轮转策略

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目维护者: Gateway Admin Team
- 邮箱: admin@gateway.com
- 项目地址: https://github.com/gateway-admin/backend 