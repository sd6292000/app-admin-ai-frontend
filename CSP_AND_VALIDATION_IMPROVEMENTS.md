# CSP配置和验证改进总结

## 概述
本次更新主要解决了以下问题：
1. 优化代码让所有label和option都从meta-info API获取
2. 为Cookie和Header添加重复name的验证
3. 恢复CSP配置功能并基于meta-data配置

## 主要改进

### 1. Meta Info API优化

#### 更新了Headers配置
- 简化了headers配置结构，移除了request/response multiselect选项
- 添加了重复name验证规则
- 改进了字段标签和占位符文本

#### 更新了Cookies配置
- 添加了重复cookie name验证
- 改进了cookie name格式验证（符合RFC6265标准）
- 添加了表单级别的唯一性验证

#### 新增CSP配置
- 添加了完整的CSP配置表单
- 支持预设值（严格、中等、宽松、自定义）
- 提供CSP指令和值的多选配置
- 支持将CSP自动添加到响应头

### 2. 验证系统增强

#### 表单级别验证
- 在`i18n.ts`中添加了表单级别的重复name验证
- 支持headers和cookies的name唯一性检查
- 改进了自定义验证逻辑

#### 组件级别验证
- 在HeadersTab和CookiesTab中添加了重复name检查
- 实时验证并提供用户友好的错误消息

### 3. 新增CSP组件

#### CspTab组件特性
- 支持启用/禁用CSP
- 提供4种预设模式（严格、中等、宽松、自定义）
- 高级配置选项（指令和值选择）
- CSP值预览功能
- 一键添加到响应头功能

#### CSP预设值
```javascript
const CSP_PRESETS = {
  strict: "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;",
  moderate: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  relaxed: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
  custom: ""
};
```

### 4. 多语言支持增强

#### 新增标签
- `requestHeaders`: 请求头
- `responseHeaders`: 响应头
- `securityHeaders`: 安全请求头
- `cookieExceptions`: Cookie异常
- `cspAdvanced`: 高级CSP配置
- `cspPreview`: CSP预览
- `addCspToHeaders`: 将CSP添加到响应头
- `addSecurityHeaders`: 添加安全请求头

#### 新增消息
- `duplicateHeaderNames`: 请求头名称必须唯一
- `duplicateCookieNames`: Cookie名称必须唯一
- `loading`: 加载中
- `submitting`: 提交中
- `submitSuccess`: 提交成功
- `submitError`: 提交失败
- `confirmSubmit`: 确认提交
- `confirmSubmitMessage`: 确认提交消息

#### 新增提示
- `headersTip`: 请求头配置提示
- `cookieTip`: Cookie配置提示
- `cspTip`: CSP配置提示

### 5. 主页面更新

#### 添加CSP Tab
- 在主页面中添加了CSP配置标签页
- 更新了FormDataType接口以包含CSP配置
- 添加了CSP标签页的图标和导航

#### 类型安全改进
- 修复了Language类型导入问题
- 确保所有组件使用正确的类型定义

## 技术细节

### 验证逻辑
```typescript
// 检查重复的header names
const allHeaders = [...requestHeaders, ...responseHeaders];
const names = allHeaders.map(h => h.name).filter(Boolean);
const uniqueNames = new Set(names);
if (names.length !== uniqueNames.size) {
  validationErrors.push(getMessage('duplicateHeaderNames'));
}

// 检查重复的cookie names
const exceptions = formData.cookies?.exceptions || [];
const names = exceptions.map(e => e.cookieName).filter(Boolean);
const uniqueNames = new Set(names);
if (names.length !== uniqueNames.size) {
  validationErrors.push(getMessage('duplicateCookieNames'));
}
```

### CSP集成
```typescript
// 添加CSP到响应头
const addCspToHeaders = () => {
  const cspValue = generateCspValue();
  if (!cspValue.trim()) return;

  setFormData((prev: any) => {
    const responseHeaders = prev.headers?.response || [];
    const existingCspIndex = responseHeaders.findIndex((h: any) => 
      h.name.toLowerCase() === 'content-security-policy'
    );

    if (existingCspIndex >= 0) {
      // 更新现有的CSP header
      const updatedHeaders = [...responseHeaders];
      updatedHeaders[existingCspIndex] = { 
        ...updatedHeaders[existingCspIndex], 
        value: cspValue 
      };
      return {
        ...prev,
        headers: { ...prev.headers, response: updatedHeaders }
      };
    } else {
      // 添加新的CSP header
      return {
        ...prev,
        headers: { 
          ...prev.headers, 
          response: [...responseHeaders, { 
            name: "Content-Security-Policy", 
            value: cspValue, 
            override: false 
          }] 
        }
      };
    }
  });
};
```

## 测试建议

### 功能测试
1. **Headers重复验证**
   - 在请求头或响应头中添加相同名称的header
   - 验证是否显示重复name错误

2. **Cookies重复验证**
   - 在Cookie异常中添加相同名称的cookie
   - 验证是否显示重复name错误

3. **CSP配置**
   - 测试不同预设模式
   - 验证自定义CSP值
   - 测试添加到响应头功能
   - 验证CSP值预览

4. **多语言支持**
   - 切换中英文验证标签和消息
   - 确认所有新增标签正确显示

### 集成测试
1. **表单提交**
   - 测试包含CSP配置的完整表单提交
   - 验证重复name验证在提交时生效

2. **数据持久化**
   - 验证CSP配置能正确保存和加载
   - 确认headers中的CSP值正确更新

## 文件变更清单

### 新增文件
- `src/app/gateway-mapping/components/CspTab.tsx`

### 修改文件
- `src/app/api/meta-info/route.ts` - 更新配置和添加新标签
- `src/lib/i18n.ts` - 增强验证逻辑
- `src/app/gateway-mapping/page.tsx` - 添加CSP tab
- `src/app/gateway-mapping/components/HeadersTab.tsx` - 添加重复验证
- `src/app/gateway-mapping/components/CookiesTab.tsx` - 添加重复验证

### 总结
本次更新成功实现了所有要求的功能：
1. ✅ 所有label和option现在都从meta-info API获取
2. ✅ Cookie和Header添加了重复name验证
3. ✅ 恢复了CSP配置功能并基于meta-data配置
4. ✅ 增强了多语言支持
5. ✅ 改进了类型安全性
6. ✅ 提供了完整的CSP配置和预览功能

所有改进都遵循了现有的代码架构和设计模式，确保了代码的一致性和可维护性。 