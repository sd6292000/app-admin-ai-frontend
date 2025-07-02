package com.gateway.admin.repository;

import com.gateway.admin.entity.SecurityAuthConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Security Authentication Configuration Repository
 * 安全认证配置数据访问接口
 */
@Repository
public interface SecurityAuthConfigRepository extends JpaRepository<SecurityAuthConfig, Long> {

    /**
     * 根据扩展配置ID查找安全认证配置
     */
    Optional<SecurityAuthConfig> findByExtensionConfigId(Long extensionConfigId);

    /**
     * 根据认证类型查找启用的安全认证配置
     */
    List<SecurityAuthConfig> findByAuthTypeAndEnabledTrue(SecurityAuthConfig.AuthType authType);

    /**
     * 根据网关配置ID查找安全认证配置
     */
    @Query("SELECT sac FROM SecurityAuthConfig sac WHERE sac.extensionConfig.gatewayConfig.id = :gatewayConfigId")
    List<SecurityAuthConfig> findByGatewayConfigId(@Param("gatewayConfigId") String gatewayConfigId);

    /**
     * 根据网关配置ID查找启用的安全认证配置
     */
    @Query("SELECT sac FROM SecurityAuthConfig sac WHERE sac.extensionConfig.gatewayConfig.id = :gatewayConfigId AND sac.enabled = true")
    List<SecurityAuthConfig> findByGatewayConfigIdAndEnabledTrue(@Param("gatewayConfigId") String gatewayConfigId);

    /**
     * 根据用户名查找基础认证配置
     */
    List<SecurityAuthConfig> findByUsernameAndAuthTypeAndEnabledTrue(String username, SecurityAuthConfig.AuthType authType);

    /**
     * 根据API密钥查找API密钥认证配置
     */
    List<SecurityAuthConfig> findByApiKeyAndAuthTypeAndEnabledTrue(String apiKey, SecurityAuthConfig.AuthType authType);

    /**
     * 根据JWT发行者查找JWT认证配置
     */
    List<SecurityAuthConfig> findByJwtIssuerAndAuthTypeAndEnabledTrue(String jwtIssuer, SecurityAuthConfig.AuthType authType);

    /**
     * 根据OAuth2客户端ID查找OAuth2认证配置
     */
    List<SecurityAuthConfig> findByOauth2ClientIdAndAuthTypeAndEnabledTrue(String oauth2ClientId, SecurityAuthConfig.AuthType authType);

    /**
     * 统计指定认证类型的配置数量
     */
    long countByAuthType(SecurityAuthConfig.AuthType authType);

    /**
     * 统计启用的认证配置数量
     */
    long countByEnabledTrue();

    /**
     * 查找所有启用的认证配置
     */
    List<SecurityAuthConfig> findByEnabledTrue();

    /**
     * 根据扩展配置ID和认证类型查找配置
     */
    Optional<SecurityAuthConfig> findByExtensionConfigIdAndAuthType(Long extensionConfigId, SecurityAuthConfig.AuthType authType);
} 