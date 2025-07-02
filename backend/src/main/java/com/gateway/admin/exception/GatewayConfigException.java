package com.gateway.admin.exception;

/**
 * Gateway Configuration Exception
 * 网关配置异常类
 */
public class GatewayConfigException extends RuntimeException {

    private String errorCode;
    private Object[] args;

    public GatewayConfigException(String message) {
        super(message);
    }

    public GatewayConfigException(String message, Throwable cause) {
        super(message, cause);
    }

    public GatewayConfigException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public GatewayConfigException(String errorCode, String message, Object... args) {
        super(message);
        this.errorCode = errorCode;
        this.args = args;
    }

    public GatewayConfigException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public Object[] getArgs() {
        return args;
    }

    public void setArgs(Object[] args) {
        this.args = args;
    }
} 