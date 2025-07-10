# React Hooks顺序问题修复

## 问题描述
在选择Backend的Region后，级联的Data Center选项不显示，并且抛出错误：
```
React has detected a change in the order of Hooks called by FormField. This will lead to bugs and errors if not fixed.
```

## 问题原因
在`FormField`组件中，Hooks的调用顺序发生了变化：

1. `useLocalizedText()` Hook在组件顶部调用
2. `useState()` Hook在组件顶部调用
3. 但是当`shouldShow`为false时，组件会提前返回`null`
4. 这导致Hooks的调用顺序在不同渲染之间发生变化

**问题代码：**
```typescript
export default function FormField({...}) {
  const { getValidationMessage } = useLocalizedText(); // Hook 1
  const [validationError, setValidationError] = useState<string | null>(null); // Hook 2

  // 检查字段是否应该显示
  const shouldShow = shouldShowField(field, allValues);
  if (!shouldShow) return null; // ❌ 提前返回，导致Hooks顺序变化

  // 验证字段值
  useEffect(() => { // Hook 3 - 有时不会执行
    // ...
  }, [field, value, language, allValues, showValidation]);
  
  // ...
}
```

## 解决方案

### 1. 修复Hooks顺序问题
将所有Hooks调用移到条件返回之前：

```typescript
export default function FormField({...}) {
  const { getValidationMessage } = useLocalizedText(); // Hook 1
  const [validationError, setValidationError] = useState<string | null>(null); // Hook 2

  // 检查字段是否应该显示
  const shouldShow = shouldShowField(field, allValues);

  // 验证字段值
  useEffect(() => { // Hook 3 - 总是执行
    if (showValidation) {
      const error = validateField(field, value, language, allValues);
      setValidationError(error ? error.message : null);
    } else {
      setValidationError(null);
    }
  }, [field, value, language, allValues, showValidation]);

  // 如果字段不应该显示，返回null（在Hooks之后）
  if (!shouldShow) return null; // ✅ 在所有Hooks之后返回

  // ... 其余渲染逻辑
}
```

### 2. 修复TypeScript类型错误
更新`FieldConfig`接口以支持级联选项：

```typescript
export interface FieldConfig {
  // ... 其他属性
  options?: Array<{ 
    label: Record<string, string>; 
    value: string; 
    parentValue?: string // ✅ 添加parentValue支持
  }>;
  // ...
}
```

同时更新相关函数签名：

```typescript
export function getOptionLabel(
  option: { 
    label: Record<string, string>; 
    value: string; 
    parentValue?: string 
  },
  language: Language
): string {
  // ...
}
```

### 3. 级联逻辑实现
在FormField的select组件中实现级联过滤：

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

## 修复后的效果

### 1. Hooks顺序稳定
- 所有Hooks都在条件返回之前调用
- 确保Hooks调用顺序在每次渲染中都保持一致
- 消除了React Hooks顺序变化的警告

### 2. 级联功能正常工作
- 选择Region后，Data Center选项正确过滤
- 级联关系完全基于meta info配置
- 支持动态选项过滤

### 3. 类型安全
- TypeScript类型定义完整
- 支持parentValue属性的级联选项
- 编译时类型检查通过

## 测试验证

### 1. Hooks顺序测试
- 选择不同的Region值
- 验证没有Hooks顺序变化警告
- 确认组件正常渲染

### 2. 级联功能测试
- 选择EU (欧洲) → 显示WK, RH选项
- 选择AS (亚洲) → 显示SDC, TDC选项  
- 选择AM (美洲) → 显示PSC选项
- 切换Region时Data Center自动清空

### 3. 错误处理测试
- 验证错误信息正确显示
- 确认表单验证正常工作
- 测试边界情况处理

## 文件变更

### 修改文件
- `src/components/FormField.tsx` - 修复Hooks顺序问题
- `src/lib/i18n.ts` - 更新类型定义支持parentValue

### 关键变更
1. **Hooks顺序修复**：将所有Hooks调用移到条件返回之前
2. **类型定义更新**：添加parentValue支持
3. **级联逻辑实现**：在select组件中实现动态选项过滤

## 总结
通过修复Hooks调用顺序问题，现在：
- ✅ 消除了React Hooks顺序变化警告
- ✅ 级联选择功能正常工作
- ✅ 类型安全得到保证
- ✅ 代码结构更加稳定和可维护

这个修复确保了组件在React的Hooks规则下正确工作，同时保持了级联功能的完整性。 