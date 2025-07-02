package com.gateway.admin.entity;

import jakarta.persistence.*;
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
 * Header Configuration Entity
 * Header配置实体类，包含请求Header、响应Header、CSP和Cache配置
 */
@Entity
@Table(name = "header_configs", 
       indexes = {
           @Index(name = "idx_gateway_config_id", columnList = "gateway_config_id")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class HeaderConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gateway_config_id", nullable = false)
    private GatewayConfig gatewayConfig;

    // 请求Header配置
    @OneToMany(mappedBy = "headerConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<Header> requestHeaders = new ArrayList<>();

    // 响应Header配置
    @OneToMany(mappedBy = "headerConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<Header> responseHeaders = new ArrayList<>();

    // CSP配置
    @OneToOne(mappedBy = "headerConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private CspHeader cspHeader;

    // Cache配置
    @OneToOne(mappedBy = "headerConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private CacheHeader cacheHeader;

    // 构造函数
    public HeaderConfig() {}

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<Header> getRequestHeaders() {
        return requestHeaders;
    }

    public void setRequestHeaders(List<Header> requestHeaders) {
        this.requestHeaders = requestHeaders;
    }

    public List<Header> getResponseHeaders() {
        return responseHeaders;
    }

    public void setResponseHeaders(List<Header> responseHeaders) {
        this.responseHeaders = responseHeaders;
    }

    public CspHeader getCspHeader() {
        return cspHeader;
    }

    public void setCspHeader(CspHeader cspHeader) {
        this.cspHeader = cspHeader;
    }

    public CacheHeader getCacheHeader() {
        return cacheHeader;
    }

    public void setCacheHeader(CacheHeader cacheHeader) {
        this.cacheHeader = cacheHeader;
    }

    // 业务方法
    public void addRequestHeader(Header header) {
        header.setHeaderType(HeaderType.REQUEST);
        header.setHeaderConfig(this);
        requestHeaders.add(header);
    }

    public void addResponseHeader(Header header) {
        header.setHeaderType(HeaderType.RESPONSE);
        header.setHeaderConfig(this);
        responseHeaders.add(header);
    }

    public void removeRequestHeader(Header header) {
        requestHeaders.remove(header);
        header.setHeaderConfig(null);
    }

    public void removeResponseHeader(Header header) {
        responseHeaders.remove(header);
        header.setHeaderConfig(null);
    }

    @Override
    public String toString() {
        return "HeaderConfig{" +
                "id=" + id +
                ", requestHeadersCount=" + requestHeaders.size() +
                ", responseHeadersCount=" + responseHeaders.size() +
                '}';
    }
} 