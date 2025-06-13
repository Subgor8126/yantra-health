import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import { formatName } from "../table-utils";
import PersonIcon from '@mui/icons-material/Person';

export default function HeaderBar({ patientName }) {

    const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: "#660033", // your Figma maroon
        borderRadius: 3,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        color: "white",
      }}
    >
      <IconButton sx={{ color: "white" }} onClick = {() => navigate(-1)}>
        <ArrowBackIosNewIcon />
      </IconButton>
      <PersonIcon sx={{ fontSize: 40, color: "white" }} />
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {patientName ? formatName(patientName) : "Patient Name Not Available"}
      </Typography>
    </Box>
  );
}
