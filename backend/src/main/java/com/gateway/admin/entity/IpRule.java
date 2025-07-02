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
 * IP Rule Entity
 * IP规则实体类
 */
@Entity
@Table(name = "ip_rules", 
       indexes = {
           @Index(name = "idx_limiter_config_id", columnList = "limiter_config_id"),
           @Index(name = "idx_ip_cidr", columnList = "ip_or_cidr"),
           @Index(name = "idx_mode", columnList = "mode")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class IpRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "IP或CIDR不能为空")
    @Column(name = "ip_or_cidr", nullable = false, length = 50)
    private String ipOrCidr;

    @NotNull(message = "模式不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 10)
    private IpRuleMode mode;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "priority", nullable = false)
    private Integer priority = 0;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "limiter_config_id", nullable = false)
    private LimiterConfig limiterConfig;

    // 构造函数
    public IpRule() {}

    public IpRule(String ipOrCidr, IpRuleMode mode) {
        this.ipOrCidr = ipOrCidr;
        this.mode = mode;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIpOrCidr() {
        return ipOrCidr;
    }

    public void setIpOrCidr(String ipOrCidr) {
        this.ipOrCidr = ipOrCidr;
    }

    public IpRuleMode getMode() {
        return mode;
    }

    public void setMode(IpRuleMode mode) {
        this.mode = mode;
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

    public LimiterConfig getLimiterConfig() {
        return limiterConfig;
    }

    public void setLimiterConfig(LimiterConfig limiterConfig) {
        this.limiterConfig = limiterConfig;
    }

    // 业务方法
    public boolean isAllow() {
        return IpRuleMode.ALLOW.equals(mode);
    }

    public boolean isDeny() {
        return IpRuleMode.DENY.equals(mode);
    }

    @Override
    public String toString() {
        return "IpRule{" +
                "id=" + id +
                ", ipOrCidr='" + ipOrCidr + '\'' +
                ", mode=" + mode +
                ", enabled=" + enabled +
                '}';
    }

    /**
     * IP Rule Mode Enum
     * IP规则模式枚举
     */
    public enum IpRuleMode {
        ALLOW("allow", "允许"),
        DENY("deny", "拒绝");

        private final String code;
        private final String description;

        IpRuleMode(String code, String description) {
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