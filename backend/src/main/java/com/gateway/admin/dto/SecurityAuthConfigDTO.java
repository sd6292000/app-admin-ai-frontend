package com.gateway.admin.dto;

/**
 * Security Authentication Configuration DTO
 * 安全认证配置数据传输对象
 */
public class SecurityAuthConfigDTO {

    private Long id;
    private String authType;
    private String username;
    private String password;
    private String apiKey;
    private String apiKeyHeader;
    private String jwtSecret;
    private String jwtIssuer;
    private String jwtAudience;
    private String oauth2ClientId;
    private String oauth2ClientSecret;
    private String oauth2AuthorizationUrl;
    private String oauth2TokenUrl;
    private Boolean enabled;
    private String description;

    // 构造函数
    public SecurityAuthConfigDTO() {}

    public SecurityAuthConfigDTO(String authType) {
        this.authType = authType;
        this.enabled = true;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthType() {
        return authType;
    }

    public void setAuthType(String authType) {
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

    @Override
    public String toString() {
        return "SecurityAuthConfigDTO{" +
                "id=" + id +
                ", authType='" + authType + '\'' +
                ", enabled=" + enabled +
                '}';
    }
} 