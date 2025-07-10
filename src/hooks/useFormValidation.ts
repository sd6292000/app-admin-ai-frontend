import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { validateForm, FormMetaConfig, ValidationError } from '../lib/i18n';

interface UseFormValidationProps {
  formKey: string;
  values: Record<string, any>;
  showValidation?: boolean;
}

export function useFormValidation({ formKey, values, showValidation = false }: UseFormValidationProps) {
  const { language, metaInfo } = useLanguage();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);

  // 获取表单配置
  const formConfig = metaInfo ? 
    metaInfo.pages
      .find(page => page.key === 'gateway-mapping')
      ?.forms.find(form => form.key === formKey) : null;

  // 验证表单
  useEffect(() => {
    if (showValidation && formConfig) {
      const validationErrors = validateForm(formConfig, values, language);
      setErrors(validationErrors);
      setIsValid(validationErrors.length === 0);
    } else {
      setErrors([]);
      setIsValid(true);
    }
  }, [formConfig, values, language, showValidation]);

  return {
    errors,
    isValid,
    formConfig,
    errorMessages: errors.map(error => error.message)
  };
} 