"use client";
import { useState, useContext } from "react";
import { Box, TextField, MenuItem, Typography, Checkbox, FormControlLabel, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useFormData, FormConfigContext } from "../page";

const strategies = [
  { label: "Passthrough", value: "passthrough" },
  { label: "Persist", value: "persist" },
];

// RFC6265 Cookie Name 校验正则
const rfc6265CookieName = /^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$/;

export default function CookiesTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useContext(FormConfigContext);
  if (!formConfig) return null;
  const { labels, options } = formConfig.cookies || {};

  // 初始化excludedCookies
  const excludedCookies = formData.cookies?.excludedCookies?.length > 0 ? formData.cookies.excludedCookies : [{ name: "", startedWith: false, error: "" }];
  const globalStrategy = formData.cookies?.globalStrategy || "";

  const handleGlobalStrategyChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      cookies: { ...prev.cookies, globalStrategy: value }
    }));
  };

  const handleExcludedChange = (idx: number, field: "name" | "startedWith", value: any) => {
    const arr = [...excludedCookies];
    if (field === "name") {
      arr[idx].name = value;
      arr[idx].error = value && !rfc6265CookieName.test(value) ? "Invalid Cookie Name (RFC6265)" : "";
    } else {
      arr[idx].startedWith = value;
    }
    setFormData((prev: any) => ({
      ...prev,
      cookies: { ...prev.cookies, excludedCookies: arr }
    }));
  };

  const handleAddExcluded = () => {
    setFormData((prev: any) => ({
      ...prev,
      cookies: { ...prev.cookies, excludedCookies: [...excludedCookies, { name: "", startedWith: false, error: "" }] }
    }));
  };

  const handleRemoveExcluded = (idx: number) => {
    const arr = [...excludedCookies];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({
      ...prev,
      cookies: { ...prev.cookies, excludedCookies: arr.length ? arr : [{ name: "", startedWith: false, error: "" }] }
    }));
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>Cookie Strategy</Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField
        select
        label={labels?.globalStrategy || "Global Cookie Strategy"}
        fullWidth
        value={globalStrategy}
        onChange={e => handleGlobalStrategyChange(e.target.value)}
      >
        {strategies.map((item) => (
          <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
        ))}
      </TextField>
      <Typography variant="subtitle2" mt={2}>{labels?.exception || "Excluded Cookies"}</Typography>
      {excludedCookies.map((cookie, idx) => (
        <Box key={idx} display="flex" gap={2} alignItems="center" mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
          <TextField
            label={labels?.cookieName || "Cookie Name"}
            value={cookie.name}
            error={!!cookie.error}
            helperText={cookie.error || "RFC6265: !#$%&'*+-.^_`|~0-9a-zA-Z"}
            onChange={e => handleExcludedChange(idx, "name", e.target.value)}
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={cookie.startedWith}
                onChange={e => handleExcludedChange(idx, "startedWith", e.target.checked)}
              />
            }
            label={labels?.startedWith || "Started With"}
          />
          {excludedCookies.length > 1 && (
            <IconButton color="error" onClick={() => handleRemoveExcluded(idx)}><RemoveCircleOutlineIcon /></IconButton>
          )}
        </Box>
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={handleAddExcluded}><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Alert severity="info" sx={{ mt: 2 }}>{labels?.rfcTip || "Cookie name must conform to RFC6265."}</Alert>
    </Paper>
  );
} 