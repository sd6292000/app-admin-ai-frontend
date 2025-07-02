package com.gateway.admin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Gateway Configuration Entity
 * 网关配置实体类
 * 
 * 这是系统的主要实体，包含网关的所有配置信息
 * 使用Envers进行版本管理和审计
 */
@Entity
@Table(name = "gateway_configs", 
       indexes = {
           @Index(name = "idx_domain_path", columnList = "domain, request_path_pattern", unique = true),
           @Index(name = "idx_status", columnList = "status"),
           @Index(name = "idx_created_at", columnList = "created_at"),
           @Index(name = "idx_extension_type", columnList = "extension_type")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class GatewayConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 36)
    private String id;

    @NotBlank(message = "域名不能为空")
    @Size(max = 255, message = "域名长度不能超过255个字符")
    @Column(name = "domain", nullable = false, length = 255)
    private String domain;

    @NotBlank(message = "请求路径模式不能为空")
    @Size(max = 500, message = "请求路径模式长度不能超过500个字符")
    @Column(name = "request_path_pattern", nullable = false, length = 500)
    private String requestPathPattern;

    @NotBlank(message = "后端转发路径不能为空")
    @Size(max = 500, message = "后端转发路径长度不能超过500个字符")
    @Column(name = "backend_forward_path", nullable = false, length = 500)
    private String backendForwardPath;

    @Size(max = 100, message = "CMDB项目长度不能超过100个字符")
    @Column(name = "cmdb_project", length = 100)
    private String cmdbProject;

    @NotNull(message = "状态不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ConfigStatus status = ConfigStatus.ACTIVE;

    @Size(max = 50, message = "扩展类型长度不能超过50个字符")
    @Column(name = "extension_type", length = 50)
    private String extensionType;

    @Column(name = "extension_data", columnDefinition = "JSON")
    private String extensionData;

    @Size(max = 1000, message = "描述长度不能超过1000个字符")
    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // 关联的后端服务器配置
    @OneToMany(mappedBy = "gatewayConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotAudited
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<BackendServer> backendServers = new ArrayList<>();

    // 关联的Cookie配置
    @OneToOne(mappedBy = "gatewayConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotAudited
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private CookieConfig cookieConfig;

    // 关联的Header配置
    @OneToOne(mappedBy = "gatewayConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotAudited
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private HeaderConfig headerConfig;

    // 关联的限流配置
    @OneToOne(mappedBy = "gatewayConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotAudited
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private LimiterConfig limiterConfig;

    // 关联的响应体装饰器配置
    @OneToMany(mappedBy = "gatewayConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotAudited
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<ResponseBodyDecorator> responseBodyDecorators = new ArrayList<>();

    // 关联的扩展配置
    @OneToMany(mappedBy = "gatewayConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @NotAudited
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<ExtensionConfig> extensionConfigs = new ArrayList<>();

    // 构造函数
    public GatewayConfig() {
        this.id = UUID.randomUUID().toString();
    }

    public GatewayConfig(String domain, String requestPathPattern, String backendForwardPath) {
        this();
        this.domain = domain;
        this.requestPathPattern = requestPathPattern;
        this.backendForwardPath = backendForwardPath;
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getRequestPathPattern() {
        return requestPathPattern;
    }

    public void setRequestPathPattern(String requestPathPattern) {
        this.requestPathPattern = requestPathPattern;
    }

    public String getBackendForwardPath() {
        return backendForwardPath;
    }

    public void setBackendForwardPath(String backendForwardPath) {
        this.backendForwardPath = backendForwardPath;
    }

    public String getCmdbProject() {
        return cmdbProject;
    }

    public void setCmdbProject(String cmdbProject) {
        this.cmdbProject = cmdbProject;
    }

    public ConfigStatus getStatus() {
        return status;
    }

    public void setStatus(ConfigStatus status) {
        this.status = status;
    }

    public String getExtensionType() {
        return extensionType;
    }

    public void setExtensionType(String extensionType) {
        this.extensionType = extensionType;
    }

    public String getExtensionData() {
        return extensionData;
    }

    public void setExtensionData(String extensionData) {
        this.extensionData = extensionData;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public List<BackendServer> getBackendServers() {
        return backendServers;
    }

    public void setBackendServers(List<BackendServer> backendServers) {
        this.backendServers = backendServers;
    }

    public CookieConfig getCookieConfig() {
        return cookieConfig;
    }

    public void setCookieConfig(CookieConfig cookieConfig) {
        this.cookieConfig = cookieConfig;
    }

    public HeaderConfig getHeaderConfig() {
        return headerConfig;
    }

    public void setHeaderConfig(HeaderConfig headerConfig) {
        this.headerConfig = headerConfig;
    }

    public LimiterConfig getLimiterConfig() {
        return limiterConfig;
    }

    public void setLimiterConfig(LimiterConfig limiterConfig) {
        this.limiterConfig = limiterConfig;
    }

    public List<ResponseBodyDecorator> getResponseBodyDecorators() {
        return responseBodyDecorators;
    }

    public void setResponseBodyDecorators(List<ResponseBodyDecorator> responseBodyDecorators) {
        this.responseBodyDecorators = responseBodyDecorators;
    }

    public CspConfig getCspConfig() {
        return cspConfig;
    }

    public void setCspConfig(CspConfig cspConfig) {
        this.cspConfig = cspConfig;
    }

    public CacheConfig getCacheConfig() {
        return cacheConfig;
    }

    public void setCacheConfig(CacheConfig cacheConfig) {
        this.cacheConfig = cacheConfig;
    }

    // 业务方法
    public void incrementVersion() {
        this.version++;
    }

    public void disable() {
        this.status = ConfigStatus.DISABLED;
    }

    public void enable() {
        this.status = ConfigStatus.ACTIVE;
    }

    public boolean isActive() {
        return ConfigStatus.ACTIVE.equals(this.status);
    }

    public boolean isDisabled() {
        return ConfigStatus.DISABLED.equals(this.status);
    }

    @Override
    public String toString() {
        return "GatewayConfig{" +
                "id='" + id + '\'' +
                ", domain='" + domain + '\'' +
                ", requestPathPattern='" + requestPathPattern + '\'' +
                ", status=" + status +
                ", version=" + version +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GatewayConfig that = (GatewayConfig) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
} 