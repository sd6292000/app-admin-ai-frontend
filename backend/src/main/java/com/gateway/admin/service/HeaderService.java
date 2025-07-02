package com.gateway.admin.service;

import com.gateway.admin.entity.*;
import com.gateway.admin.dto.HeaderConfigDTO;
import com.gateway.admin.dto.CspHeaderDTO;
import com.gateway.admin.dto.CacheHeaderDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Header Service
 * Header服务类，处理Header转换和DTO映射
 */
@Service
@Transactional
public class HeaderService {

    /**
     * 将Header配置转换为DTO
     */
    @Transactional(readOnly = true)
    public HeaderConfigDTO convertToDTO(HeaderConfig headerConfig) {
        if (headerConfig == null) {
            return null;
        }

        HeaderConfigDTO dto = new HeaderConfigDTO();
        
        // 转换请求Header
        List<HeaderConfigDTO.HeaderDTO> requestHeaders = headerConfig.getRequestHeaders().stream()
                .filter(Header::getEnabled)
                .map(this::convertHeaderToDTO)
                .collect(Collectors.toList());
        dto.setRequestHeaders(requestHeaders);

        // 转换响应Header
        List<HeaderConfigDTO.HeaderDTO> responseHeaders = headerConfig.getResponseHeaders().stream()
                .filter(Header::getEnabled)
                .map(this::convertHeaderToDTO)
                .collect(Collectors.toList());
        dto.setResponseHeaders(responseHeaders);

        // 转换CSP Header
        if (headerConfig.getCspHeader() != null && headerConfig.getCspHeader().getEnabled()) {
            CspHeaderDTO cspDTO = convertCspHeaderToDTO(headerConfig.getCspHeader());
            dto.setCspHeader(cspDTO);
        }

        // 转换Cache Header
        if (headerConfig.getCacheHeader() != null && headerConfig.getCacheHeader().getEnabled()) {
            CacheHeaderDTO cacheDTO = convertCacheHeaderToDTO(headerConfig.getCacheHeader());
            dto.setCacheHeader(cacheDTO);
        }

        return dto;
    }

    /**
     * 将Header实体转换为DTO
     */
    private HeaderConfigDTO.HeaderDTO convertHeaderToDTO(Header header) {
        HeaderConfigDTO.HeaderDTO dto = new HeaderConfigDTO.HeaderDTO();
        dto.setId(header.getId());
        dto.setName(header.getName());
        dto.setValue(header.getValue());
        dto.setOverride(header.getOverride());
        dto.setDescription(header.getDescription());
        dto.setHeaderType(header.getHeaderType().getCode());
        return dto;
    }

    /**
     * 将CSP Header转换为DTO
     */
    private CspHeaderDTO convertCspHeaderToDTO(CspHeader cspHeader) {
        CspHeaderDTO dto = new CspHeaderDTO();
        dto.setId(cspHeader.getId());
        dto.setTemplateType(cspHeader.getTemplateType().getCode());
        dto.setCspPolicy(cspHeader.getCspPolicy());
        dto.setDescription(cspHeader.getDescription());
        dto.setHeaderName(cspHeader.getHeaderName());
        dto.setHeaderValue(cspHeader.getHeaderValue());
        return dto;
    }

    /**
     * 将Cache Header转换为DTO
     */
    private CacheHeaderDTO convertCacheHeaderToDTO(CacheHeader cacheHeader) {
        CacheHeaderDTO dto = new CacheHeaderDTO();
        dto.setId(cacheHeader.getId());
        dto.setCacheControl(cacheHeader.getCacheControl());
        dto.setEtagEnabled(cacheHeader.getEtagEnabled());
        dto.setMaxAgeSeconds(cacheHeader.getMaxAgeSeconds());
        dto.setStaleWhileRevalidateSeconds(cacheHeader.getStaleWhileRevalidateSeconds());
        dto.setStaleIfErrorSeconds(cacheHeader.getStaleIfErrorSeconds());
        dto.setVaryHeaders(cacheHeader.getVaryHeaders());
        dto.setDescription(cacheHeader.getDescription());
        dto.setHeaderName(cacheHeader.getHeaderName());
        dto.setHeaderValue(cacheHeader.getHeaderValue());
        return dto;
    }

    /**
     * 将DTO转换为Header配置
     */
    public HeaderConfig convertFromDTO(HeaderConfigDTO dto, GatewayConfig gatewayConfig) {
        HeaderConfig headerConfig = new HeaderConfig();
        headerConfig.setGatewayConfig(gatewayConfig);

        // 转换请求Header
        if (dto.getRequestHeaders() != null) {
            List<Header> requestHeaders = dto.getRequestHeaders().stream()
                    .map(this::convertHeaderFromDTO)
                    .collect(Collectors.toList());
            headerConfig.setRequestHeaders(requestHeaders);
        }

        // 转换响应Header
        if (dto.getResponseHeaders() != null) {
            List<Header> responseHeaders = dto.getResponseHeaders().stream()
                    .map(this::convertHeaderFromDTO)
                    .collect(Collectors.toList());
            headerConfig.setResponseHeaders(responseHeaders);
        }

        // 转换CSP Header
        if (dto.getCspHeader() != null) {
            CspHeader cspHeader = convertCspHeaderFromDTO(dto.getCspHeader());
            cspHeader.setHeaderConfig(headerConfig);
            headerConfig.setCspHeader(cspHeader);
        }

        // 转换Cache Header
        if (dto.getCacheHeader() != null) {
            CacheHeader cacheHeader = convertCacheHeaderFromDTO(dto.getCacheHeader());
            cacheHeader.setHeaderConfig(headerConfig);
            headerConfig.setCacheHeader(cacheHeader);
        }

        return headerConfig;
    }

    /**
     * 将Header DTO转换为实体
     */
    private Header convertHeaderFromDTO(HeaderConfigDTO.HeaderDTO dto) {
        Header header = new Header();
        header.setId(dto.getId());
        header.setName(dto.getName());
        header.setValue(dto.getValue());
        header.setOverride(dto.getOverride());
        header.setDescription(dto.getDescription());
        header.setHeaderType(Header.HeaderType.valueOf(dto.getHeaderType()));
        header.setEnabled(true);
        return header;
    }

    /**
     * 将CSP Header DTO转换为实体
     */
    private CspHeader convertCspHeaderFromDTO(CspHeaderDTO dto) {
        CspHeader cspHeader = new CspHeader();
        cspHeader.setId(dto.getId());
        cspHeader.setTemplateType(CspHeader.CspTemplateType.valueOf(dto.getTemplateType()));
        cspHeader.setCspPolicy(dto.getCspPolicy());
        cspHeader.setDescription(dto.getDescription());
        cspHeader.setEnabled(true);
        return cspHeader;
    }

    /**
     * 将Cache Header DTO转换为实体
     */
    private CacheHeader convertCacheHeaderFromDTO(CacheHeaderDTO dto) {
        CacheHeader cacheHeader = new CacheHeader();
        cacheHeader.setId(dto.getId());
        cacheHeader.setCacheControl(dto.getCacheControl());
        cacheHeader.setEtagEnabled(dto.getEtagEnabled());
        cacheHeader.setMaxAgeSeconds(dto.getMaxAgeSeconds());
        cacheHeader.setStaleWhileRevalidateSeconds(dto.getStaleWhileRevalidateSeconds());
        cacheHeader.setStaleIfErrorSeconds(dto.getStaleIfErrorSeconds());
        cacheHeader.setVaryHeaders(dto.getVaryHeaders());
        cacheHeader.setDescription(dto.getDescription());
        cacheHeader.setEnabled(true);
        return cacheHeader;
    }

    /**
     * 获取所有响应Header（包括CSP和Cache）
     */
    @Transactional(readOnly = true)
    public List<HeaderConfigDTO.HeaderDTO> getAllResponseHeaders(HeaderConfig headerConfig) {
        List<HeaderConfigDTO.HeaderDTO> allHeaders = new ArrayList<>();

        // 添加普通响应Header
        if (headerConfig.getResponseHeaders() != null) {
            List<HeaderConfigDTO.HeaderDTO> responseHeaders = headerConfig.getResponseHeaders().stream()
                    .filter(Header::getEnabled)
                    .map(this::convertHeaderToDTO)
                    .collect(Collectors.toList());
            allHeaders.addAll(responseHeaders);
        }

        // 添加CSP Header
        if (headerConfig.getCspHeader() != null && headerConfig.getCspHeader().getEnabled()) {
            CspHeaderDTO cspDTO = convertCspHeaderToDTO(headerConfig.getCspHeader());
            HeaderConfigDTO.HeaderDTO cspHeader = new HeaderConfigDTO.HeaderDTO();
            cspHeader.setName(cspDTO.getHeaderName());
            cspHeader.setValue(cspDTO.getHeaderValue());
            cspHeader.setDescription("Content Security Policy");
            cspHeader.setHeaderType("RESPONSE");
            allHeaders.add(cspHeader);
        }

        // 添加Cache Header
        if (headerConfig.getCacheHeader() != null && headerConfig.getCacheHeader().getEnabled()) {
            CacheHeaderDTO cacheDTO = convertCacheHeaderToDTO(headerConfig.getCacheHeader());
            HeaderConfigDTO.HeaderDTO cacheHeader = new HeaderConfigDTO.HeaderDTO();
            cacheHeader.setName(cacheDTO.getHeaderName());
            cacheHeader.setValue(cacheDTO.getHeaderValue());
            cacheHeader.setDescription("Cache Control");
            cacheHeader.setHeaderType("RESPONSE");
            allHeaders.add(cacheHeader);
        }

        return allHeaders;
    }

    /**
     * 验证Header配置
     */
    public void validateHeaderConfig(HeaderConfigDTO dto) {
        // 验证Header名称格式
        if (dto.getRequestHeaders() != null) {
            for (HeaderConfigDTO.HeaderDTO header : dto.getRequestHeaders()) {
                validateHeaderName(header.getName());
            }
        }

        if (dto.getResponseHeaders() != null) {
            for (HeaderConfigDTO.HeaderDTO header : dto.getResponseHeaders()) {
                validateHeaderName(header.getName());
            }
        }

        // 验证CSP配置
        if (dto.getCspHeader() != null) {
            validateCspHeader(dto.getCspHeader());
        }

        // 验证Cache配置
        if (dto.getCacheHeader() != null) {
            validateCacheHeader(dto.getCacheHeader());
        }
    }

    /**
     * 验证Header名称
     */
    private void validateHeaderName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Header名称不能为空");
        }
        
        // 检查Header名称格式
        if (!name.matches("^[A-Za-z0-9\\-]+$")) {
            throw new IllegalArgumentException("Header名称格式不正确: " + name);
        }
    }

    /**
     * 验证CSP Header
     */
    private void validateCspHeader(CspHeaderDTO cspHeader) {
        if (CspHeader.CspTemplateType.CUSTOM.getCode().equals(cspHeader.getTemplateType())) {
            if (cspHeader.getCspPolicy() == null || cspHeader.getCspPolicy().trim().isEmpty()) {
                throw new IllegalArgumentException("自定义CSP策略不能为空");
            }
        }
    }

    /**
     * 验证Cache Header
     */
    private void validateCacheHeader(CacheHeaderDTO cacheHeader) {
        if (cacheHeader.getMaxAgeSeconds() != null && cacheHeader.getMaxAgeSeconds() < 0) {
            throw new IllegalArgumentException("max-age不能为负数");
        }
        
        if (cacheHeader.getStaleWhileRevalidateSeconds() != null && cacheHeader.getStaleWhileRevalidateSeconds() < 0) {
            throw new IllegalArgumentException("stale-while-revalidate不能为负数");
        }
        
        if (cacheHeader.getStaleIfErrorSeconds() != null && cacheHeader.getStaleIfErrorSeconds() < 0) {
            throw new IllegalArgumentException("stale-if-error不能为负数");
        }
    }
} 