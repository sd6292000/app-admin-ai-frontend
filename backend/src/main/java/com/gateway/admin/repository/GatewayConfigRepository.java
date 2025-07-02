package com.gateway.admin.repository;

import com.gateway.admin.entity.GatewayConfig;
import com.gateway.admin.entity.ConfigStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Gateway Configuration Repository
 * 网关配置数据访问层
 */
@Repository
public interface GatewayConfigRepository extends JpaRepository<GatewayConfig, String> {

    /**
     * 根据域名和路径模式查找配置
     */
    Optional<GatewayConfig> findByDomainAndRequestPathPattern(String domain, String requestPathPattern);

    /**
     * 根据状态查找配置
     */
    List<GatewayConfig> findByStatus(ConfigStatus status);

    /**
     * 根据状态分页查找配置
     */
    Page<GatewayConfig> findByStatus(ConfigStatus status, Pageable pageable);

    /**
     * 根据扩展类型查找配置
     */
    List<GatewayConfig> findByExtensionType(String extensionType);

    /**
     * 根据CMDB项目查找配置
     */
    List<GatewayConfig> findByCmdbProject(String cmdbProject);

    /**
     * 根据域名模糊查找配置
     */
    @Query("SELECT gc FROM GatewayConfig gc WHERE gc.domain LIKE %:domain%")
    List<GatewayConfig> findByDomainContaining(@Param("domain") String domain);

    /**
     * 根据路径模式模糊查找配置
     */
    @Query("SELECT gc FROM GatewayConfig gc WHERE gc.requestPathPattern LIKE %:pattern%")
    List<GatewayConfig> findByRequestPathPatternContaining(@Param("pattern") String pattern);

    /**
     * 根据描述模糊查找配置
     */
    @Query("SELECT gc FROM GatewayConfig gc WHERE gc.description LIKE %:description%")
    List<GatewayConfig> findByDescriptionContaining(@Param("description") String description);

    /**
     * 复合搜索
     */
    @Query("SELECT gc FROM GatewayConfig gc WHERE " +
           "(:domain IS NULL OR gc.domain LIKE %:domain%) AND " +
           "(:pattern IS NULL OR gc.requestPathPattern LIKE %:pattern%) AND " +
           "(:status IS NULL OR gc.status = :status) AND " +
           "(:project IS NULL OR gc.cmdbProject = :project)")
    Page<GatewayConfig> searchConfigs(
            @Param("domain") String domain,
            @Param("pattern") String pattern,
            @Param("status") ConfigStatus status,
            @Param("project") String project,
            Pageable pageable
    );

    /**
     * 检查域名和路径组合是否存在
     */
    boolean existsByDomainAndRequestPathPattern(String domain, String requestPathPattern);

    /**
     * 检查域名和路径组合是否存在（排除指定ID）
     */
    @Query("SELECT COUNT(gc) > 0 FROM GatewayConfig gc WHERE gc.domain = :domain AND gc.requestPathPattern = :pattern AND gc.id != :excludeId")
    boolean existsByDomainAndRequestPathPatternExcludingId(
            @Param("domain") String domain,
            @Param("pattern") String pattern,
            @Param("excludeId") String excludeId
    );

    /**
     * 根据版本号查找配置
     */
    List<GatewayConfig> findByVersion(Integer version);

    /**
     * 查找最新版本的配置
     */
    @Query("SELECT gc FROM GatewayConfig gc WHERE gc.version = (SELECT MAX(gc2.version) FROM GatewayConfig gc2 WHERE gc2.domain = gc.domain AND gc2.requestPathPattern = gc.requestPathPattern)")
    List<GatewayConfig> findLatestVersions();

    /**
     * 统计各状态的配置数量
     */
    @Query("SELECT gc.status, COUNT(gc) FROM GatewayConfig gc GROUP BY gc.status")
    List<Object[]> countByStatus();

    /**
     * 统计各项目的配置数量
     */
    @Query("SELECT gc.cmdbProject, COUNT(gc) FROM GatewayConfig gc WHERE gc.cmdbProject IS NOT NULL GROUP BY gc.cmdbProject")
    List<Object[]> countByProject();
} 