package com.gateway.admin.service;

import com.gateway.admin.entity.GatewayConfig;
import com.gateway.admin.entity.ConfigStatus;
import com.gateway.admin.repository.GatewayConfigRepository;
import com.gateway.admin.dto.GatewayConfigDTO;
import com.gateway.admin.dto.GatewayConfigSearchDTO;
import com.gateway.admin.exception.GatewayConfigException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Gateway Configuration Service
 * 网关配置服务层
 */
@Service
@Transactional
public class GatewayConfigService {

    @Autowired
    private GatewayConfigRepository gatewayConfigRepository;

    @Autowired
    private VersionManagementService versionManagementService;

    /**
     * 创建新的网关配置
     */
    @CacheEvict(value = "gatewayConfigs", allEntries = true)
    public GatewayConfig createConfig(GatewayConfigDTO configDTO) {
        // 验证域名和路径组合的唯一性
        if (gatewayConfigRepository.existsByDomainAndRequestPathPattern(
                configDTO.getDomain(), configDTO.getRequestPathPattern())) {
            throw new GatewayConfigException("域名和路径组合已存在");
        }

        GatewayConfig config = new GatewayConfig();
        config.setId(UUID.randomUUID().toString());
        config.setDomain(configDTO.getDomain());
        config.setRequestPathPattern(configDTO.getRequestPathPattern());
        config.setBackendForwardPath(configDTO.getBackendForwardPath());
        config.setCmdbProject(configDTO.getCmdbProject());
        config.setStatus(ConfigStatus.ACTIVE);
        config.setDescription(configDTO.getDescription());
        config.setVersion(1);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        config.setCreatedBy(configDTO.getCreatedBy());
        config.setUpdatedBy(configDTO.getUpdatedBy());

        // 设置扩展数据
        if (configDTO.getExtensionType() != null) {
            config.setExtensionType(configDTO.getExtensionType());
            config.setExtensionData(configDTO.getExtensionData());
        }

        GatewayConfig savedConfig = gatewayConfigRepository.save(config);
        
        // 创建版本记录
        versionManagementService.createVersionRecord(savedConfig, "初始版本");
        
        return savedConfig;
    }

    /**
     * 更新网关配置
     */
    @CacheEvict(value = "gatewayConfigs", allEntries = true)
    public GatewayConfig updateConfig(String id, GatewayConfigDTO configDTO) {
        GatewayConfig existingConfig = gatewayConfigRepository.findById(id)
                .orElseThrow(() -> new GatewayConfigException("配置不存在: " + id));

        // 验证域名和路径组合的唯一性（排除当前配置）
        if (gatewayConfigRepository.existsByDomainAndRequestPathPatternExcludingId(
                configDTO.getDomain(), configDTO.getRequestPathPattern(), id)) {
            throw new GatewayConfigException("域名和路径组合已存在");
        }

        // 保存旧版本信息用于版本管理
        String oldDescription = existingConfig.getDescription();
        
        // 更新配置
        existingConfig.setDomain(configDTO.getDomain());
        existingConfig.setRequestPathPattern(configDTO.getRequestPathPattern());
        existingConfig.setBackendForwardPath(configDTO.getBackendForwardPath());
        existingConfig.setCmdbProject(configDTO.getCmdbProject());
        existingConfig.setDescription(configDTO.getDescription());
        existingConfig.setUpdatedAt(LocalDateTime.now());
        existingConfig.setUpdatedBy(configDTO.getUpdatedBy());

        // 更新扩展数据
        if (configDTO.getExtensionType() != null) {
            existingConfig.setExtensionType(configDTO.getExtensionType());
            existingConfig.setExtensionData(configDTO.getExtensionData());
        }

        // 增加版本号
        existingConfig.incrementVersion();

        GatewayConfig updatedConfig = gatewayConfigRepository.save(existingConfig);
        
        // 创建版本记录
        versionManagementService.createVersionRecord(updatedConfig, 
                "更新配置: " + configDTO.getDescription());

        return updatedConfig;
    }

    /**
     * 根据ID查找配置
     */
    @Cacheable(value = "gatewayConfigs", key = "#id")
    @Transactional(readOnly = true)
    public Optional<GatewayConfig> findById(String id) {
        return gatewayConfigRepository.findById(id);
    }

    /**
     * 根据域名和路径查找配置
     */
    @Cacheable(value = "gatewayConfigs", key = "#domain + '_' + #requestPathPattern")
    @Transactional(readOnly = true)
    public Optional<GatewayConfig> findByDomainAndPath(String domain, String requestPathPattern) {
        return gatewayConfigRepository.findByDomainAndRequestPathPattern(domain, requestPathPattern);
    }

    /**
     * 分页查询配置
     */
    @Transactional(readOnly = true)
    public Page<GatewayConfig> findAll(Pageable pageable) {
        return gatewayConfigRepository.findAll(pageable);
    }

    /**
     * 搜索配置
     */
    @Transactional(readOnly = true)
    public Page<GatewayConfig> searchConfigs(GatewayConfigSearchDTO searchDTO, Pageable pageable) {
        return gatewayConfigRepository.searchConfigs(
                searchDTO.getDomain(),
                searchDTO.getPattern(),
                searchDTO.getStatus(),
                searchDTO.getProject(),
                pageable
        );
    }

    /**
     * 根据状态查找配置
     */
    @Transactional(readOnly = true)
    public List<GatewayConfig> findByStatus(ConfigStatus status) {
        return gatewayConfigRepository.findByStatus(status);
    }

    /**
     * 启用配置
     */
    @CacheEvict(value = "gatewayConfigs", allEntries = true)
    public GatewayConfig enableConfig(String id, String updatedBy) {
        GatewayConfig config = gatewayConfigRepository.findById(id)
                .orElseThrow(() -> new GatewayConfigException("配置不存在: " + id));

        config.setStatus(ConfigStatus.ACTIVE);
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(updatedBy);
        config.incrementVersion();

        GatewayConfig updatedConfig = gatewayConfigRepository.save(config);
        
        // 创建版本记录
        versionManagementService.createVersionRecord(updatedConfig, "启用配置");

        return updatedConfig;
    }

    /**
     * 禁用配置
     */
    @CacheEvict(value = "gatewayConfigs", allEntries = true)
    public GatewayConfig disableConfig(String id, String updatedBy) {
        GatewayConfig config = gatewayConfigRepository.findById(id)
                .orElseThrow(() -> new GatewayConfigException("配置不存在: " + id));

        config.setStatus(ConfigStatus.DISABLED);
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(updatedBy);
        config.incrementVersion();

        GatewayConfig updatedConfig = gatewayConfigRepository.save(config);
        
        // 创建版本记录
        versionManagementService.createVersionRecord(updatedConfig, "禁用配置");

        return updatedConfig;
    }

    /**
     * 删除配置
     */
    @CacheEvict(value = "gatewayConfigs", allEntries = true)
    public void deleteConfig(String id) {
        GatewayConfig config = gatewayConfigRepository.findById(id)
                .orElseThrow(() -> new GatewayConfigException("配置不存在: " + id));

        // 软删除：将状态设置为归档
        config.setStatus(ConfigStatus.ARCHIVED);
        config.setUpdatedAt(LocalDateTime.now());
        config.incrementVersion();

        gatewayConfigRepository.save(config);
        
        // 创建版本记录
        versionManagementService.createVersionRecord(config, "删除配置");
    }

    /**
     * 检查配置是否存在
     */
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return gatewayConfigRepository.existsById(id);
    }

    /**
     * 检查域名和路径组合是否存在
     */
    @Transactional(readOnly = true)
    public boolean existsByDomainAndPath(String domain, String requestPathPattern) {
        return gatewayConfigRepository.existsByDomainAndRequestPathPattern(domain, requestPathPattern);
    }

    /**
     * 获取配置统计信息
     */
    @Transactional(readOnly = true)
    public List<Object[]> getStatusStatistics() {
        return gatewayConfigRepository.countByStatus();
    }

    /**
     * 获取项目统计信息
     */
    @Transactional(readOnly = true)
    public List<Object[]> getProjectStatistics() {
        return gatewayConfigRepository.countByProject();
    }

    /**
     * 批量更新配置状态
     */
    @CacheEvict(value = "gatewayConfigs", allEntries = true)
    public void batchUpdateStatus(List<String> ids, ConfigStatus status, String updatedBy) {
        List<GatewayConfig> configs = gatewayConfigRepository.findAllById(ids);
        
        for (GatewayConfig config : configs) {
            config.setStatus(status);
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(updatedBy);
            config.incrementVersion();
            
            // 创建版本记录
            versionManagementService.createVersionRecord(config, 
                    "批量更新状态: " + status.getDescription());
        }
        
        gatewayConfigRepository.saveAll(configs);
    }

    /**
     * 验证配置数据
     */
    public void validateConfig(GatewayConfigDTO configDTO) {
        if (configDTO.getDomain() == null || configDTO.getDomain().trim().isEmpty()) {
            throw new GatewayConfigException("域名不能为空");
        }
        
        if (configDTO.getRequestPathPattern() == null || configDTO.getRequestPathPattern().trim().isEmpty()) {
            throw new GatewayConfigException("请求路径模式不能为空");
        }
        
        if (configDTO.getBackendForwardPath() == null || configDTO.getBackendForwardPath().trim().isEmpty()) {
            throw new GatewayConfigException("后端转发路径不能为空");
        }
        
        // 验证域名格式
        if (!isValidDomain(configDTO.getDomain())) {
            throw new GatewayConfigException("域名格式不正确");
        }
        
        // 验证路径格式
        if (!isValidPathPattern(configDTO.getRequestPathPattern())) {
            throw new GatewayConfigException("请求路径模式格式不正确");
        }
    }

    /**
     * 验证域名格式
     */
    private boolean isValidDomain(String domain) {
        // 简单的域名验证，可以根据需要增强
        return domain != null && domain.matches("^[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?)*$");
    }

    /**
     * 验证路径模式格式
     */
    private boolean isValidPathPattern(String pathPattern) {
        // 简单的路径验证，可以根据需要增强
        return pathPattern != null && pathPattern.startsWith("/") && pathPattern.length() > 1;
    }
} 