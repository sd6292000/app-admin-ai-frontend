package com.gateway.admin.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
 * Backend Server Entity
 * 后端服务器实体类
 */
@Entity
@Table(name = "backend_servers", 
       indexes = {
           @Index(name = "idx_gateway_config_id", columnList = "gateway_config_id"),
           @Index(name = "idx_hostname", columnList = "hostname"),
           @Index(name = "idx_enabled", columnList = "enabled")
       })
@Audited
@EntityListeners(AuditingEntityListener.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class BackendServer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "主机名不能为空")
    @Column(name = "hostname", nullable = false, length = 255)
    private String hostname;

    @NotNull(message = "端口不能为空")
    @Min(value = 1, message = "端口号必须大于0")
    @Max(value = 65535, message = "端口号不能超过65535")
    @Column(name = "port", nullable = false)
    private Integer port;

    @NotNull(message = "协议不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "protocol", nullable = false, length = 10)
    private Protocol protocol = Protocol.HTTP;

    @NotNull(message = "区域不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "region", nullable = false, length = 10)
    private Region region;

    @NotBlank(message = "数据中心不能为空")
    @Column(name = "data_center", nullable = false, length = 50)
    private String dataCenter;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "weight", nullable = false)
    private Integer weight = 1;

    @Column(name = "health_check_url", length = 500)
    private String healthCheckUrl;

    @Column(name = "timeout_seconds", nullable = false)
    private Integer timeoutSeconds = 30;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 3;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gateway_config_id", nullable = false)
    private GatewayConfig gatewayConfig;

    // 构造函数
    public BackendServer() {}

    public BackendServer(String hostname, Integer port, Protocol protocol, Region region, String dataCenter) {
        this.hostname = hostname;
        this.port = port;
        this.protocol = protocol;
        this.region = region;
        this.dataCenter = dataCenter;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public Protocol getProtocol() {
        return protocol;
    }

    public void setProtocol(Protocol protocol) {
        this.protocol = protocol;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public String getDataCenter() {
        return dataCenter;
    }

    public void setDataCenter(String dataCenter) {
        this.dataCenter = dataCenter;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public String getHealthCheckUrl() {
        return healthCheckUrl;
    }

    public void setHealthCheckUrl(String healthCheckUrl) {
        this.healthCheckUrl = healthCheckUrl;
    }

    public Integer getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(Integer timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
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

    // 业务方法
    public String getFullUrl() {
        return protocol.getCode().toLowerCase() + "://" + hostname + ":" + port;
    }

    public boolean isHealthy() {
        return enabled && healthCheckUrl != null;
    }

    @Override
    public String toString() {
        return "BackendServer{" +
                "id=" + id +
                ", hostname='" + hostname + '\'' +
                ", port=" + port +
                ", protocol=" + protocol +
                ", enabled=" + enabled +
                '}';
    }

    /**
     * Protocol Enum
     * 协议枚举
     */
    public enum Protocol {
        HTTP("HTTP"),
        HTTPS("HTTPS");

        private final String code;

        Protocol(String code) {
            this.code = code;
        }

        public String getCode() {
            return code;
        }
    }

    /**
     * Region Enum
     * 区域枚举
     */
    public enum Region {
        EU("EU", "欧洲"),
        AS("AS", "亚洲"),
        AM("AM", "美洲");

        private final String code;
        private final String description;

        Region(String code, String description) {
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