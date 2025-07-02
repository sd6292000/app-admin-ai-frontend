package com.gateway.admin.dto;

import java.util.List;

/**
 * Extension Configuration DTO
 * 扩展配置数据传输对象
 */
public class ExtensionConfigDTO {

    private Long id;
    private String extensionType;
    private Boolean enabled;
    private String description;
    private Integer priority;
    private SecurityAuthConfigDTO securityAuthConfig;
    private List<DynamicHeaderInjectionDTO> dynamicHeaderInjections;

    // 构造函数
    public ExtensionConfigDTO() {}

    public ExtensionConfigDTO(String extensionType) {
        this.extensionType = extensionType;
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

    public String getExtensionType() {
        return extensionType;
    }

    public void setExtensionType(String extensionType) {
        this.extensionType = extensionType;
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

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public SecurityAuthConfigDTO getSecurityAuthConfig() {
        return securityAuthConfig;
    }

    public void setSecurityAuthConfig(SecurityAuthConfigDTO securityAuthConfig) {
        this.securityAuthConfig = securityAuthConfig;
    }

    public List<DynamicHeaderInjectionDTO> getDynamicHeaderInjections() {
        return dynamicHeaderInjections;
    }

    public void setDynamicHeaderInjections(List<DynamicHeaderInjectionDTO> dynamicHeaderInjections) {
        this.dynamicHeaderInjections = dynamicHeaderInjections;
    }

    @Override
    public String toString() {
        return "ExtensionConfigDTO{" +
                "id=" + id +
                ", extensionType='" + extensionType + '\'' +
                ", enabled=" + enabled +
                ", priority=" + priority +
                '}';
    }
} 