// 多语言支持工具函数

export interface MetaInformation {
  languages: string[];
  defaultLanguage: string;
  pages: PageMetaConfig[];
  common: {
    labels: Record<string, Record<string, string>>;
    messages: Record<string, Record<string, string>>;
    validation: Record<string, Record<string, string>>;
  };
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
}

export interface FieldConfig {
  key: string;
  label: Record<string, string>;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'switch';
  required?: boolean;
  defaultValue?: any;
  placeholder?: Record<string, string>;
  validation?: ValidationRule[];
  options?: Array<{ label: Record<string, string>; value: string; parentValue?: string }>;
  dependencies?: string[];
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  };
}

export interface FormMetaConfig {
  key: string;
  label: Record<string, string>;
  fields: FieldConfig[];
  validation?: ValidationRule[];
}

export interface PageMetaConfig {
  key: string;
  label: Record<string, string>;
  forms: FormMetaConfig[];
  actions: Array<{
    key: string;
    label: Record<string, string>;
    type: 'primary' | 'secondary' | 'danger';
    icon?: string;
  }>;
}

// 语言类型
export type Language = 'en' | 'zh';

// 验证错误类型
export interface ValidationError {
  field: string;
  message: string;
  type: string;
}

// 获取本地化文本
export function getLocalizedText(
  texts: Record<string, string> | undefined,
  language: Language,
  fallback?: string
): string {
  if (!texts) return fallback || '';
  return texts[language] || texts['en'] || fallback || '';
}

// 获取字段配置
export function getFieldConfig(
  metaInfo: MetaInformation,
  pageKey: string,
  formKey: string,
  fieldKey: string
): FieldConfig | undefined {
  const page = metaInfo.pages.find(p => p.key === pageKey);
  if (!page) return undefined;

  const form = page.forms.find(f => f.key === formKey);
  if (!form) return undefined;

  return form.fields.find(f => f.key === fieldKey);
}

// 获取表单配置
export function getFormConfig(
  metaInfo: MetaInformation,
  pageKey: string,
  formKey: string
): FormMetaConfig | undefined {
  const page = metaInfo.pages.find(p => p.key === pageKey);
  if (!page) return undefined;

  return page.forms.find(f => f.key === formKey);
}

// 获取页面配置
export function getPageConfig(
  metaInfo: MetaInformation,
  pageKey: string
): PageMetaConfig | undefined {
  return metaInfo.pages.find(p => p.key === pageKey);
}

// 验证字段值
export function validateField(
  field: FieldConfig,
  value: any,
  language: Language,
  allValues?: Record<string, any>
): ValidationError | null {
  if (!field.validation) return null;

  for (const rule of field.validation) {
    let isValid = true;

    switch (rule.type) {
      case 'required':
        isValid = value !== null && value !== undefined && value !== '';
        break;

      case 'min':
        if (typeof value === 'number') {
          isValid = value >= (rule.value || 0);
        } else if (typeof value === 'string') {
          isValid = value.length >= (rule.value || 0);
        }
        break;

      case 'max':
        if (typeof value === 'number') {
          isValid = value <= (rule.value || 0);
        } else if (typeof value === 'string') {
          isValid = value.length <= (rule.value || 0);
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && rule.value) {
          const regex = new RegExp(rule.value);
          isValid = regex.test(value);
        }
        break;

      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(value);
        }
        break;

      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
            isValid = true;
          } catch {
            isValid = false;
          }
        }
        break;

      case 'custom':
        // 自定义验证逻辑
        if (rule.value === 'unique_domain_path') {
          // 这里可以添加自定义验证逻辑
          isValid = true;
        } else if (rule.value === 'at_least_one_limiter') {
          // 检查是否至少有一个限制器
          isValid = allValues && (
            (allValues.ipRules && allValues.ipRules.length > 0) ||
            allValues.maxConcurrent ||
            allValues.maxPerMinute ||
            (allValues.allowedMethods && allValues.allowedMethods.length > 0)
          );
        } else if (rule.value === 'unique_header_name') {
          // 检查header name是否唯一
          isValid = true; // 这个验证需要在表单级别进行
        } else if (rule.value === 'unique_cookie_name') {
          // 检查cookie name是否唯一
          isValid = true; // 这个验证需要在表单级别进行
        }
        break;
    }

    if (!isValid) {
      return {
        field: field.key,
        message: getLocalizedText(
          { en: rule.message, zh: rule.message },
          language,
          rule.message
        ),
        type: rule.type
      };
    }
  }

  return null;
}

// 验证表单
export function validateForm(
  form: FormMetaConfig,
  values: Record<string, any>,
  language: Language
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 验证字段
  for (const field of form.fields) {
    const value = values[field.key];
    const error = validateField(field, value, language, values);
    if (error) {
      errors.push(error);
    }
  }

  // 验证表单级别的规则
  if (form.validation) {
    for (const rule of form.validation) {
      if (rule.type === 'custom') {
        let isValid = true;
        
        if (rule.value === 'unique_header_names') {
          // 检查headers中的name是否唯一
          const headers = values.request || values.response || [];
          const names = headers.map((h: any) => h.name).filter(Boolean);
          const uniqueNames = new Set(names);
          isValid = names.length === uniqueNames.size;
        } else if (rule.value === 'unique_cookie_names') {
          // 检查cookies中的name是否唯一
          const exceptions = values.exceptions || [];
          const names = exceptions.map((c: any) => c.cookieName).filter(Boolean);
          const uniqueNames = new Set(names);
          isValid = names.length === uniqueNames.size;
        } else {
          // 其他自定义验证
          const error = validateField(
            { key: 'form', validation: [rule] } as FieldConfig,
            values,
            language,
            values
          );
          if (error) {
            errors.push(error);
          }
          continue;
        }
        
        if (!isValid) {
          errors.push({
            field: 'form',
            message: getLocalizedText(
              { en: rule.message, zh: rule.message },
              language,
              rule.message
            ),
            type: rule.type
          });
        }
      }
    }
  }

  return errors;
}

// 检查字段是否应该显示（基于条件）
export function shouldShowField(
  field: FieldConfig,
  values: Record<string, any>
): boolean {
  if (!field.conditional) return true;

  const { field: conditionalField, value, operator } = field.conditional;
  const fieldValue = values[conditionalField];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'contains':
      return Array.isArray(fieldValue) ? fieldValue.includes(value) : false;
    case 'exists':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    default:
      return true;
  }
}

// 获取字段的默认值
export function getFieldDefaultValue(field: FieldConfig): any {
  return field.defaultValue;
}

// 获取字段的占位符文本
export function getFieldPlaceholder(
  field: FieldConfig,
  language: Language
): string {
  return getLocalizedText(field.placeholder, language);
}

// 获取字段的标签文本
export function getFieldLabel(
  field: FieldConfig,
  language: Language
): string {
  return getLocalizedText(field.label, language);
}

// 获取选项的标签文本
export function getOptionLabel(
  option: { label: Record<string, string>; value: string; parentValue?: string },
  language: Language
): string {
  return getLocalizedText(option.label, language);
}

// 获取通用标签
export function getCommonLabel(
  metaInfo: MetaInformation,
  key: string,
  language: Language
): string {
  return getLocalizedText(metaInfo.common.labels[key], language);
}

// 获取通用消息
export function getCommonMessage(
  metaInfo: MetaInformation,
  key: string,
  language: Language
): string {
  return getLocalizedText(metaInfo.common.messages[key], language);
}

// 获取验证消息
export function getValidationMessage(
  metaInfo: MetaInformation,
  key: string,
  language: Language,
  params?: Record<string, any>
): string {
  let message = getLocalizedText(metaInfo.common.validation[key], language);
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(`{${param}}`, String(value));
    });
  }
  
  return message;
}

// 加载Meta Information
export async function loadMetaInfo(
  language: Language = 'en',
  page?: string
): Promise<MetaInformation> {
  const url = page 
    ? `/api/meta-info?lang=${language}&page=${page}`
    : `/api/meta-info?lang=${language}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to load meta info: ${response.statusText}`);
  }
  
  return response.json();
} 