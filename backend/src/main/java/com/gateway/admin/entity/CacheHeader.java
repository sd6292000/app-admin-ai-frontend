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
 * Cache Header Entity
 * 缓存Header实体类
 */
@Entity
@Table(name = "cache_headers", 
       indexes = {
           @Index(name = "idx_header_config_id", columnList = "header_config_id")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class CacheHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cache_control", length = 500)
    private String cacheControl;

    @Column(name = "etag_enabled", nullable = false)
    private Boolean etagEnabled = true;

    @Column(name = "max_age_seconds")
    private Integer maxAgeSeconds;

    @Column(name = "stale_while_revalidate_seconds")
    private Integer staleWhileRevalidateSeconds;

    @Column(name = "stale_if_error_seconds")
    private Integer staleIfErrorSeconds;

    @Column(name = "vary_headers", columnDefinition = "JSON")
    private String varyHeaders;

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
    public CacheHeader() {}

    public CacheHeader(String cacheControl, Integer maxAgeSeconds) {
        this.cacheControl = cacheControl;
        this.maxAgeSeconds = maxAgeSeconds;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCacheControl() {
        return cacheControl;
    }

    public void setCacheControl(String cacheControl) {
        this.cacheControl = cacheControl;
    }

    public Boolean getEtagEnabled() {
        return etagEnabled;
    }

    public void setEtagEnabled(Boolean etagEnabled) {
        this.etagEnabled = etagEnabled;
    }

    public Integer getMaxAgeSeconds() {
        return maxAgeSeconds;
    }

    public void setMaxAgeSeconds(Integer maxAgeSeconds) {
        this.maxAgeSeconds = maxAgeSeconds;
    }

    public Integer getStaleWhileRevalidateSeconds() {
        return staleWhileRevalidateSeconds;
    }

    public void setStaleWhileRevalidateSeconds(Integer staleWhileRevalidateSeconds) {
        this.staleWhileRevalidateSeconds = staleWhileRevalidateSeconds;
    }

    public Integer getStaleIfErrorSeconds() {
        return staleIfErrorSeconds;
    }

    public void setStaleIfErrorSeconds(Integer staleIfErrorSeconds) {
        this.staleIfErrorSeconds = staleIfErrorSeconds;
    }

    public String getVaryHeaders() {
        return varyHeaders;
    }

    public void setVaryHeaders(String varyHeaders) {
        this.varyHeaders = varyHeaders;
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
        return "Cache-Control";
    }

    public String getHeaderValue() {
        if (!enabled) {
            return null;
        }
        
        if (cacheControl != null && !cacheControl.trim().isEmpty()) {
            return cacheControl;
        }
        
        return buildCacheControlValue();
    }

    private String buildCacheControlValue() {
        StringBuilder value = new StringBuilder();
        
        if (maxAgeSeconds != null) {
            value.append("max-age=").append(maxAgeSeconds);
        }
        
        if (staleWhileRevalidateSeconds != null) {
            if (value.length() > 0) value.append(", ");
            value.append("stale-while-revalidate=").append(staleWhileRevalidateSeconds);
        }
        
        if (staleIfErrorSeconds != null) {
            if (value.length() > 0) value.append(", ");
            value.append("stale-if-error=").append(staleIfErrorSeconds);
        }
        
        return value.toString();
    }

    @Override
    public String toString() {
        return "CacheHeader{" +
                "id=" + id +
                ", cacheControl='" + cacheControl + '\'' +
                ", maxAgeSeconds=" + maxAgeSeconds +
                ", enabled=" + enabled +
                '}';
    }
} 