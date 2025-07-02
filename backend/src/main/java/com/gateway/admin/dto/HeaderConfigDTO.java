package com.gateway.admin.dto;

import java.util.List;

/**
 * Header Configuration DTO
 * Header配置数据传输对象
 */
public class HeaderConfigDTO {

    private List<HeaderDTO> requestHeaders;
    private List<HeaderDTO> responseHeaders;
    private CspHeaderDTO cspHeader;
    private CacheHeaderDTO cacheHeader;

    // 构造函数
    public HeaderConfigDTO() {}

    // Getter和Setter方法
    public List<HeaderDTO> getRequestHeaders() {
        return requestHeaders;
    }

    public void setRequestHeaders(List<HeaderDTO> requestHeaders) {
        this.requestHeaders = requestHeaders;
    }

    public List<HeaderDTO> getResponseHeaders() {
        return responseHeaders;
    }

    public void setResponseHeaders(List<HeaderDTO> responseHeaders) {
        this.responseHeaders = responseHeaders;
    }

    public CspHeaderDTO getCspHeader() {
        return cspHeader;
    }

    public void setCspHeader(CspHeaderDTO cspHeader) {
        this.cspHeader = cspHeader;
    }

    public CacheHeaderDTO getCacheHeader() {
        return cacheHeader;
    }

    public void setCacheHeader(CacheHeaderDTO cacheHeader) {
        this.cacheHeader = cacheHeader;
    }

    /**
     * Header DTO
     * Header数据传输对象
     */
    public static class HeaderDTO {
        private Long id;
        private String name;
        private String value;
        private Boolean override;
        private String description;
        private String headerType;

        // 构造函数
        public HeaderDTO() {}

        public HeaderDTO(String name, String value, String headerType) {
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

        public String getHeaderType() {
            return headerType;
        }

        public void setHeaderType(String headerType) {
            this.headerType = headerType;
        }

        @Override
        public String toString() {
            return "HeaderDTO{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", value='" + value + '\'' +
                    ", headerType='" + headerType + '\'' +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "HeaderConfigDTO{" +
                "requestHeadersCount=" + (requestHeaders != null ? requestHeaders.size() : 0) +
                ", responseHeadersCount=" + (responseHeaders != null ? responseHeaders.size() : 0) +
                ", cspHeader=" + (cspHeader != null ? "enabled" : "disabled") +
                ", cacheHeader=" + (cacheHeader != null ? "enabled" : "disabled") +
                '}';
    }
} 