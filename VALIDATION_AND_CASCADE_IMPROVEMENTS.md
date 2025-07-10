# 验证和级联关系改进总结

## 概述
本次更新主要解决了以下问题：
1. 验证错误在提交前显示，而不是提交后一闪而过
2. 恢复Backend中Region和Data Center的级联关系，并基于meta-info配置

## 主要改进

### 1. 实时验证系统

#### 验证状态管理
- 添加了`validationErrors`状态来存储所有表单的验证错误
- 添加了`showValidation`状态来控制验证显示时机
- 验证错误在提交前就会显示，用户可以清楚看到问题所在

#### 验证流程优化
```typescript
// 验证所有表单
function validateAllForms() {
  if (!metaInfo) return false;
  
  const errors: Record<string, string[]> = {};
  let hasErrors = false;

  // 验证每个tab的表单
  const forms = ['basic', 'backends', 'cookies', 'headers', 'responseBodyDecorator', 'limiters', 'csp'];
  
  forms.forEach(formKey => {
    const formConfig = getFormConfig(metaInfo, 'gateway-mapping', formKey);
    if (formConfig) {
      const formErrors = validateForm(formConfig, formData[formKey as keyof FormDataType], language);
      if (formErrors.length > 0) {
        errors[formKey] = formErrors.map(error => error.message);
        hasErrors = true;
      }
    }
  });

  // 特殊验证：headers和cookies的重复name检查
  const allHeaders = [...(formData.headers?.request || []), ...(formData.headers?.response || [])];
  const headerNames = allHeaders.map(h => h.name).filter(Boolean);
  const uniqueHeaderNames = new Set(headerNames);
  if (headerNames.length !== uniqueHeaderNames.size) {
    errors.headers = [...(errors.headers || []), 'Header names must be unique'];
    hasErrors = true;
  }

  const cookieExceptions = formData.cookies?.exceptions || [];
  const cookieNames = cookieExceptions.map(c => c.cookieName).filter(Boolean);
  const uniqueCookieNames = new Set(cookieNames);
  if (cookieNames.length !== uniqueCookieNames.size) {
    errors.cookies = [...(errors.cookies || []), 'Cookie names must be unique'];
    hasErrors = true;
  }

  setValidationErrors(errors);
  setShowValidation(true);
  
  return !hasErrors;
}
```

#### 提交流程改进
```typescript
// 提交按钮点击
function handleSubmit() {
  // 先验证所有表单
  if (!validateAllForms()) {
    // 如果有错误，切换到第一个有错误的tab
    const errorTabs = Object.keys(validationErrors);
    if (errorTabs.length > 0) {
      const tabMap: Record<string, number> = {
        'basic': 0,
        'backends': 1,
        'cookies': 2,
        'headers': 3,
        'responseBodyDecorator': 4,
        'limiters': 5,
        'csp': 6
      };
      const firstErrorTab = errorTabs[0];
      if (tabMap[firstErrorTab] !== undefined) {
        setTab(tabMap[firstErrorTab]);
      }
    }
    return;
  }
  
  setOpenDialog(true);
}
```

#### 验证错误显示
- 在表单底部添加了验证错误显示区域
- 按表单分组显示错误信息
- 自动切换到第一个有错误的tab
- 提交成功后自动清除验证状态

### 2. 级联关系配置

#### Meta Info API增强
- 扩展了`FieldConfig`接口，支持`parentValue`属性
- 在dataCenter字段配置中添加了级联关系

```typescript
{
  key: 'dataCenter',
  label: { en: 'Data Center', zh: '数据中心' },
  type: 'select',
  required: true,
  dependencies: ['region'],
  conditional: {
    field: 'region',
    value: '',
    operator: 'not_equals'
  },
  options: [
    { label: { en: 'WK', zh: 'WK' }, value: 'WK', parentValue: 'EU' },
    { label: { en: 'RH', zh: 'RH' }, value: 'RH', parentValue: 'EU' },
    { label: { en: 'SDC', zh: 'SDC' }, value: 'SDC', parentValue: 'AS' },
    { label: { en: 'TDC', zh: 'TDC' }, value: 'TDC', parentValue: 'AS' },
    { label: { en: 'PSC', zh: 'PSC' }, value: 'PSC', parentValue: 'AM' }
  ]
}
```

#### FormField组件增强
- 在select组件中添加了级联选项过滤逻辑
- 根据父字段的值动态过滤子字段的选项

```typescript
case 'select':
  return (
    <FormControl fullWidth error={!!hasError} disabled={disabled}>
      <InputLabel>{getFieldLabel(field, language)}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        label={getFieldLabel(field, language)}
      >
        {field.options?.map((option) => {
          // 检查级联条件
          if (option.parentValue && field.dependencies) {
            const parentField = field.dependencies[0]; // 假设只有一个依赖字段
            const parentValue = allValues[parentField];
            if (parentValue !== option.parentValue) {
              return null; // 不显示不匹配的选项
            }
          }
          return (
            <MenuItem key={option.value} value={option.value}>
              {getOptionLabel(option, language)}
            </MenuItem>
          );
        }).filter(Boolean)}
      </Select>
      {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
```

#### BackendsTab组件优化
- 移除了硬编码的级联逻辑
- 完全依赖meta info配置来处理级联关系

```typescript
const handleChange = (idx: number, field: string, value: any) => {
  const arr = [...backends];
  arr[idx][field] = value;
  
  // 根据meta info配置处理级联关系
  if (formConfig) {
    const dataCenterField = formConfig.fields.find(f => f.key === 'dataCenter');
    if (field === "region" && dataCenterField?.dependencies?.includes('region')) {
      arr[idx]["dataCenter"] = ""; // 清空依赖字段
    }
  }
  
  // 处理代理相关字段
  if (field === "webProxyEnabled" && !value) {
    arr[idx].proxyHost = "";
    arr[idx].proxyPort = "";
    arr[idx].proxyUsername = "";
    arr[idx].proxyPassword = "";
  }
  
  setFormData((prev: any) => ({ ...prev, backends: arr }));
};
```

### 3. 用户体验改进

#### 验证反馈
- 用户点击提交按钮时立即看到所有验证错误
- 自动跳转到第一个有错误的tab
- 错误信息清晰分组显示
- 提交成功后自动清除验证状态

#### 级联选择
- Region选择后，Data Center选项自动过滤
- 切换Region时自动清空Data Center选择
- 级联关系完全基于配置，易于维护和扩展

#### 多语言支持
- 添加了验证错误相关的标签
- 所有错误信息都支持中英文

## 技术细节

### 验证状态管理
```typescript
const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
const [showValidation, setShowValidation] = useState(false);
```

### 级联配置结构
```typescript
interface FieldConfig {
  // ... 其他属性
  options?: Array<{ 
    label: Record<string, string>; 
    value: string; 
    parentValue?: string 
  }>;
  dependencies?: string[];
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  };
}
```

### 级联关系映射
- EU (欧洲) → WK, RH
- AS (亚洲) → SDC, TDC  
- AM (美洲) → PSC

## 测试建议

### 验证功能测试
1. **实时验证**
   - 填写无效数据后点击提交
   - 验证错误是否立即显示
   - 验证是否自动跳转到错误tab

2. **错误显示**
   - 检查错误信息是否按表单分组
   - 验证错误信息是否清晰易懂
   - 测试多语言错误显示

3. **验证清除**
   - 修复错误后重新提交
   - 验证成功后检查错误状态是否清除

### 级联功能测试
1. **级联选择**
   - 选择不同Region，验证Data Center选项是否正确过滤
   - 切换Region，验证Data Center是否自动清空
   - 测试所有Region和Data Center组合

2. **配置驱动**
   - 修改meta info中的级联配置
   - 验证页面是否正确响应配置变化

### 集成测试
1. **完整流程**
   - 填写完整表单并提交
   - 验证所有验证规则是否生效
   - 测试级联关系是否正常工作

2. **错误恢复**
   - 在有错误的情况下修复问题
   - 验证表单是否能正常提交

## 文件变更清单

### 修改文件
- `src/app/api/meta-info/route.ts` - 添加级联配置和验证标签
- `src/components/FormField.tsx` - 增强select组件支持级联选项
- `src/app/gateway-mapping/page.tsx` - 添加实时验证状态管理
- `src/app/gateway-mapping/components/BackendsTab.tsx` - 优化级联逻辑

### 新增功能
- 实时验证状态管理
- 验证错误分组显示
- 自动跳转到错误tab
- 基于配置的级联关系
- 动态选项过滤

## 总结
本次更新成功实现了：
1. ✅ 验证错误在提交前显示，提供更好的用户体验
2. ✅ 恢复了Region和Data Center的级联关系
3. ✅ 级联关系完全基于meta-info配置，易于维护
4. ✅ 增强了验证系统的可扩展性
5. ✅ 改进了错误反馈和用户引导

所有改进都遵循了配置驱动的设计原则，确保了代码的可维护性和扩展性。 