import React from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadButton = ({ 
  isStudy = false, 
  uploading = false,
  onUpload,
  sx = {}
}) => {
  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<CloudUploadIcon />}
      sx={{
        "@keyframes gradientShift": {
          "0%": { backgroundPositionX: "100%" },
          "100%": { backgroundPositionX: "0%" }
        },
        background: uploading
          ? "linear-gradient(270deg, #fc3003, rgb(0, 89, 255), rgb(15, 1, 92), #fc3003)" // seamless loop by repeating start color
          : "#fc3003",
        backgroundSize: "300% 100%",
        backgroundRepeat: "repeat",
        animation: uploading ? "gradientShift 1s linear infinite" : "none",
        willChange: uploading ? "background-position" : "auto",
        transition: "background 0.2s ease-in-out",
        "&:hover": {
          background: "linear-gradient(270deg, #fc3003, rgb(0, 89, 255))"
        },
        ml: 1,
        ...sx // Allow custom styling to be passed in
      }}        
    >
      {uploading ? "Uploading..." : isStudy ? "Upload Study" : "Upload Files"}
      <input
        type="file"
        {...(isStudy ? { webkitdirectory: "true", directory: "true" } : {})}
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files);
          if (files.length > 0) {
            onUpload(files, isStudy);
            event.target.value = null; // Reset input
          }
        }}
      />
    </Button>
  );
};

export default UploadButton;