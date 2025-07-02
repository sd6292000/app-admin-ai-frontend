package com.gateway.admin.dto;

/**
 * Cache Header DTO
 * 缓存Header数据传输对象
 */
public class CacheHeaderDTO {

    private Long id;
    private String cacheControl;
    private Boolean etagEnabled;
    private Integer maxAgeSeconds;
    private Integer staleWhileRevalidateSeconds;
    private Integer staleIfErrorSeconds;
    private String varyHeaders;
    private String description;
    private String headerName;
    private String headerValue;

    // 构造函数
    public CacheHeaderDTO() {}

    public CacheHeaderDTO(String cacheControl, Integer maxAgeSeconds) {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    @Override
    public String toString() {
        return "CacheHeaderDTO{" +
                "id=" + id +
                ", cacheControl='" + cacheControl + '\'' +
                ", maxAgeSeconds=" + maxAgeSeconds +
                '}';
    }
} 