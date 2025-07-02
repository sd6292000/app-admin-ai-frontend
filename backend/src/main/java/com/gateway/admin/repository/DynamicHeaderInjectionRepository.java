package com.gateway.admin.repository;

import com.gateway.admin.entity.DynamicHeaderInjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Dynamic Header Injection Repository
 * 动态Header注入数据访问接口
 */
@Repository
public interface DynamicHeaderInjectionRepository extends JpaRepository<DynamicHeaderInjection, Long> {

    /**
     * 根据扩展配置ID查找动态Header注入配置，按优先级排序
     */
    List<DynamicHeaderInjection> findByExtensionConfigIdOrderByPriorityAsc(Long extensionConfigId);

    /**
     * 根据扩展配置ID查找启用的动态Header注入配置，按优先级排序
     */
    List<DynamicHeaderInjection> findByExtensionConfigIdAndEnabledTrueOrderByPriorityAsc(Long extensionConfigId);

    /**
     * 根据Header名称查找动态Header注入配置
     */
    List<DynamicHeaderInjection> findByHeaderName(String headerName);

    /**
     * 根据Header名称查找启用的动态Header注入配置
     */
    List<DynamicHeaderInjection> findByHeaderNameAndEnabledTrue(String headerName);

    /**
     * 根据值类型查找动态Header注入配置
     */
    List<DynamicHeaderInjection> findByValueType(DynamicHeaderInjection.ValueType valueType);

    /**
     * 根据值类型查找启用的动态Header注入配置
     */
    List<DynamicHeaderInjection> findByValueTypeAndEnabledTrue(DynamicHeaderInjection.ValueType valueType);

    /**
     * 根据网关配置ID查找动态Header注入配置
     */
    @Query("SELECT dhi FROM DynamicHeaderInjection dhi WHERE dhi.extensionConfig.gatewayConfig.id = :gatewayConfigId")
    List<DynamicHeaderInjection> findByGatewayConfigId(@Param("gatewayConfigId") String gatewayConfigId);

    /**
     * 根据网关配置ID查找启用的动态Header注入配置
     */
    @Query("SELECT dhi FROM DynamicHeaderInjection dhi WHERE dhi.extensionConfig.gatewayConfig.id = :gatewayConfigId AND dhi.enabled = true ORDER BY dhi.priority ASC")
    List<DynamicHeaderInjection> findByGatewayConfigIdAndEnabledTrue(@Param("gatewayConfigId") String gatewayConfigId);

    /**
     * 根据优先级范围查找动态Header注入配置
     */
    List<DynamicHeaderInjection> findByPriorityBetweenOrderByPriorityAsc(int minPriority, int maxPriority);

    /**
     * 根据优先级范围查找启用的动态Header注入配置
     */
    List<DynamicHeaderInjection> findByPriorityBetweenAndEnabledTrueOrderByPriorityAsc(int minPriority, int maxPriority);

    /**
     * 统计指定扩展配置的动态Header注入配置数量
     */
    long countByExtensionConfigId(Long extensionConfigId);

    /**
     * 统计指定Header名称的配置数量
     */
    long countByHeaderName(String headerName);

    /**
     * 统计指定值类型的配置数量
     */
    long countByValueType(DynamicHeaderInjection.ValueType valueType);

    /**
     * 统计启用的动态Header注入配置数量
     */
    long countByEnabledTrue();

    /**
     * 查找所有启用的动态Header注入配置
     */
    List<DynamicHeaderInjection> findByEnabledTrue();

    /**
     * 根据扩展配置ID和Header名称查找配置
     */
    Optional<DynamicHeaderInjection> findByExtensionConfigIdAndHeaderName(Long extensionConfigId, String headerName);

    /**
     * 根据扩展配置ID和值类型查找配置
     */
    List<DynamicHeaderInjection> findByExtensionConfigIdAndValueType(Long extensionConfigId, DynamicHeaderInjection.ValueType valueType);
} 