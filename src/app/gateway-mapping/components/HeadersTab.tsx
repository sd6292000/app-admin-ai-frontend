import { useState, useContext } from "react";
import { Box, TextField, Typography, Checkbox, FormControlLabel, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useFormData, FormConfigContext } from "../page";

export default function HeadersTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useContext(FormConfigContext);
  if (!formConfig) return null;
  const { labels } = formConfig.headers || {};

  // 初始化
  const requestHeaders = formData.headers?.request || [{ name: "", value: "", override: false }];
  const responseHeaders = formData.headers?.response || [{ name: "", value: "", override: false }];

  const handleHeaderChange = (type: "request" | "response", idx: number, field: "name" | "value" | "override", value: any) => {
    const headers = type === "request" ? [...requestHeaders] : [...responseHeaders];
    headers[idx][field] = value;
    setFormData((prev: any) => ({
      ...prev,
      headers: {
        ...prev.headers,
        [type]: headers
      }
    }));
  };

  const handleAddHeader = (type: "request" | "response") => {
    if (type === "request") {
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          request: [...requestHeaders, { name: "", value: "", override: false }]
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          response: [...responseHeaders, { name: "", value: "", override: false }]
        }
      }));
    }
  };

  const handleRemoveHeader = (type: "request" | "response", idx: number) => {
    if (type === "request") {
      const headers = [...requestHeaders];
      headers.splice(idx, 1);
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          request: headers.length ? headers : [{ name: "", value: "", override: false }]
        }
      }));
    } else {
      const headers = [...responseHeaders];
      headers.splice(idx, 1);
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          response: headers.length ? headers : [{ name: "", value: "", override: false }]
        }
      }));
    }
  };

  function HeaderForm({ type, idx, header, onChange, onRemove, showRemove }: {
    type: "request" | "response";
    idx: number;
    header: { name: string; value: string; override: boolean };
    onChange: (field: "name" | "value" | "override", value: any) => void;
    onRemove: () => void;
    showRemove: boolean;
  }) {
    return (
      <Box display="flex" gap={2} alignItems="center" mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
        <TextField
          label={labels?.name || "Name"}
          required
          value={header.name}
          onChange={e => onChange("name", e.target.value)}
        />
        <TextField
          label={labels?.value || "Value"}
          required
          value={header.value}
          onChange={e => onChange("value", e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={header.override}
              onChange={e => onChange("override", e.target.checked)}
            />
          }
          label={labels?.override || "Override"}
        />
        {showRemove && (
          <IconButton color="error" onClick={onRemove}><RemoveCircleOutlineIcon /></IconButton>
        )}
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>Headers</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2">{labels?.request || "Request Headers"}</Typography>
      {requestHeaders.map((header, idx) => (
        <HeaderForm
          key={idx}
          type="request"
          idx={idx}
          header={header}
          onChange={(field, value) => handleHeaderChange("request", idx, field, value)}
          onRemove={() => handleRemoveHeader("request", idx)}
          showRemove={requestHeaders.length > 1}
        />
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={() => handleAddHeader("request") }><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">{labels?.response || "Response Headers"}</Typography>
      {responseHeaders.map((header, idx) => (
        <HeaderForm
          key={idx}
          type="response"
          idx={idx}
          header={header}
          onChange={(field, value) => handleHeaderChange("response", idx, field, value)}
          onRemove={() => handleRemoveHeader("response", idx)}
          showRemove={responseHeaders.length > 1}
        />
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={() => handleAddHeader("response") }><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Alert severity="info" sx={{ mt: 2 }}>{labels?.addRequest || "You can add/remove request and response headers."}</Alert>
    </Paper>
  );
} 