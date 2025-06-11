import { Grid, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";

const LabelValueRow = ({ label, value = "", maxLength = 25 }) => {
  const [copied, setCopied] = useState(false);
  const isTooLong = value.length > maxLength;
  const displayValue = isTooLong ? value.slice(0, maxLength) + "…" : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <Grid container alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <Grid item xs={5}>
        <Typography variant="body2" fontWeight="bold" color="black">
          {label}
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <Tooltip title={isTooLong ? value : ""} arrow disableHoverListener={!isTooLong}>
          <Typography
            variant="body2"
            color="black"
            noWrap
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {displayValue || "—"}
          </Typography>
        </Tooltip>
      </Grid>

      <Grid item xs={1}>
        <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
          <IconButton onClick={handleCopy} size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export default LabelValueRow;