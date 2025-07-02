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
 * CSP Header Entity
 * 内容安全策略Header实体类
 */
@Entity
@Table(name = "csp_headers", 
       indexes = {
           @Index(name = "idx_header_config_id", columnList = "header_config_id")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class CspHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false, length = 20)
    private CspTemplateType templateType = CspTemplateType.BASIC;

    @Column(name = "csp_policy", columnDefinition = "TEXT")
    private String cspPolicy;

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
    @JoinColumn(name = "header_config_id", nullable = false)
    private HeaderConfig headerConfig;

    // 构造函数
    public CspHeader() {}

    public CspHeader(CspTemplateType templateType, String cspPolicy) {
        this.templateType = templateType;
        this.cspPolicy = cspPolicy;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CspTemplateType getTemplateType() {
        return templateType;
    }

    public void setTemplateType(CspTemplateType templateType) {
        this.templateType = templateType;
    }

    public String getCspPolicy() {
        return cspPolicy;
    }

    public void setCspPolicy(String cspPolicy) {
        this.cspPolicy = cspPolicy;
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

    public HeaderConfig getHeaderConfig() {
        return headerConfig;
    }

    public void setHeaderConfig(HeaderConfig headerConfig) {
        this.headerConfig = headerConfig;
    }

    // 业务方法
    public String getHeaderName() {
        return "Content-Security-Policy";
    }

    public String getHeaderValue() {
        if (!enabled) {
            return null;
        }
        
        if (CspTemplateType.CUSTOM.equals(templateType) && cspPolicy != null) {
            return cspPolicy;
        }
        
        return getDefaultPolicy();
    }

    private String getDefaultPolicy() {
        switch (templateType) {
            case STRICT:
                return "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';";
            case BASIC:
                return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;";
            default:
                return "";
        }
    }

    @Override
    public String toString() {
        return "CspHeader{" +
                "id=" + id +
                ", templateType=" + templateType +
                ", enabled=" + enabled +
                '}';
    }

    /**
     * CSP Template Type Enum
     * CSP模板类型枚举
     */
    public enum CspTemplateType {
        STRICT("STRICT", "严格模式"),
        BASIC("BASIC", "基础模式"),
        CUSTOM("CUSTOM", "自定义模式");

        private final String code;
        private final String description;

        CspTemplateType(String code, String description) {
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