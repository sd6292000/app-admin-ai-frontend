package com.gateway.admin.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Extension Configuration Entity
 * 扩展配置实体类，支持结构化数据的扩展功能
 */
@Entity
@Table(name = "extension_configs", 
       indexes = {
           @Index(name = "idx_gateway_config_id", columnList = "gateway_config_id"),
           @Index(name = "idx_extension_type", columnList = "extension_type"),
           @Index(name = "idx_enabled", columnList = "enabled")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class ExtensionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "扩展类型不能为空")
    @Column(name = "extension_type", nullable = false, length = 50)
    private String extensionType;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "priority", nullable = false)
    private Integer priority = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gateway_config_id", nullable = false)
    private GatewayConfig gatewayConfig;

    // 安全认证配置
    @OneToOne(mappedBy = "extensionConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private SecurityAuthConfig securityAuthConfig;

    // 动态请求Header注入配置
    @OneToMany(mappedBy = "extensionConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<DynamicHeaderInjection> dynamicHeaderInjections = new ArrayList<>();

    // 构造函数
    public ExtensionConfig() {}

    public ExtensionConfig(String extensionType) {
        this.extensionType = extensionType;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExtensionType() {
        return extensionType;
    }

    public void setExtensionType(String extensionType) {
        this.extensionType = extensionType;
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

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
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

    public GatewayConfig getGatewayConfig() {
        return gatewayConfig;
    }

    public void setGatewayConfig(GatewayConfig gatewayConfig) {
        this.gatewayConfig = gatewayConfig;
    }

    public SecurityAuthConfig getSecurityAuthConfig() {
        return securityAuthConfig;
    }

    public void setSecurityAuthConfig(SecurityAuthConfig securityAuthConfig) {
        this.securityAuthConfig = securityAuthConfig;
    }

    public List<DynamicHeaderInjection> getDynamicHeaderInjections() {
        return dynamicHeaderInjections;
    }

    public void setDynamicHeaderInjections(List<DynamicHeaderInjection> dynamicHeaderInjections) {
        this.dynamicHeaderInjections = dynamicHeaderInjections;
    }

    // 业务方法
    public void addDynamicHeaderInjection(DynamicHeaderInjection injection) {
        injection.setExtensionConfig(this);
        dynamicHeaderInjections.add(injection);
    }

    public void removeDynamicHeaderInjection(DynamicHeaderInjection injection) {
        dynamicHeaderInjections.remove(injection);
        injection.setExtensionConfig(null);
    }

    public boolean isSecurityAuthType() {
        return "SECURITY_AUTH".equals(extensionType);
    }

    public boolean isDynamicHeaderType() {
        return "DYNAMIC_HEADER".equals(extensionType);
    }

    @Override
    public String toString() {
        return "ExtensionConfig{" +
                "id=" + id +
                ", extensionType='" + extensionType + '\'' +
                ", enabled=" + enabled +
                ", priority=" + priority +
                '}';
    }
} 