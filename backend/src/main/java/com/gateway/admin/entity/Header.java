package com.gateway.admin.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Header Entity
 * Header实体类
 */
@Entity
@Table(name = "headers", 
       indexes = {
           @Index(name = "idx_header_config_id", columnList = "header_config_id"),
           @Index(name = "idx_header_type", columnList = "header_type"),
           @Index(name = "idx_name", columnList = "name")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Header {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Header名称不能为空")
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @NotBlank(message = "Header值不能为空")
    @Column(name = "value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @NotNull(message = "Header类型不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "header_type", nullable = false, length = 20)
    private HeaderType headerType;

    @Column(name = "override", nullable = false)
    private Boolean override = false;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "header_config_id", nullable = false)
    private HeaderConfig headerConfig;

    // 构造函数
    public Header() {}

    public Header(String name, String value, HeaderType headerType) {
        this.name = name;
        this.value = value;
        this.headerType = headerType;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public HeaderType getHeaderType() {
        return headerType;
    }

    public void setHeaderType(HeaderType headerType) {
        this.headerType = headerType;
    }

    public Boolean getOverride() {
        return override;
    }

    public void setOverride(Boolean override) {
        this.override = override;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
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
    public boolean isRequestHeader() {
        return HeaderType.REQUEST.equals(headerType);
    }

    public boolean isResponseHeader() {
        return HeaderType.RESPONSE.equals(headerType);
    }

    @Override
    public String toString() {
        return "Header{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                ", headerType=" + headerType +
                ", enabled=" + enabled +
                '}';
    }

    /**
     * Header Type Enum
     * Header类型枚举
     */
    public enum HeaderType {
        REQUEST("REQUEST", "请求Header"),
        RESPONSE("RESPONSE", "响应Header");

        private final String code;
        private final String description;

        HeaderType(String code, String description) {
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