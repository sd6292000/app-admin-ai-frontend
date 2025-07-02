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

/**
 * Dynamic Header Injection Entity
 * 动态Header注入实体类
 */
@Entity
@Table(name = "dynamic_header_injections", 
       indexes = {
           @Index(name = "idx_extension_config_id", columnList = "extension_config_id"),
           @Index(name = "idx_header_name", columnList = "header_name"),
           @Index(name = "idx_enabled", columnList = "enabled")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class DynamicHeaderInjection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Header名称不能为空")
    @Column(name = "header_name", nullable = false, length = 255)
    private String headerName;

    @Column(name = "header_value", columnDefinition = "TEXT")
    private String headerValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false, length = 20)
    private ValueType valueType = ValueType.STATIC;

    @Column(name = "value_expression", columnDefinition = "TEXT")
    private String valueExpression;

    @Column(name = "condition_expression", columnDefinition = "TEXT")
    private String conditionExpression;

    @Column(name = "priority", nullable = false)
    private Integer priority = 0;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "extension_config_id", nullable = false)
    private ExtensionConfig extensionConfig;

    // 构造函数
    public DynamicHeaderInjection() {}

    public DynamicHeaderInjection(String headerName, String headerValue) {
        this.headerName = headerName;
        this.headerValue = headerValue;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHeaderName() {
        return headerName;
    }

    public void setHeaderName(String headerName) {
        this.headerName = headerName;
    }

    public String getHeaderValue() {
        return headerValue;
    }

    public void setHeaderValue(String headerValue) {
        this.headerValue = headerValue;
    }

    public ValueType getValueType() {
        return valueType;
    }

    public void setValueType(ValueType valueType) {
        this.valueType = valueType;
    }

    public String getValueExpression() {
        return valueExpression;
    }

    public void setValueExpression(String valueExpression) {
        this.valueExpression = valueExpression;
    }

    public String getConditionExpression() {
        return conditionExpression;
    }

    public void setConditionExpression(String conditionExpression) {
        this.conditionExpression = conditionExpression;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
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

    // 业务方法
    public boolean isStaticValue() {
        return ValueType.STATIC.equals(valueType);
    }

    public boolean isDynamicValue() {
        return ValueType.DYNAMIC.equals(valueType);
    }

    public boolean isExpressionValue() {
        return ValueType.EXPRESSION.equals(valueType);
    }

    @Override
    public String toString() {
        return "DynamicHeaderInjection{" +
                "id=" + id +
                ", headerName='" + headerName + '\'' +
                ", valueType=" + valueType +
                ", enabled=" + enabled +
                '}';
    }

    /**
     * Value Type Enum
     * 值类型枚举
     */
    public enum ValueType {
        STATIC("STATIC", "静态值"),
        DYNAMIC("DYNAMIC", "动态值"),
        EXPRESSION("EXPRESSION", "表达式");

        private final String code;
        private final String description;

        ValueType(String code, String description) {
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