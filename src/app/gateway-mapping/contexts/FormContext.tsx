"use client";
import React, { createContext, useContext } from "react";

// 表单数据类型
export type FormDataType = {
  basic: any;
  backends: any[];
  cookies: any;
  headers: any;
  responseBodyDecorator: any[];
  limiters: any;
};

// FormDataContext
export const FormDataContext = createContext<{
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
} | null>(null);

// FormConfigContext
export const FormConfigContext = createContext<any>(null);

// 自定义Hook
export const useFormData = () => {
  const ctx = useContext(FormDataContext);
  if (!ctx) throw new Error("FormDataContext not found");
  return ctx;
};

export const useFormConfig = () => {
  const ctx = useContext(FormConfigContext);
  // 允许返回null，让组件自己处理
  return ctx;
}; 