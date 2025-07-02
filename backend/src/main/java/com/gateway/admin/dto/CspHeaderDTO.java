package com.gateway.admin.dto;

/**
 * CSP Header DTO
 * 内容安全策略Header数据传输对象
 */
public class CspHeaderDTO {

    private Long id;
    private String templateType;
    private String cspPolicy;
    private String description;
    private String headerName;
    private String headerValue;

    // 构造函数
    public CspHeaderDTO() {}

    public CspHeaderDTO(String templateType, String cspPolicy) {
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

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getCspPolicy() {
        return cspPolicy;
    }

    public void setCspPolicy(String cspPolicy) {
        this.cspPolicy = cspPolicy;
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
        return "CspHeaderDTO{" +
                "id=" + id +
                ", templateType='" + templateType + '\'' +
                ", cspPolicy='" + cspPolicy + '\'' +
                '}';
    }
} 