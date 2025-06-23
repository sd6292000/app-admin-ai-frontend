import { useState, useContext } from "react";
import { Box, TextField, Typography, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useFormData, FormConfigContext } from "../page";

function isValidPagePath(value: string) {
  // 允许 /xxx 或 http(s)://xxx
  const uriPath = /^\/[\w\-./]*$/;
  const fullUrl = /^https?:\/\/[\w\-.:/?#\[\]@!$&'()*+,;=%]+$/;
  return uriPath.test(value) || fullUrl.test(value);
}

export default function ResponseBodyDecoratorTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useContext(FormConfigContext);
  if (!formConfig) return null;
  const { labels } = formConfig.responseBodyDecorator || {};

  // 初始化
  const mappings = formData.responseBodyDecorator?.length > 0 ? formData.responseBodyDecorator : [{ statusCode: "", pagePath: "", error: "" }];

  const handleChange = (idx: number, field: "statusCode" | "pagePath", value: string) => {
    const arr = [...mappings];
    arr[idx][field] = value;
    if (field === "pagePath") {
      arr[idx].error = value && !isValidPagePath(value) ? "Must be URI Path or Full URL" : "";
    }
    setFormData((prev: any) => ({ ...prev, responseBodyDecorator: arr }));
  };

  const handleAdd = () => {
    setFormData((prev: any) => ({ ...prev, responseBodyDecorator: [...mappings, { statusCode: "", pagePath: "", error: "" }] }));
  };

  const handleRemove = (idx: number) => {
    const arr = [...mappings];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({ ...prev, responseBodyDecorator: arr.length ? arr : [{ statusCode: "", pagePath: "", error: "" }] }));
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>{labels?.errorPage || "Error Page Mapping"}</Typography>
      <Divider sx={{ mb: 2 }} />
      {mappings.map((item, idx) => (
        <Box key={idx} display="flex" gap={2} alignItems="center" mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
          <TextField
            label={labels?.statusCode || "Status Code"}
            type="number"
            required
            value={item.statusCode}
            onChange={e => handleChange(idx, "statusCode", e.target.value)}
          />
          <TextField
            label={labels?.pagePath || "Page Path"}
            required
            value={item.pagePath}
            error={!!item.error}
            helperText={item.error || "e.g. /404 or https://example.com/404"}
            onChange={e => handleChange(idx, "pagePath", e.target.value)}
          />
          {mappings.length > 1 && (
            <IconButton color="error" onClick={() => handleRemove(idx)}><RemoveCircleOutlineIcon /></IconButton>
          )}
        </Box>
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={handleAdd}><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Alert severity="info" sx={{ mt: 2 }}>{labels?.add || "Page Path must be a URI Path or Full URL."}</Alert>
    </Paper>
  );
} 