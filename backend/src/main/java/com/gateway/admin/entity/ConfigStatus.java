package com.gateway.admin.entity;

/**
 * Configuration Status Enum
 * 配置状态枚举
 */
public enum ConfigStatus {
    ACTIVE("active", "激活"),
    DISABLED("disabled", "禁用"),
    DRAFT("draft", "草稿"),
    ARCHIVED("archived", "归档");

    private final String code;
    private final String description;

    ConfigStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ConfigStatus fromCode(String code) {
        for (ConfigStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status code: " + code);
    }
} 