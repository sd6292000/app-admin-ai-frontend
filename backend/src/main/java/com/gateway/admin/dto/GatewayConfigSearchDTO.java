package com.gateway.admin.dto;

import com.gateway.admin.entity.ConfigStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Gateway Configuration Search DTO
 * 网关配置搜索数据传输对象
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GatewayConfigSearchDTO {

    private String domain;
    private String pattern;
    private ConfigStatus status;
    private String project;
    private String extensionType;
    private String description;

    // 构造函数
    public GatewayConfigSearchDTO() {}

    public GatewayConfigSearchDTO(String domain, String pattern, ConfigStatus status, String project) {
        this.domain = domain;
        this.pattern = pattern;
        this.status = status;
        this.project = project;
    }

    // Getter和Setter方法
    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public ConfigStatus getStatus() {
        return status;
    }

    public void setStatus(ConfigStatus status) {
        this.status = status;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getExtensionType() {
        return extensionType;
    }

    public void setExtensionType(String extensionType) {
        this.extensionType = extensionType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "GatewayConfigSearchDTO{" +
                "domain='" + domain + '\'' +
                ", pattern='" + pattern + '\'' +
                ", status=" + status +
                ", project='" + project + '\'' +
                '}';
    }
} 