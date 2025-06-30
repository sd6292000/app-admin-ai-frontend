"use client";
import { useFormData, useFormConfig } from "../contexts/FormContext";
import { Box, TextField, MenuItem, Typography, Divider, Grid, Paper, Alert } from "@mui/material";

export default function BasicTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useFormConfig();
  
  const { labels, options } = formConfig.basic || {};

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      basic: { ...prev.basic, [field]: value }
    }));
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>Basic Information</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label={<b>{labels?.domain || "Domain"} *</b>}
            required
            fullWidth
            value={formData.basic?.domain || ""}
            onChange={e => handleChange("domain", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label={<b>{labels?.requestPathPattern || "Request Path Pattern"} *</b>}
            required
            fullWidth
            value={formData.basic?.requestPathPattern || ""}
            onChange={e => handleChange("requestPathPattern", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label={<b>{labels?.backendForwardPath || "Backend Forward Path"} *</b>}
            required
            fullWidth
            value={formData.basic?.backendForwardPath || ""}
            onChange={e => handleChange("backendForwardPath", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            label={<b>{labels?.cmdbProject || "CMDB Project"} *</b>}
            required
            fullWidth
            value={formData.basic?.cmdbProject || ""}
            onChange={e => handleChange("cmdbProject", e.target.value)}
          >
            {(options?.cmdbProject || []).map((item: any) => (
              <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Alert severity="info" sx={{ mt: 2 }}>{labels?.uniqueTip || "Domain + Path Pattern must be unique."}</Alert>
    </Paper>
  );
} 