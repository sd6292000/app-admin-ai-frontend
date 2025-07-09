# Detailed User Stories - Gateway Management System

## Version Management Features

### US-F-008: Version History Management Interface

**Description:**
As an administrator, I want to view configuration change history in EH Edit page as a new tab, including the last 5 changes, with options to view more versions, to understand the configuration evolution process.

**Acceptance Criteria:**
- Display the last 5 version changes by default
- Provide a "View More" button to load additional versions
- Show detailed change information including version number, short description, creator, and timestamp
- Support search and filtering of change records
- Display latest version status
- Show current version indicator

**Technical Details:**

**Frontend Implementation:**
- **Component:** `VersionManagementTab.tsx`
- **UI Fields:**
  - `version` (string): Version number (e.g., "1.0.3")
  - `description` (string): Change description
  - `createdBy` (string): Creator email/username
  - `createdAt` (string): ISO timestamp
  - `status` (enum): 'active' | 'inactive' | 'draft'
  - `isCurrent` (boolean): Current version indicator
  - `canRollback` (boolean): Rollback availability
  - `changes` (string[]): List of change descriptions

**Backend API Endpoints:**
- `GET /api/gateway-configs/{id}/versions` - Get version history
- `GET /api/gateway-configs/{id}/versions?page={page}&size={size}` - Paginated version history

**Data Model:**
```typescript
interface VersionInfo {
  id: string;
  version: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'draft';
  changes: string[];
  isCurrent: boolean;
  canRollback: boolean;
}
```

**Test Cases:**
1. **Load Version History**
   - Given: A gateway configuration exists with multiple versions
   - When: User opens the version management tab
   - Then: The last 5 versions should be displayed with correct information

2. **View More Versions**
   - Given: More than 5 versions exist
   - When: User clicks "View More" button
   - Then: Additional versions should be loaded and displayed

3. **Version Status Display**
   - Given: Versions have different statuses
   - When: User views the version list
   - Then: Each version should show correct status with appropriate visual indicators

4. **Export Version**
   - Given: A version is selected
   - When: User clicks export button
   - Then: Configuration should be downloaded as JSON file

---

### US-F-009: Version Comparison Function

**Description:**
As a developer, I want to compare configuration differences between different versions, displaying changes in a visual way, to understand configuration changes.

**Acceptance Criteria:**
- Implement side-by-side comparison view
- Highlight changed content with color coding
- Support line-by-line comparison mode
- Provide change summary statistics
- Show detailed change descriptions
- Allow comparison between any two versions
- Display configuration structure differences

**Technical Details:**

**Frontend Implementation:**
- **Component:** `VersionComparisonDialog.tsx`
- **UI Fields:**
  - `leftVersion` (VersionInfo): Left side version
  - `rightVersion` (VersionInfo): Right side version
  - `differences` (DiffResult[]): Computed differences
  - `changeSummary` (ChangeSummary): Summary statistics

**Comparison Logic:**
```typescript
interface DiffResult {
  field: string;
  leftValue: any;
  rightValue: any;
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string[];
}

interface ChangeSummary {
  totalChanges: number;
  addedFields: number;
  removedFields: number;
  modifiedFields: number;
}
```

**Backend API Endpoints:**
- `GET /api/gateway-configs/{id}/versions/{version1}/compare/{version2}` - Compare two versions

**Test Cases:**
1. **Basic Version Comparison**
   - Given: Two different versions exist
   - When: User selects compare function
   - Then: Side-by-side view should show differences highlighted

2. **Field-level Comparison**
   - Given: Configuration has multiple fields
   - When: User compares versions
   - Then: Each changed field should be clearly identified

3. **Change Summary**
   - Given: Versions have multiple changes
   - When: Comparison is performed
   - Then: Summary statistics should be accurate

4. **No Changes Scenario**
   - Given: Two identical versions
   - When: User compares them
   - Then: No differences should be shown

---

### US-B-006: Version Management API Implementation

**Description:**
As a backend developer, I need to implement version management functionality based on Spring JPA Envers, including version history, difference comparison, and rollback operations.

**Acceptance Criteria:**
- Use JPA Envers to record version history automatically
- Implement version difference comparison algorithm
- Support version rollback operations
- Provide version management API interfaces
- Ensure data consistency during version operations
- Support version metadata storage

**Technical Details:**

**Entity Configuration:**
```java
@Entity
@Audited
@Table(name = "gateway_configs")
public class GatewayConfig {
    @Id
    private String id;
    
    @Version
    private Integer version;
    
    @Column(name = "version_description")
    private String versionDescription;
    
    // Other fields...
}
```

**Service Implementation:**
```java
@Service
@Transactional
public class VersionManagementService {
    
    public List<VersionInfo> getVersionHistory(String configId) {
        // Query audit tables using Envers
    }
    
    public DiffResult compareVersions(String configId, Integer version1, Integer version2) {
        // Compare two versions and return differences
    }
    
    public void rollbackToVersion(String configId, Integer targetVersion) {
        // Rollback configuration to specific version
    }
}
```

**API Endpoints:**
- `GET /api/gateway-configs/{id}/versions` - Get version history
- `GET /api/gateway-configs/{id}/versions/{v1}/compare/{v2}` - Compare versions
- `POST /api/gateway-configs/{id}/rollback/{version}` - Rollback to version

**Database Schema:**
```sql
-- Audit table (auto-generated by Envers)
CREATE TABLE gateway_configs_AUD (
    id VARCHAR(255) NOT NULL,
    REV INT NOT NULL,
    REVTYPE TINYINT,
    domain VARCHAR(255),
    request_path_pattern VARCHAR(500),
    -- Other fields...
    PRIMARY KEY (id, REV)
);
```

**Test Cases:**
1. **Automatic Version Creation**
   - Given: Configuration is updated
   - When: Save operation completes
   - Then: New version should be created in audit table

2. **Version History Retrieval**
   - Given: Multiple versions exist
   - When: API is called to get history
   - Then: All versions should be returned with correct metadata

3. **Version Comparison**
   - Given: Two different versions
   - When: Comparison API is called
   - Then: Differences should be accurately identified

4. **Version Rollback**
   - Given: Target version exists
   - When: Rollback operation is performed
   - Then: Configuration should be restored to target version state

---

## CSP Configuration Features

### US-F-012: CSP Preset Template Selection

**Description:**
As a security administrator, I want to select from preset CSP templates (Strict, Basic, Custom) for quick content security policy configuration.

**Acceptance Criteria:**
- Provide common CSP preset templates (Strict, Basic, Custom)
- Support template preview and description
- Implement one-click template application
- Allow template customization
- Show template security level indicators
- Provide template recommendations based on use case

**Technical Details:**

**Frontend Implementation:**
- **Component:** `CspTemplateSelector.tsx`
- **UI Fields:**
  - `templateType` (enum): 'strict' | 'basic' | 'relaxed' | 'custom'
  - `cspPolicy` (string): Generated CSP policy string
  - `description` (string): Template description
  - `securityLevel` (enum): 'high' | 'medium' | 'low'

**Template Definitions:**
```typescript
const CSP_PRESETS = {
  strict: {
    policy: "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;",
    description: "Maximum security - blocks most external resources",
    securityLevel: "high"
  },
  moderate: {
    policy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    description: "Balanced security - allows common web resources",
    securityLevel: "medium"
  },
  relaxed: {
    policy: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    description: "Minimum restrictions - allows all resources",
    securityLevel: "low"
  }
};
```

**Backend Model:**
```java
public enum CspTemplateType {
    STRICT("STRICT", "严格模式"),
    BASIC("BASIC", "基础模式"),
    CUSTOM("CUSTOM", "自定义模式");
}
```

**Test Cases:**
1. **Template Selection**
   - Given: CSP configuration is open
   - When: User selects a preset template
   - Then: Template should be applied with correct policy

2. **Template Preview**
   - Given: Template is selected
   - When: User hovers over template
   - Then: Description and security level should be shown

3. **Custom Template**
   - Given: Custom template is selected
   - When: User enters custom policy
   - Then: Custom policy should be used instead of preset

---

### US-F-013: CSP Rule Editor

**Description:**
As a developer, I want to customize CSP rules through an intelligent editor, including smart suggestions for directives and values, for precise security policy configuration.

**Acceptance Criteria:**
- Provide CSP directive smart suggestions
- Support CSP value auto-completion
- Implement syntax error checking
- Provide rule validation functionality
- Show directive descriptions and usage examples
- Support directive-specific value suggestions

**Technical Details:**

**Frontend Implementation:**
- **Component:** `CspRuleEditor.tsx`
- **UI Fields:**
  - `directives` (CspDirective[]): Array of CSP directives
  - `values` (string[]): Selected values for each directive
  - `validationErrors` (ValidationError[]): Syntax and validation errors

**Directive Definitions:**
```typescript
const CSP_DIRECTIVES = [
  { 
    value: "default-src", 
    label: "default-src", 
    description: "Default resource loading policy",
    allowedValues: ["'self'", "'none'", "*", "https:", "data:"]
  },
  { 
    value: "script-src", 
    label: "script-src", 
    description: "JavaScript script loading policy",
    allowedValues: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'none'"]
  }
  // ... more directives
];
```

**Validation Logic:**
```typescript
interface ValidationError {
  directive: string;
  message: string;
  severity: 'error' | 'warning';
  position: { line: number; column: number };
}
```

**Test Cases:**
1. **Directive Auto-completion**
   - Given: User starts typing directive name
   - When: Auto-completion is triggered
   - Then: Relevant directives should be suggested

2. **Value Suggestions**
   - Given: Directive is selected
   - When: User starts typing values
   - Then: Valid values for that directive should be suggested

3. **Syntax Validation**
   - Given: Invalid CSP syntax is entered
   - When: Validation is performed
   - Then: Error messages should be displayed

4. **Rule Validation**
   - Given: CSP rules are configured
   - When: Validation is triggered
   - Then: Conflicts and issues should be identified

---

### US-F-014: CSP Rule Preview

**Description:**
As an administrator, I want to preview the effects of CSP rules, including rule parsing and potential impacts, to verify configuration correctness.

**Acceptance Criteria:**
- Provide CSP rule parsing display
- Show potential impact analysis
- Implement rule conflict detection
- Support rule testing validation
- Display security level assessment
- Show browser compatibility information

**Technical Details:**

**Frontend Implementation:**
- **Component:** `CspRulePreview.tsx`
- **UI Fields:**
  - `parsedRules` (ParsedRule[]): Parsed CSP directives
  - `impactAnalysis` (ImpactAnalysis): Security impact assessment
  - `conflicts` (Conflict[]): Detected rule conflicts
  - `browserSupport` (BrowserSupport[]): Browser compatibility

**Preview Data Structure:**
```typescript
interface ParsedRule {
  directive: string;
  values: string[];
  description: string;
  securityLevel: 'high' | 'medium' | 'low';
}

interface ImpactAnalysis {
  securityScore: number;
  blockingLevel: 'strict' | 'moderate' | 'permissive';
  potentialIssues: string[];
  recommendations: string[];
}

interface Conflict {
  type: 'contradiction' | 'redundancy' | 'deprecated';
  description: string;
  severity: 'error' | 'warning' | 'info';
}
```

**Backend API:**
- `POST /api/csp/validate` - Validate CSP rules
- `POST /api/csp/analyze` - Analyze CSP impact

**Test Cases:**
1. **Rule Parsing**
   - Given: CSP policy string is provided
   - When: Preview is generated
   - Then: Rules should be correctly parsed and displayed

2. **Impact Analysis**
   - Given: CSP rules are configured
   - When: Analysis is performed
   - Then: Security impact should be accurately assessed

3. **Conflict Detection**
   - Given: Conflicting rules exist
   - When: Preview is generated
   - Then: Conflicts should be identified and explained

4. **Browser Compatibility**
   - Given: CSP rules are set
   - When: Compatibility is checked
   - Then: Browser support information should be displayed

---

### US-F-015: HTTP Cache Header Configuration

**Description:**
As an operations engineer, I want to configure HTTP cache headers, including Cache-Control settings, to optimize API performance.

**Acceptance Criteria:**
- Provide Cache-Control configuration interface
- Support multiple cache strategy selections
- Implement cache rule preview
- Provide cache effect testing
- Show cache performance metrics
- Support conditional caching rules
- Enable/disable cache configuration
- Support custom cache control values

**Technical Details:**

**Frontend Implementation:**
- **Component:** `CacheHeaderConfig.tsx` (to be added to HeadersTab.tsx)
- **UI Fields:**
  - `enabled` (boolean): Enable/disable cache configuration
  - `cacheControl` (string): Custom Cache-Control value
  - `maxAgeSeconds` (number): Max age in seconds (0-31536000)
  - `etagEnabled` (boolean): ETag support
  - `staleWhileRevalidateSeconds` (number): Stale-while-revalidate time
  - `staleIfErrorSeconds` (number): Stale-if-error time
  - `varyHeaders` (string[]): Vary headers array
  - `description` (string): Cache configuration description

**Cache Strategies:**
```typescript
const CACHE_STRATEGIES = {
  noCache: {
    name: "No Cache",
    description: "Always fetch fresh content",
    value: "no-cache, no-store, must-revalidate",
    maxAge: 0
  },
  shortTerm: {
    name: "Short Term Cache",
    description: "Cache for 5 minutes",
    value: "max-age=300",
    maxAge: 300
  },
  mediumTerm: {
    name: "Medium Term Cache",
    description: "Cache for 1 hour",
    value: "max-age=3600",
    maxAge: 3600
  },
  longTerm: {
    name: "Long Term Cache",
    description: "Cache for 24 hours",
    value: "max-age=86400",
    maxAge: 86400
  },
  custom: {
    name: "Custom",
    description: "Custom cache control settings",
    value: "",
    maxAge: null
  }
};
```

**UI Component Structure:**
```typescript
interface CacheHeaderConfigProps {
  cacheHeader: CacheHeaderDTO;
  onChange: (cacheHeader: CacheHeaderDTO) => void;
  onPreview: () => void;
}

interface CacheHeaderDTO {
  id?: number;
  enabled: boolean;
  cacheControl?: string;
  etagEnabled: boolean;
  maxAgeSeconds?: number;
  staleWhileRevalidateSeconds?: number;
  staleIfErrorSeconds?: number;
  varyHeaders?: string;
  description?: string;
  headerName: string;
  headerValue: string;
}
```

**Backend API Endpoints:**
- `GET /api/gateway-configs/{id}/cache-header` - Get cache header configuration
- `PUT /api/gateway-configs/{id}/cache-header` - Update cache header configuration
- `POST /api/cache/validate` - Validate cache configuration
- `POST /api/cache/preview` - Preview cache header effects

**Test Cases:**
1. **Enable Cache Configuration**
   - Given: Cache configuration is disabled
   - When: User enables cache configuration
   - Then: Cache configuration fields should become editable

2. **Select Cache Strategy**
   - Given: Multiple cache strategies are available
   - When: User selects a strategy
   - Then: Corresponding cache control values should be populated

3. **Custom Cache Control**
   - Given: Custom strategy is selected
   - When: User enters custom cache control value
   - Then: Custom value should be used instead of preset

4. **Cache Preview**
   - Given: Cache configuration is set
   - When: User clicks preview button
   - Then: Generated Cache-Control header should be displayed

5. **Validation**
   - Given: Invalid cache configuration is entered
   - When: Validation is triggered
   - Then: Error messages should be displayed

6. **ETag Configuration**
   - Given: ETag is enabled
   - When: Cache header is generated
   - Then: ETag header should be included in response

7. **Vary Headers**
   - Given: Vary headers are configured
   - When: Cache header is generated
   - Then: Vary header should be included with specified values

---

### US-B-009: HTTP Cache Header Configuration Backend Mapping

**Description:**
As a backend developer, I need to implement API interfaces for cache strategies, supporting cache header configuration and cache rule management.

**Acceptance Criteria:**
- Support cache header mapping with JPA entities
- Provide cache rule validation
- Implement cache header generation logic
- Support cache configuration CRUD operations
- Ensure data consistency in cache operations
- Provide cache performance monitoring

**Technical Details:**

**Entity Mapping:**
```java
@Entity
@Table(name = "cache_headers")
@Audited
public class CacheHeader {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cache_control", length = 500)
    private String cacheControl;

    @Column(name = "etag_enabled", nullable = false)
    private Boolean etagEnabled = true;

    @Column(name = "max_age_seconds")
    private Integer maxAgeSeconds;

    @Column(name = "stale_while_revalidate_seconds")
    private Integer staleWhileRevalidateSeconds;

    @Column(name = "stale_if_error_seconds")
    private Integer staleIfErrorSeconds;

    @Column(name = "vary_headers", columnDefinition = "JSON")
    private String varyHeaders;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "description", length = 500)
    private String description;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "header_config_id", nullable = false)
    private HeaderConfig headerConfig;
}
```

**Service Implementation:**
```java
@Service
@Transactional
public class CacheHeaderService {
    
    @Autowired
    private CacheHeaderRepository cacheHeaderRepository;
    
    public CacheHeaderDTO getCacheHeader(Long headerConfigId) {
        CacheHeader cacheHeader = cacheHeaderRepository.findByHeaderConfigId(headerConfigId);
        return convertToDTO(cacheHeader);
    }
    
    public CacheHeaderDTO updateCacheHeader(Long headerConfigId, CacheHeaderDTO dto) {
        CacheHeader cacheHeader = cacheHeaderRepository.findByHeaderConfigId(headerConfigId);
        if (cacheHeader == null) {
            cacheHeader = new CacheHeader();
            cacheHeader.setHeaderConfig(headerConfigRepository.findById(headerConfigId).orElseThrow());
        }
        
        updateCacheHeaderFromDTO(cacheHeader, dto);
        cacheHeader = cacheHeaderRepository.save(cacheHeader);
        return convertToDTO(cacheHeader);
    }
    
    public CacheValidationResult validateCacheConfiguration(CacheHeaderDTO dto) {
        CacheValidationResult result = new CacheValidationResult();
        
        // Validate max-age
        if (dto.getMaxAgeSeconds() != null && dto.getMaxAgeSeconds() < 0) {
            result.addError("maxAgeSeconds", "Max age must be non-negative");
        }
        
        // Validate stale-while-revalidate
        if (dto.getStaleWhileRevalidateSeconds() != null && dto.getStaleWhileRevalidateSeconds() < 0) {
            result.addError("staleWhileRevalidateSeconds", "Stale while revalidate must be non-negative");
        }
        
        // Validate stale-if-error
        if (dto.getStaleIfErrorSeconds() != null && dto.getStaleIfErrorSeconds() < 0) {
            result.addError("staleIfErrorSeconds", "Stale if error must be non-negative");
        }
        
        return result;
    }
    
    public String generateCacheControlValue(CacheHeader cacheHeader) {
        if (!cacheHeader.getEnabled()) {
            return null;
        }
        
        if (cacheHeader.getCacheControl() != null && !cacheHeader.getCacheControl().trim().isEmpty()) {
            return cacheHeader.getCacheControl();
        }
        
        return buildCacheControlValue(cacheHeader);
    }
    
    private String buildCacheControlValue(CacheHeader cacheHeader) {
        StringBuilder value = new StringBuilder();
        
        if (cacheHeader.getMaxAgeSeconds() != null) {
            value.append("max-age=").append(cacheHeader.getMaxAgeSeconds());
        }
        
        if (cacheHeader.getStaleWhileRevalidateSeconds() != null) {
            if (value.length() > 0) value.append(", ");
            value.append("stale-while-revalidate=").append(cacheHeader.getStaleWhileRevalidateSeconds());
        }
        
        if (cacheHeader.getStaleIfErrorSeconds() != null) {
            if (value.length() > 0) value.append(", ");
            value.append("stale-if-error=").append(cacheHeader.getStaleIfErrorSeconds());
        }
        
        return value.toString();
    }
}
```

**Repository Interface:**
```java
@Repository
public interface CacheHeaderRepository extends JpaRepository<CacheHeader, Long> {
    
    @Query("SELECT ch FROM CacheHeader ch WHERE ch.headerConfig.id = :headerConfigId")
    CacheHeader findByHeaderConfigId(@Param("headerConfigId") Long headerConfigId);
    
    @Query("SELECT ch FROM CacheHeader ch WHERE ch.enabled = true")
    List<CacheHeader> findAllEnabled();
    
    @Query("SELECT ch FROM CacheHeader ch WHERE ch.maxAgeSeconds > :minAge")
    List<CacheHeader> findByMinAge(@Param("minAge") Integer minAge);
}
```

**API Controller:**
```java
@RestController
@RequestMapping("/api/gateway-configs/{configId}")
public class CacheHeaderController {
    
    @Autowired
    private CacheHeaderService cacheHeaderService;
    
    @GetMapping("/cache-header")
    public ResponseEntity<CacheHeaderDTO> getCacheHeader(@PathVariable Long configId) {
        CacheHeaderDTO cacheHeader = cacheHeaderService.getCacheHeader(configId);
        return ResponseEntity.ok(cacheHeader);
    }
    
    @PutMapping("/cache-header")
    public ResponseEntity<CacheHeaderDTO> updateCacheHeader(
            @PathVariable Long configId,
            @RequestBody @Valid CacheHeaderDTO cacheHeaderDTO) {
        
        // Validate cache configuration
        CacheValidationResult validation = cacheHeaderService.validateCacheConfiguration(cacheHeaderDTO);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(null);
        }
        
        CacheHeaderDTO updated = cacheHeaderService.updateCacheHeader(configId, cacheHeaderDTO);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/cache-header/preview")
    public ResponseEntity<CachePreviewResult> previewCacheHeader(
            @PathVariable Long configId,
            @RequestBody CacheHeaderDTO cacheHeaderDTO) {
        
        CachePreviewResult preview = cacheHeaderService.generatePreview(cacheHeaderDTO);
        return ResponseEntity.ok(preview);
    }
}
```

**Validation Classes:**
```java
public class CacheValidationResult {
    private boolean valid = true;
    private Map<String, String> errors = new HashMap<>();
    
    public void addError(String field, String message) {
        errors.put(field, message);
        valid = false;
    }
    
    public boolean isValid() {
        return valid;
    }
    
    public Map<String, String> getErrors() {
        return errors;
    }
}

public class CachePreviewResult {
    private String cacheControlHeader;
    private String etagHeader;
    private String varyHeader;
    private Map<String, String> allHeaders = new HashMap<>();
    
    // Getters and setters
}
```

**Test Cases:**
1. **Create Cache Header**
   - Given: Valid cache header configuration
   - When: POST request is sent to create cache header
   - Then: Cache header should be created and persisted

2. **Update Cache Header**
   - Given: Existing cache header configuration
   - When: PUT request is sent to update cache header
   - Then: Cache header should be updated with new values

3. **Validate Cache Configuration**
   - Given: Invalid cache configuration (negative max-age)
   - When: Validation is performed
   - Then: Validation errors should be returned

4. **Generate Cache Control Value**
   - Given: Cache header with max-age and stale-while-revalidate
   - When: Cache control value is generated
   - Then: Correct Cache-Control header value should be returned

5. **Disable Cache Header**
   - Given: Enabled cache header configuration
   - When: Cache header is disabled
   - Then: No cache headers should be generated

6. **ETag Header Generation**
   - Given: Cache header with ETag enabled
   - When: Headers are generated
   - Then: ETag header should be included

7. **Vary Headers Processing**
   - Given: Cache header with Vary headers configured
   - When: Headers are generated
   - Then: Vary header should be included with correct values

8. **Database Transaction**
   - Given: Cache header update operation
   - When: Database transaction fails
   - Then: Changes should be rolled back and error returned