package com.gateway.admin.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Limiter Configuration Entity
 * 限流配置实体类
 */
@Entity
@Table(name = "limiter_configs", 
       indexes = {
           @Index(name = "idx_gateway_config_id", columnList = "gateway_config_id")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class LimiterConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 0, message = "最大并发数不能为负数")
    @Column(name = "max_concurrent")
    private Integer maxConcurrent;

    @Min(value = 0, message = "每分钟最大请求数不能为负数")
    @Column(name = "max_per_minute")
    private Integer maxPerMinute;

    @Min(value = 0, message = "每秒最大请求数不能为负数")
    @Column(name = "max_per_second")
    private Integer maxPerSecond;

    @Column(name = "allowed_methods", columnDefinition = "JSON")
    private String allowedMethods; // JSON格式存储允许的HTTP方法

    @Column(name = "rate_limit_window_seconds", nullable = false)
    private Integer rateLimitWindowSeconds = 60;

    @Column(name = "burst_size")
    private Integer burstSize;

    @Column(name = "circuit_breaker_enabled", nullable = false)
    private Boolean circuitBreakerEnabled = false;

    @Column(name = "error_threshold_percentage")
    private Integer errorThresholdPercentage = 50;

    @Column(name = "recovery_time_seconds")
    private Integer recoveryTimeSeconds = 60;

    @Column(name = "half_open_max_calls")
    private Integer halfOpenMaxCalls = 5;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gateway_config_id", nullable = false)
    private GatewayConfig gatewayConfig;

    @OneToMany(mappedBy = "limiterConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<IpRule> ipRules = new ArrayList<>();

    // 构造函数
    public LimiterConfig() {}

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMaxConcurrent() {
        return maxConcurrent;
    }

    public void setMaxConcurrent(Integer maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
    }

    public Integer getMaxPerMinute() {
        return maxPerMinute;
    }

    public void setMaxPerMinute(Integer maxPerMinute) {
        this.maxPerMinute = maxPerMinute;
    }

    public Integer getMaxPerSecond() {
        return maxPerSecond;
    }

    public void setMaxPerSecond(Integer maxPerSecond) {
        this.maxPerSecond = maxPerSecond;
    }

    public String getAllowedMethods() {
        return allowedMethods;
    }

    public void setAllowedMethods(String allowedMethods) {
        this.allowedMethods = allowedMethods;
    }

    public Integer getRateLimitWindowSeconds() {
        return rateLimitWindowSeconds;
    }

    public void setRateLimitWindowSeconds(Integer rateLimitWindowSeconds) {
        this.rateLimitWindowSeconds = rateLimitWindowSeconds;
    }

    public Integer getBurstSize() {
        return burstSize;
    }

    public void setBurstSize(Integer burstSize) {
        this.burstSize = burstSize;
    }

    public Boolean getCircuitBreakerEnabled() {
        return circuitBreakerEnabled;
    }

    public void setCircuitBreakerEnabled(Boolean circuitBreakerEnabled) {
        this.circuitBreakerEnabled = circuitBreakerEnabled;
    }

    public Integer getErrorThresholdPercentage() {
        return errorThresholdPercentage;
    }

    public void setErrorThresholdPercentage(Integer errorThresholdPercentage) {
        this.errorThresholdPercentage = errorThresholdPercentage;
    }

    public Integer getRecoveryTimeSeconds() {
        return recoveryTimeSeconds;
    }

    public void setRecoveryTimeSeconds(Integer recoveryTimeSeconds) {
        this.recoveryTimeSeconds = recoveryTimeSeconds;
    }

    public Integer getHalfOpenMaxCalls() {
        return halfOpenMaxCalls;
    }

    public void setHalfOpenMaxCalls(Integer halfOpenMaxCalls) {
        this.halfOpenMaxCalls = halfOpenMaxCalls;
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

    public List<IpRule> getIpRules() {
        return ipRules;
    }

    public void setIpRules(List<IpRule> ipRules) {
        this.ipRules = ipRules;
    }

    // 业务方法
    public boolean hasRateLimit() {
        return maxConcurrent != null || maxPerMinute != null || maxPerSecond != null;
    }

    public boolean hasCircuitBreaker() {
        return circuitBreakerEnabled && errorThresholdPercentage != null;
    }

    @Override
    public String toString() {
        return "LimiterConfig{" +
                "id=" + id +
                ", maxConcurrent=" + maxConcurrent +
                ", maxPerMinute=" + maxPerMinute +
                ", circuitBreakerEnabled=" + circuitBreakerEnabled +
                '}';
    }
} 