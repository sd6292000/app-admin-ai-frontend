package com.gateway.admin.repository;

import com.gateway.admin.entity.ExtensionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Extension Configuration Repository
 * 扩展配置数据访问接口
 */
@Repository
public interface ExtensionConfigRepository extends JpaRepository<ExtensionConfig, Long> {

    /**
     * 根据网关配置ID查找扩展配置，按优先级排序
     */
    List<ExtensionConfig> findByGatewayConfigIdOrderByPriorityAsc(String gatewayConfigId);

    /**
     * 根据扩展类型查找启用的扩展配置，按优先级排序
     */
    List<ExtensionConfig> findByExtensionTypeAndEnabledTrueOrderByPriorityAsc(String extensionType);

    /**
     * 查找所有启用的扩展配置，按优先级排序
     */
    List<ExtensionConfig> findByEnabledTrueOrderByPriorityAsc();

    /**
     * 根据优先级范围查找启用的扩展配置，按优先级排序
     */
    List<ExtensionConfig> findByPriorityBetweenAndEnabledTrueOrderByPriorityAsc(int minPriority, int maxPriority);

    /**
     * 根据网关配置ID和扩展类型查找扩展配置
     */
    List<ExtensionConfig> findByGatewayConfigIdAndExtensionType(String gatewayConfigId, String extensionType);

    /**
     * 根据网关配置ID和扩展类型查找启用的扩展配置
     */
    List<ExtensionConfig> findByGatewayConfigIdAndExtensionTypeAndEnabledTrue(String gatewayConfigId, String extensionType);

    /**
     * 统计指定网关配置的扩展配置数量
     */
    long countByGatewayConfigId(String gatewayConfigId);

    /**
     * 统计指定扩展类型的配置数量
     */
    long countByExtensionType(String extensionType);

    /**
     * 查找指定优先级范围内的扩展配置
     */
    @Query("SELECT ec FROM ExtensionConfig ec WHERE ec.priority BETWEEN :minPriority AND :maxPriority ORDER BY ec.priority ASC")
    List<ExtensionConfig> findByPriorityRange(@Param("minPriority") int minPriority, @Param("maxPriority") int maxPriority);

    /**
     * 查找指定网关配置中优先级最高的扩展配置
     */
    @Query("SELECT ec FROM ExtensionConfig ec WHERE ec.gatewayConfig.id = :gatewayConfigId AND ec.enabled = true ORDER BY ec.priority DESC LIMIT 1")
    ExtensionConfig findTopByGatewayConfigIdOrderByPriorityDesc(@Param("gatewayConfigId") String gatewayConfigId);
} 