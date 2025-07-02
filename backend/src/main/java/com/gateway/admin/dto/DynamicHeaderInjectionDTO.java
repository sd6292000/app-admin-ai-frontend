package com.gateway.admin.dto;

/**
 * Dynamic Header Injection DTO
 * 动态Header注入数据传输对象
 */
public class DynamicHeaderInjectionDTO {

    private Long id;
    private String headerName;
    private String headerValue;
    private String valueType;
    private String valueExpression;
    private String conditionExpression;
    private Integer priority;
    private Boolean enabled;
    private String description;

    // 构造函数
    public DynamicHeaderInjectionDTO() {}

    public DynamicHeaderInjectionDTO(String headerName, String headerValue) {
        this.headerName = headerName;
        this.headerValue = headerValue;
        this.valueType = "STATIC";
        this.enabled = true;
        this.priority = 0;
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

    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
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

    @Override
    public String toString() {
        return "DynamicHeaderInjectionDTO{" +
                "id=" + id +
                ", headerName='" + headerName + '\'' +
                ", valueType='" + valueType + '\'' +
                ", enabled=" + enabled +
                '}';
    }
} 