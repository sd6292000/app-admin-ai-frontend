# 多语言支持系统 - Gateway Management System

## 概述

本项目实现了完整的多语言支持系统，包括：

1. **Meta Information API** - 提供多语言标签、验证规则和静态选项配置
2. **语言上下文管理** - 全局语言状态管理和切换
3. **通用表单字段组件** - 支持所有字段类型和验证
4. **本地化工具函数** - 文本本地化和验证处理

## 主要功能

### 1. Meta Information API

**端点**: `/api/meta-info`

**功能**:
- 提供多语言标签配置
- 包含字段验证规则
- 静态选项配置
- 条件字段显示逻辑

**使用示例**:
```typescript
// 获取所有配置
const response = await fetch('/api/meta-info?lang=en');
const metaInfo = await response.json();

// 获取特定页面配置
const response = await fetch('/api/meta-info?lang=zh&page=gateway-mapping');
const pageConfig = await response.json();
```

### 2. 语言上下文

**组件**: `LanguageProvider`

**功能**:
- 全局语言状态管理
- 自动加载meta information
- 语言偏好持久化
- 错误处理和加载状态

**使用示例**:
```typescript
import { useLanguage, useLocalizedText } from '../contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, metaInfo, loading } = useLanguage();
  const { getLabel, getMessage, getText } = useLocalizedText();
  
  return (
    <div>
      <h1>{getLabel('title')}</h1>
      <p>{getMessage('description')}</p>
    </div>
  );
}
```

### 3. 通用表单字段组件

**组件**: `FormField`

**支持的类型**:
- `text` - 文本输入
- `number` - 数字输入
- `select` - 单选下拉
- `multiselect` - 多选下拉
- `checkbox` - 复选框
- `switch` - 开关
- `textarea` - 多行文本

**使用示例**:
```typescript
import FormField from '../components/FormField';

function MyForm() {
  const field = {
    key: 'domain',
    label: { en: 'Domain', zh: '域名' },
    type: 'text',
    required: true,
    validation: [
      { type: 'required', message: 'Domain is required' },
      { type: 'pattern', value: '^[a-zA-Z0-9.-]+$', message: 'Invalid domain format' }
    ]
  };
  
  return (
    <FormField
      field={field}
      value={value}
      onChange={setValue}
      error={validationError}
    />
  );
}
```

### 4. 本地化工具函数

**文件**: `src/lib/i18n.ts`

**主要函数**:
- `getLocalizedText()` - 获取本地化文本
- `validateField()` - 字段验证
- `validateForm()` - 表单验证
- `shouldShowField()` - 条件字段显示
- `loadMetaInfo()` - 加载meta information

## 配置结构

### Meta Information 结构

```typescript
interface MetaInformation {
  languages: string[];
  defaultLanguage: string;
  pages: PageMetaConfig[];
  common: {
    labels: Record<string, Record<string, string>>;
    messages: Record<string, Record<string, string>>;
    validation: Record<string, Record<string, string>>;
  };
}
```

### 字段配置

```typescript
interface FieldConfig {
  key: string;
  label: Record<string, string>;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'switch';
  required?: boolean;
  defaultValue?: any;
  placeholder?: Record<string, string>;
  validation?: ValidationRule[];
  options?: Array<{ label: Record<string, string>; value: string }>;
  dependencies?: string[];
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  };
}
```

## 验证规则

支持以下验证类型：

- `required` - 必填字段
- `min` - 最小值
- `max` - 最大值
- `pattern` - 正则表达式
- `email` - 邮箱格式
- `url` - URL格式
- `custom` - 自定义验证

## 使用步骤

### 1. 设置语言提供者

在根布局中添加 `LanguageProvider`:

```typescript
// src/app/layout.tsx
import { LanguageProvider } from '../contexts/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider initialLanguage="en">
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### 2. 在组件中使用

```typescript
import { useLanguage, useLocalizedText } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyPage() {
  const { language, metaInfo, loading } = useLanguage();
  const { getLabel, getMessage } = useLocalizedText();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <header>
        <h1>{getLabel('pageTitle')}</h1>
        <LanguageSwitcher />
      </header>
      <main>
        <p>{getMessage('welcomeMessage')}</p>
      </main>
    </div>
  );
}
```

### 3. 创建表单

```typescript
import FormField from '../components/FormField';
import { getFormConfig, validateForm } from '../lib/i18n';

function MyForm() {
  const { metaInfo, language } = useLanguage();
  const formConfig = getFormConfig(metaInfo, 'gateway-mapping', 'basic');
  
  const handleSubmit = () => {
    const errors = validateForm(formConfig, formData, language);
    if (errors.length === 0) {
      // 提交表单
    }
  };
  
  return (
    <form>
      {formConfig?.fields.map(field => (
        <FormField
          key={field.key}
          field={field}
          value={formData[field.key]}
          onChange={(value) => setFormData({ ...formData, [field.key]: value })}
        />
      ))}
    </form>
  );
}
```

## 添加新语言

1. 在 `src/app/api/meta-info/route.ts` 中添加新语言配置
2. 更新 `Language` 类型定义
3. 在 `LanguageSwitcher` 组件中添加新语言选项

## 添加新字段

1. 在 meta information 配置中添加字段定义
2. 在表单组件中使用 `FormField` 组件
3. 添加相应的验证规则

## 最佳实践

1. **使用类型安全**: 始终使用 TypeScript 类型定义
2. **错误处理**: 处理加载错误和验证错误
3. **性能优化**: 使用 React.memo 优化组件渲染
4. **可访问性**: 确保所有字段都有适当的标签和错误信息
5. **测试**: 为多语言功能编写测试用例

## 故障排除

### 常见问题

1. **语言切换不生效**
   - 检查 `LanguageProvider` 是否正确设置
   - 确认 meta information API 返回正确的数据

2. **验证规则不工作**
   - 检查字段配置中的验证规则格式
   - 确认验证函数正确调用

3. **字段不显示**
   - 检查条件字段的配置
   - 确认依赖字段的值正确

### 调试技巧

1. 使用浏览器开发者工具检查网络请求
2. 在组件中添加 console.log 输出状态
3. 使用 React DevTools 检查组件状态
4. 检查 localStorage 中的语言偏好设置 