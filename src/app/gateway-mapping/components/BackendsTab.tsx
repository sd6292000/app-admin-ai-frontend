import { useState, useContext } from "react";
import { Box, TextField, Typography, Grid, MenuItem, Paper, IconButton, Divider, Checkbox, FormControlLabel } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormData, FormConfigContext } from "../page";

const protocols = [
  { label: "HTTP", value: "HTTP" },
  { label: "HTTPS", value: "HTTPS" },
];

const regions = [
  { label: "EU", value: "EU" },
  { label: "AS", value: "AS" },
  { label: "AM", value: "AM" },
];

const dataCenterOptions: Record<string, { label: string; value: string }[]> = {
  EU: [
    { label: "WK", value: "WK" },
    { label: "RH", value: "RH" },
  ],
  AS: [
    { label: "SDC", value: "SDC" },
    { label: "TDC", value: "TDC" },
  ],
  AM: [
    { label: "PSC", value: "PSC" },
  ],
};

function BackendForm({ idx, backend, handleChange }: { idx: number; backend: any; handleChange: (idx: number, field: string, value: any) => void }) {
  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(idx, "region", e.target.value);
  };
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={4}>
        <TextField label="Hostname" fullWidth required value={backend.hostname} onChange={e => handleChange(idx, "hostname", e.target.value)} />
      </Grid>
      <Grid item xs={2}>
        <TextField 
          label="Port" 
          type="number" 
          fullWidth 
          required 
          inputProps={{ min: 0, max: 65535 }}
          helperText="0-65535"
          value={backend.port}
          onChange={e => handleChange(idx, "port", e.target.value)}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField select label="Protocol" fullWidth required value={backend.protocol} onChange={e => handleChange(idx, "protocol", e.target.value)}>
          {protocols.map((item) => (
            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={2}>
        <TextField select label="Region" fullWidth required value={backend.region} onChange={handleRegionChange}>
          {regions.map((item) => (
            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={2}>
        <TextField select label="Data Center" fullWidth required value={backend.dataCenter} onChange={e => handleChange(idx, "dataCenter", e.target.value)}>
          {(dataCenterOptions[backend.region] || []).map((item) => (
            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
}

export default function BackendsTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useContext(FormConfigContext);
  if (!formConfig) return null;
  const { labels, options, validation } = formConfig.backends || {};

  // 初始化backends数组
  const backends = formData.backends && formData.backends.length > 0 ? formData.backends : [{ hostname: "", port: "", protocol: "", region: "", dataCenter: "", enabled: true, rewriteHost: false, webProxyEnabled: false, proxyHost: "", proxyPort: "", proxyUsername: "", proxyPassword: "" }];

  const handleChange = (idx: number, field: string, value: any) => {
    const arr = [...backends];
    arr[idx][field] = value;
    if (field === "region") arr[idx]["dataCenter"] = "";
    if (field === "webProxyEnabled" && !value) {
      arr[idx].proxyHost = "";
      arr[idx].proxyPort = "";
      arr[idx].proxyUsername = "";
      arr[idx].proxyPassword = "";
    }
    setFormData((prev: any) => ({ ...prev, backends: arr }));
  };

  const handleAdd = () => {
    setFormData((prev: any) => ({ ...prev, backends: [...backends, { hostname: "", port: "", protocol: "", region: "", dataCenter: "", enabled: true, rewriteHost: false, webProxyEnabled: false, proxyHost: "", proxyPort: "", proxyUsername: "", proxyPassword: "" }] }));
  };

  const handleRemove = (idx: number) => {
    const arr = [...backends];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({ ...prev, backends: arr.length ? arr : [{ hostname: "", port: "", protocol: "", region: "", dataCenter: "", enabled: true, rewriteHost: false, webProxyEnabled: false, proxyHost: "", proxyPort: "", proxyUsername: "", proxyPassword: "" }] }));
  };

  return (
    <Box>
      {backends.map((backend, idx) => (
        <Paper key={idx} elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, position: 'relative' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>Backend #{idx + 1}</Typography>
            {backends.length > 1 && (
              <IconButton color="error" onClick={() => handleRemove(idx)} sx={{ position: 'absolute', top: 12, right: 12 }}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>基本信息</Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12}>
              <TextField label={labels?.hostname || "Hostname"} required fullWidth value={backend.hostname} onChange={e => handleChange(idx, "hostname", e.target.value)} InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={labels?.port || "Port"} type="number" required fullWidth value={backend.port} onChange={e => handleChange(idx, "port", e.target.value)} inputProps={{ min: validation?.port?.min ?? 0, max: validation?.port?.max ?? 65535 }} helperText={`${validation?.port?.min ?? 0}-${validation?.port?.max ?? 65535}`} InputLabelProps={{ sx: { fontWeight: 600 } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select label={labels?.protocol || "Protocol"} required fullWidth value={backend.protocol} onChange={e => handleChange(idx, "protocol", e.target.value)} InputLabelProps={{ sx: { fontWeight: 600 } }}>
                {(options?.protocol || []).map((item: any) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select label={labels?.region || "Region"} required fullWidth value={backend.region} onChange={e => handleChange(idx, "region", e.target.value)} InputLabelProps={{ sx: { fontWeight: 600 } }}>
                {(options?.region || []).map((item: any) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select label={labels?.dataCenter || "Data Center"} required fullWidth value={backend.dataCenter} onChange={e => handleChange(idx, "dataCenter", e.target.value)} InputLabelProps={{ sx: { fontWeight: 600 } }}>
                {(options?.dataCenter?.[backend.region] || []).map((item: any) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Box mt={3} mb={2}>
            <FormControlLabel
              control={<Checkbox checked={!!backend.enabled} onChange={e => handleChange(idx, "enabled", e.target.checked)} />}
              label={<Typography fontWeight={600}>Enable</Typography>}
              sx={{ mr: 4 }}
            />
            <FormControlLabel
              control={<Checkbox checked={!!backend.rewriteHost} onChange={e => handleChange(idx, "rewriteHost", e.target.checked)} />}
              label={<Typography fontWeight={600}>Rewrite Host</Typography>}
            />
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>代理设置</Typography>
          <Box bgcolor="grey.100" p={3} borderRadius={2} mb={2}>
            <FormControlLabel
              control={<Checkbox checked={!!backend.webProxyEnabled} onChange={e => handleChange(idx, "webProxyEnabled", e.target.checked)} />}
              label={<Typography fontWeight={600}>Enable Web Proxy</Typography>}
            />
            {backend.webProxyEnabled && (
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} md={6}>
                  <TextField label="Proxy Host" fullWidth value={backend.proxyHost} onChange={e => handleChange(idx, "proxyHost", e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Proxy Port" type="number" fullWidth value={backend.proxyPort} onChange={e => handleChange(idx, "proxyPort", e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Proxy Username" fullWidth value={backend.proxyUsername} onChange={e => handleChange(idx, "proxyUsername", e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Proxy Password" type="password" fullWidth value={backend.proxyPassword} onChange={e => handleChange(idx, "proxyPassword", e.target.value)} />
                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={handleAdd} sx={{ fontSize: 32 }}><AddCircleOutlineIcon fontSize="inherit" /></IconButton>
      </Box>
    </Box>
  );
} 