package com.gateway.admin.service;

import com.gateway.admin.entity.*;
import com.gateway.admin.repository.ExtensionConfigRepository;
import com.gateway.admin.repository.SecurityAuthConfigRepository;
import com.gateway.admin.repository.DynamicHeaderInjectionRepository;
import com.gateway.admin.dto.ExtensionConfigDTO;
import com.gateway.admin.dto.SecurityAuthConfigDTO;
import com.gateway.admin.dto.DynamicHeaderInjectionDTO;
import com.gateway.admin.exception.GatewayConfigException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Extension Configuration Service
 * 扩展配置服务类
 */
@Service
@Transactional
public class ExtensionConfigService {

    @Autowired
    private ExtensionConfigRepository extensionConfigRepository;

    @Autowired
    private SecurityAuthConfigRepository securityAuthConfigRepository;

    @Autowired
    private DynamicHeaderInjectionRepository dynamicHeaderInjectionRepository;

    /**
     * 创建扩展配置
     */
    public ExtensionConfig createExtensionConfig(ExtensionConfigDTO dto, GatewayConfig gatewayConfig) {
        validateExtensionConfig(dto);
        
        ExtensionConfig extensionConfig = new ExtensionConfig(dto.getExtensionType());
        extensionConfig.setGatewayConfig(gatewayConfig);
        extensionConfig.setEnabled(dto.getEnabled());
        extensionConfig.setDescription(dto.getDescription());
        extensionConfig.setPriority(dto.getPriority());

        // 根据扩展类型创建相应的配置
        if ("SECURITY_AUTH".equals(dto.getExtensionType()) && dto.getSecurityAuthConfig() != null) {
            SecurityAuthConfig securityAuthConfig = createSecurityAuthConfig(dto.getSecurityAuthConfig());
            securityAuthConfig.setExtensionConfig(extensionConfig);
            extensionConfig.setSecurityAuthConfig(securityAuthConfig);
        }

        if ("DYNAMIC_HEADER".equals(dto.getExtensionType()) && dto.getDynamicHeaderInjections() != null) {
            List<DynamicHeaderInjection> injections = dto.getDynamicHeaderInjections().stream()
                    .map(this::createDynamicHeaderInjection)
                    .collect(Collectors.toList());
            extensionConfig.setDynamicHeaderInjections(injections);
        }

        return extensionConfigRepository.save(extensionConfig);
    }

    /**
     * 更新扩展配置
     */
    public ExtensionConfig updateExtensionConfig(Long id, ExtensionConfigDTO dto) {
        ExtensionConfig existingConfig = extensionConfigRepository.findById(id)
                .orElseThrow(() -> new GatewayConfigException("扩展配置不存在: " + id));

        validateExtensionConfig(dto);
        
        existingConfig.setEnabled(dto.getEnabled());
        existingConfig.setDescription(dto.getDescription());
        existingConfig.setPriority(dto.getPriority());

        // 更新安全认证配置
        if ("SECURITY_AUTH".equals(dto.getExtensionType()) && dto.getSecurityAuthConfig() != null) {
            updateSecurityAuthConfig(existingConfig, dto.getSecurityAuthConfig());
        }

        // 更新动态Header注入配置
        if ("DYNAMIC_HEADER".equals(dto.getExtensionType()) && dto.getDynamicHeaderInjections() != null) {
            updateDynamicHeaderInjections(existingConfig, dto.getDynamicHeaderInjections());
        }

        return extensionConfigRepository.save(existingConfig);
    }

    /**
     * 删除扩展配置
     */
    public void deleteExtensionConfig(Long id) {
        ExtensionConfig config = extensionConfigRepository.findById(id)
                .orElseThrow(() -> new GatewayConfigException("扩展配置不存在: " + id));
        
        extensionConfigRepository.delete(config);
    }

    /**
     * 根据网关配置ID获取扩展配置
     */
    @Transactional(readOnly = true)
    public List<ExtensionConfig> getExtensionConfigsByGatewayConfigId(String gatewayConfigId) {
        return extensionConfigRepository.findByGatewayConfigIdOrderByPriorityAsc(gatewayConfigId);
    }

    /**
     * 根据扩展类型获取扩展配置
     */
    @Transactional(readOnly = true)
    public List<ExtensionConfig> getExtensionConfigsByType(String extensionType) {
        return extensionConfigRepository.findByExtensionTypeAndEnabledTrueOrderByPriorityAsc(extensionType);
    }

    /**
     * 创建安全认证配置
     */
    private SecurityAuthConfig createSecurityAuthConfig(SecurityAuthConfigDTO dto) {
        SecurityAuthConfig config = new SecurityAuthConfig();
        config.setAuthType(SecurityAuthConfig.AuthType.valueOf(dto.getAuthType()));
        config.setUsername(dto.getUsername());
        config.setPassword(dto.getPassword());
        config.setApiKey(dto.getApiKey());
        config.setApiKeyHeader(dto.getApiKeyHeader());
        config.setJwtSecret(dto.getJwtSecret());
        config.setJwtIssuer(dto.getJwtIssuer());
        config.setJwtAudience(dto.getJwtAudience());
        config.setOauth2ClientId(dto.getOauth2ClientId());
        config.setOauth2ClientSecret(dto.getOauth2ClientSecret());
        config.setOauth2AuthorizationUrl(dto.getOauth2AuthorizationUrl());
        config.setOauth2TokenUrl(dto.getOauth2TokenUrl());
        config.setEnabled(dto.getEnabled());
        config.setDescription(dto.getDescription());
        return config;
    }

    /**
     * 更新安全认证配置
     */
    private void updateSecurityAuthConfig(ExtensionConfig extensionConfig, SecurityAuthConfigDTO dto) {
        SecurityAuthConfig existingAuthConfig = extensionConfig.getSecurityAuthConfig();
        if (existingAuthConfig == null) {
            existingAuthConfig = createSecurityAuthConfig(dto);
            existingAuthConfig.setExtensionConfig(extensionConfig);
            extensionConfig.setSecurityAuthConfig(existingAuthConfig);
        } else {
            existingAuthConfig.setAuthType(SecurityAuthConfig.AuthType.valueOf(dto.getAuthType()));
            existingAuthConfig.setUsername(dto.getUsername());
            existingAuthConfig.setPassword(dto.getPassword());
            existingAuthConfig.setApiKey(dto.getApiKey());
            existingAuthConfig.setApiKeyHeader(dto.getApiKeyHeader());
            existingAuthConfig.setJwtSecret(dto.getJwtSecret());
            existingAuthConfig.setJwtIssuer(dto.getJwtIssuer());
            existingAuthConfig.setJwtAudience(dto.getJwtAudience());
            existingAuthConfig.setOauth2ClientId(dto.getOauth2ClientId());
            existingAuthConfig.setOauth2ClientSecret(dto.getOauth2ClientSecret());
            existingAuthConfig.setOauth2AuthorizationUrl(dto.getOauth2AuthorizationUrl());
            existingAuthConfig.setOauth2TokenUrl(dto.getOauth2TokenUrl());
            existingAuthConfig.setEnabled(dto.getEnabled());
            existingAuthConfig.setDescription(dto.getDescription());
        }
    }

    /**
     * 创建动态Header注入配置
     */
    private DynamicHeaderInjection createDynamicHeaderInjection(DynamicHeaderInjectionDTO dto) {
        DynamicHeaderInjection injection = new DynamicHeaderInjection();
        injection.setHeaderName(dto.getHeaderName());
        injection.setHeaderValue(dto.getHeaderValue());
        injection.setValueType(DynamicHeaderInjection.ValueType.valueOf(dto.getValueType()));
        injection.setValueExpression(dto.getValueExpression());
        injection.setConditionExpression(dto.getConditionExpression());
        injection.setPriority(dto.getPriority());
        injection.setEnabled(dto.getEnabled());
        injection.setDescription(dto.getDescription());
        return injection;
    }

    /**
     * 更新动态Header注入配置
     */
    private void updateDynamicHeaderInjections(ExtensionConfig extensionConfig, List<DynamicHeaderInjectionDTO> dtos) {
        // 清除现有的注入配置
        extensionConfig.getDynamicHeaderInjections().clear();
        
        // 添加新的注入配置
        List<DynamicHeaderInjection> injections = dtos.stream()
                .map(this::createDynamicHeaderInjection)
                .collect(Collectors.toList());
        
        for (DynamicHeaderInjection injection : injections) {
            injection.setExtensionConfig(extensionConfig);
            extensionConfig.addDynamicHeaderInjection(injection);
        }
    }

    /**
     * 验证扩展配置
     */
    private void validateExtensionConfig(ExtensionConfigDTO dto) {
        if (dto.getExtensionType() == null || dto.getExtensionType().trim().isEmpty()) {
            throw new GatewayConfigException("扩展类型不能为空");
        }

        // 验证安全认证配置
        if ("SECURITY_AUTH".equals(dto.getExtensionType()) && dto.getSecurityAuthConfig() != null) {
            validateSecurityAuthConfig(dto.getSecurityAuthConfig());
        }

        // 验证动态Header注入配置
        if ("DYNAMIC_HEADER".equals(dto.getExtensionType()) && dto.getDynamicHeaderInjections() != null) {
            for (DynamicHeaderInjectionDTO injection : dto.getDynamicHeaderInjections()) {
                validateDynamicHeaderInjection(injection);
            }
        }
    }

    /**
     * 验证安全认证配置
     */
    private void validateSecurityAuthConfig(SecurityAuthConfigDTO dto) {
        if (dto.getAuthType() == null) {
            throw new GatewayConfigException("认证类型不能为空");
        }

        SecurityAuthConfig.AuthType authType = SecurityAuthConfig.AuthType.valueOf(dto.getAuthType());
        
        switch (authType) {
            case BASIC:
                if (dto.getUsername() == null || dto.getUsername().trim().isEmpty()) {
                    throw new GatewayConfigException("基础认证用户名不能为空");
                }
                if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
                    throw new GatewayConfigException("基础认证密码不能为空");
                }
                break;
            case API_KEY:
                if (dto.getApiKey() == null || dto.getApiKey().trim().isEmpty()) {
                    throw new GatewayConfigException("API密钥不能为空");
                }
                break;
            case JWT:
                if (dto.getJwtSecret() == null || dto.getJwtSecret().trim().isEmpty()) {
                    throw new GatewayConfigException("JWT密钥不能为空");
                }
                break;
            case OAUTH2:
                if (dto.getOauth2ClientId() == null || dto.getOauth2ClientId().trim().isEmpty()) {
                    throw new GatewayConfigException("OAuth2客户端ID不能为空");
                }
                if (dto.getOauth2ClientSecret() == null || dto.getOauth2ClientSecret().trim().isEmpty()) {
                    throw new GatewayConfigException("OAuth2客户端密钥不能为空");
                }
                break;
        }
    }

    /**
     * 验证动态Header注入配置
     */
    private void validateDynamicHeaderInjection(DynamicHeaderInjectionDTO dto) {
        if (dto.getHeaderName() == null || dto.getHeaderName().trim().isEmpty()) {
            throw new GatewayConfigException("Header名称不能为空");
        }

        if (dto.getValueType() == null) {
            throw new GatewayConfigException("值类型不能为空");
        }

        DynamicHeaderInjection.ValueType valueType = DynamicHeaderInjection.ValueType.valueOf(dto.getValueType());
        
        switch (valueType) {
            case STATIC:
                if (dto.getHeaderValue() == null || dto.getHeaderValue().trim().isEmpty()) {
                    throw new GatewayConfigException("静态值不能为空");
                }
                break;
            case EXPRESSION:
                if (dto.getValueExpression() == null || dto.getValueExpression().trim().isEmpty()) {
                    throw new GatewayConfigException("表达式不能为空");
                }
                break;
        }
    }

    /**
     * 获取所有启用的扩展配置
     */
    @Transactional(readOnly = true)
    public List<ExtensionConfig> getAllEnabledExtensionConfigs() {
        return extensionConfigRepository.findByEnabledTrueOrderByPriorityAsc();
    }

    /**
     * 根据优先级获取扩展配置
     */
    @Transactional(readOnly = true)
    public List<ExtensionConfig> getExtensionConfigsByPriorityRange(int minPriority, int maxPriority) {
        return extensionConfigRepository.findByPriorityBetweenAndEnabledTrueOrderByPriorityAsc(minPriority, maxPriority);
    }
} 