package com.gateway.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Gateway Configuration DTO
 * 网关配置数据传输对象
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GatewayConfigDTO {

    private String id;

    @NotBlank(message = "域名不能为空")
    @Size(max = 255, message = "域名长度不能超过255个字符")
    private String domain;

    @NotBlank(message = "请求路径模式不能为空")
    @Size(max = 500, message = "请求路径模式长度不能超过500个字符")
    private String requestPathPattern;

    @NotBlank(message = "后端转发路径不能为空")
    @Size(max = 500, message = "后端转发路径长度不能超过500个字符")
    private String backendForwardPath;

    @Size(max = 100, message = "CMDB项目长度不能超过100个字符")
    private String cmdbProject;

    @Size(max = 1000, message = "描述长度不能超过1000个字符")
    private String description;

    private String extensionType;
    private String extensionData;
    private String createdBy;
    private String updatedBy;

    // 构造函数
    public GatewayConfigDTO() {}

    public GatewayConfigDTO(String domain, String requestPathPattern, String backendForwardPath) {
        this.domain = domain;
        this.requestPathPattern = requestPathPattern;
        this.backendForwardPath = backendForwardPath;
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getRequestPathPattern() {
        return requestPathPattern;
    }

    public void setRequestPathPattern(String requestPathPattern) {
        this.requestPathPattern = requestPathPattern;
    }

    public String getBackendForwardPath() {
        return backendForwardPath;
    }

    public void setBackendForwardPath(String backendForwardPath) {
        this.backendForwardPath = backendForwardPath;
    }

    public String getCmdbProject() {
        return cmdbProject;
    }

    public void setCmdbProject(String cmdbProject) {
        this.cmdbProject = cmdbProject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExtensionType() {
        return extensionType;
    }

    public void setExtensionType(String extensionType) {
        this.extensionType = extensionType;
    }

    public String getExtensionData() {
        return extensionData;
    }

    public void setExtensionData(String extensionData) {
        this.extensionData = extensionData;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public String toString() {
        return "GatewayConfigDTO{" +
                "id='" + id + '\'' +
                ", domain='" + domain + '\'' +
                ", requestPathPattern='" + requestPathPattern + '\'' +
                ", backendForwardPath='" + backendForwardPath + '\'' +
                ", cmdbProject='" + cmdbProject + '\'' +
                '}';
    }
} 