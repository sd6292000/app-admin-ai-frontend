"use client";
import { useState, useContext } from "react";
import { Box, TextField, Typography, MenuItem, Checkbox, FormControlLabel, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useFormData, useFormConfig } from "../contexts/FormContext";

const methods = ["GET", "POST", "PUT", "DELETE"];
const modeOptions = [
  { label: "Allow", value: "allow" },
  { label: "Deny", value: "deny" },
];

type IpRule = { value: string; mode: string; error: string };

function isValidIPv4OrCIDR(value: string) {
  // IPv4: 1.1.1.1
  // IPv4 CIDR: 1.1.1.1/24
  const ipv4 = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const cidr = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}\/(3[0-2]|[12]?\d)$/;
  return ipv4.test(value) || cidr.test(value);
}

export default function LimitersTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useFormConfig();
  if (!formConfig) return null;
  const { labels, options } = formConfig.limiters || {};

  // 初始化
  const ipRules: IpRule[] = formData.limiters?.ipRules?.length > 0 ? formData.limiters.ipRules : [{ value: "", mode: "allow", error: "" }];
  const maxConcurrent = formData.limiters?.maxConcurrent || "";
  const maxPerMinute = formData.limiters?.maxPerMinute || "";
  const allowedMethods: string[] = formData.limiters?.allowedMethods || [];

  const handleIpRuleChange = (idx: number, field: keyof IpRule, value: string) => {
    const rules = [...ipRules];
    rules[idx][field] = value;
    if (field === "value") {
      rules[idx].error = value && !isValidIPv4OrCIDR(value) ? "Invalid IPv4 or CIDR" : "";
    }
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, ipRules: rules }
    }));
  };

  const handleAddIpRule = () => {
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, ipRules: [...ipRules, { value: "", mode: "allow", error: "" }] }
    }));
  };

  const handleRemoveIpRule = (idx: number) => {
    const rules = [...ipRules];
    rules.splice(idx, 1);
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, ipRules: rules.length ? rules : [{ value: "", mode: "allow", error: "" }] }
    }));
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, [field]: value }
    }));
  };

  const handleMethodChange = (method: string, checked: boolean) => {
    const newMethods = checked ? [...allowedMethods, method] : allowedMethods.filter(v => v !== method);
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, allowedMethods: newMethods }
    }));
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>{labels?.ipRule || "Access Limiters"}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2">{labels?.ipRule || "IP/Subnet Rules"}</Typography>
      {ipRules.map((rule, idx) => (
        <Box key={idx} display="flex" gap={2} alignItems="center" mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
          <TextField
            label={labels?.ipOrCidr || "IP or CIDR"}
            required
            value={rule.value}
            error={!!rule.error}
            helperText={rule.error || "IPv4 or IPv4/CIDR, e.g. 1.1.1.1 or 1.1.1.1/24"}
            onChange={e => handleIpRuleChange(idx, "value", e.target.value)}
          />
          <TextField
            select
            label={labels?.mode || "Mode"}
            required
            sx={{ width: 120 }}
            value={rule.mode}
            onChange={e => handleIpRuleChange(idx, "mode", e.target.value)}
          >
            {modeOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          {ipRules.length > 1 && (
            <IconButton color="error" onClick={() => handleRemoveIpRule(idx)}><RemoveCircleOutlineIcon /></IconButton>
          )}
        </Box>
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={handleAddIpRule}><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Divider sx={{ my: 2 }} />
      <TextField label={labels?.maxConcurrent || "Max Concurrent"} type="number" fullWidth value={maxConcurrent} onChange={e => handleFieldChange("maxConcurrent", e.target.value)} />
      <TextField label={labels?.maxPerMinute || "Max Calls Per Minute"} type="number" fullWidth value={maxPerMinute} onChange={e => handleFieldChange("maxPerMinute", e.target.value)} />
      <Box>
        <Typography variant="subtitle2">{labels?.allowedMethods || "Allowed Methods"}</Typography>
        {methods.map((m) => (
          <FormControlLabel
            key={m}
            control={
              <Checkbox
                checked={allowedMethods.includes(m)}
                onChange={e => handleMethodChange(m, e.target.checked)}
              />
            }
            label={m}
          />
        ))}
      </Box>
      <Alert severity="info" sx={{ mt: 2 }}>{labels?.atLeastOne || "At least one limiter must be set."}</Alert>
    </Paper>
  );
} 