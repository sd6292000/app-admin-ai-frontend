package com.gateway.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Security Authentication Configuration Entity
 * 安全认证配置实体类
 */
@Entity
@Table(name = "security_auth_configs", 
       indexes = {
           @Index(name = "idx_extension_config_id", columnList = "extension_config_id")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class SecurityAuthConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_type", nullable = false, length = 20)
    private AuthType authType = AuthType.BASIC;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "api_key", length = 255)
    private String apiKey;

    @Column(name = "api_key_header", length = 100)
    private String apiKeyHeader = "X-API-Key";

    @Column(name = "jwt_secret", length = 255)
    private String jwtSecret;

    @Column(name = "jwt_issuer", length = 100)
    private String jwtIssuer;

    @Column(name = "jwt_audience", length = 100)
    private String jwtAudience;

    @Column(name = "oauth2_client_id", length = 100)
    private String oauth2ClientId;

    @Column(name = "oauth2_client_secret", length = 255)
    private String oauth2ClientSecret;

    @Column(name = "oauth2_authorization_url", length = 500)
    private String oauth2AuthorizationUrl;

    @Column(name = "oauth2_token_url", length = 500)
    private String oauth2TokenUrl;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "description", length = 500)
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "extension_config_id", nullable = false)
    private ExtensionConfig extensionConfig;

    // 构造函数
    public SecurityAuthConfig() {}

    public SecurityAuthConfig(AuthType authType) {
        this.authType = authType;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AuthType getAuthType() {
        return authType;
    }

    public void setAuthType(AuthType authType) {
        this.authType = authType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKeyHeader() {
        return apiKeyHeader;
    }

    public void setApiKeyHeader(String apiKeyHeader) {
        this.apiKeyHeader = apiKeyHeader;
    }

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public String getJwtIssuer() {
        return jwtIssuer;
    }

    public void setJwtIssuer(String jwtIssuer) {
        this.jwtIssuer = jwtIssuer;
    }

    public String getJwtAudience() {
        return jwtAudience;
    }

    public void setJwtAudience(String jwtAudience) {
        this.jwtAudience = jwtAudience;
    }

    public String getOauth2ClientId() {
        return oauth2ClientId;
    }

    public void setOauth2ClientId(String oauth2ClientId) {
        this.oauth2ClientId = oauth2ClientId;
    }

    public String getOauth2ClientSecret() {
        return oauth2ClientSecret;
    }

    public void setOauth2ClientSecret(String oauth2ClientSecret) {
        this.oauth2ClientSecret = oauth2ClientSecret;
    }

    public String getOauth2AuthorizationUrl() {
        return oauth2AuthorizationUrl;
    }

    public void setOauth2AuthorizationUrl(String oauth2AuthorizationUrl) {
        this.oauth2AuthorizationUrl = oauth2AuthorizationUrl;
    }

    public String getOauth2TokenUrl() {
        return oauth2TokenUrl;
    }

    public void setOauth2TokenUrl(String oauth2TokenUrl) {
        this.oauth2TokenUrl = oauth2TokenUrl;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public ExtensionConfig getExtensionConfig() {
        return extensionConfig;
    }

    public void setExtensionConfig(ExtensionConfig extensionConfig) {
        this.extensionConfig = extensionConfig;
    }

    @Override
    public String toString() {
        return "SecurityAuthConfig{" +
                "id=" + id +
                ", authType=" + authType +
                ", enabled=" + enabled +
                '}';
    }

    /**
     * Authentication Type Enum
     * 认证类型枚举
     */
    public enum AuthType {
        BASIC("BASIC", "基础认证"),
        API_KEY("API_KEY", "API密钥"),
        JWT("JWT", "JWT令牌"),
        OAUTH2("OAUTH2", "OAuth2"),
        CUSTOM("CUSTOM", "自定义认证");

        private final String code;
        private final String description;

        AuthType(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }
} 