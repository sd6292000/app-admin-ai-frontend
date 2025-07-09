"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MetaInformation, Language, loadMetaInfo } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  metaInfo: MetaInformation | null;
  loading: boolean;
  error: string | null;
  refreshMetaInfo: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ 
  children, 
  initialLanguage = 'en' 
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [metaInfo, setMetaInfo] = useState<MetaInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载meta information
  const loadMetaInformation = async (lang: Language) => {
    try {
      setLoading(true);
      setError(null);
      const info = await loadMetaInfo(lang);
      setMetaInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meta information');
      console.error('Failed to load meta information:', err);
    } finally {
      setLoading(false);
    }
  };

  // 设置语言
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // 保存到localStorage
    localStorage.setItem('preferred-language', lang);
  };

  // 刷新meta information
  const refreshMetaInfo = async () => {
    await loadMetaInformation(language);
  };

  // 初始化
  useEffect(() => {
    // 从localStorage获取首选语言
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['en', 'zh'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // 当语言改变时重新加载meta information
  useEffect(() => {
    loadMetaInformation(language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    metaInfo,
    loading,
    error,
    refreshMetaInfo
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook to get localized text
export function useLocalizedText() {
  const { metaInfo, language } = useLanguage();

  const getText = (
    texts: Record<string, string> | undefined,
    fallback?: string
  ): string => {
    if (!texts) return fallback || '';
    return texts[language] || texts['en'] || fallback || '';
  };

  const getLabel = (key: string): string => {
    if (!metaInfo) return key;
    return getText(metaInfo.common.labels[key], key);
  };

  const getMessage = (key: string): string => {
    if (!metaInfo) return key;
    return getText(metaInfo.common.messages[key], key);
  };

  const getValidationMessage = (
    key: string,
    params?: Record<string, any>
  ): string => {
    if (!metaInfo) return key;
    let message = getText(metaInfo.common.validation[key], key);
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(`{${param}}`, String(value));
      });
    }
    
    return message;
  };

  return {
    getText,
    getLabel,
    getMessage,
    getValidationMessage,
    language,
    metaInfo
  };
} 