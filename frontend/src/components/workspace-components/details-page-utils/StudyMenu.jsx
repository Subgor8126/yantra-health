import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Stack,
  Button,
  Collapse,
  Grid,
  Menu,
  MenuItem,
  Tooltip
} from "@mui/material";
import { formatDate } from "../table-utils/formatHelpers";
import DeleteIcon from "@mui/icons-material/Delete";
import GridViewIcon from "@mui/icons-material/GridView";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuthCustom } from "../../../hooks/useAuthCustom";
import { useDispatch } from "react-redux";
import { triggerRefresh } from "../../../redux/slices/dicomDataSlice";
import { setSnackbar } from "../../../redux/slices/snackbarSlice";
import handleDicomDelete from "../table-utils/handleDicomDelete";
import { UploadButton } from "../table-utils";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { removeLSItemsByPrefix } from "../table-utils";
import LabelValueRow from "./LabelValueRow";

const handleViewInOHIF = async (studyUid) => {
     const ohifViewerUrl = `${import.meta.env.VITE_OHIF_URL}/viewer?StudyInstanceUIDs=${studyUid}`;
     console.log("OHIF Viewer URL:", ohifViewerUrl);
     // Open OHIF Viewer in a new tab
     window.open(ohifViewerUrl, "_blank");
};

export default function StudyMenu({study}) {

  console.log('Studies in StudyMenu: '+ study)

  // Custom hook to get authentication details
  const auth = useAuthCustom();
  // const userId = auth.userId;
  const token = auth.tokens?.access_token
  
  // Redux dispatch function for managing global state
  const dispatch = useDispatch();

  // Custom hook for handling file uploads
  // This hook manages the upload state and provides a function to handle DICOM uploads
  const { handleDicomUpload, uploading, uploadingStudy } = useFileUpload();
   
  // UI States
  // State for managing the expanded state of studies and the menu anchor element
  const [expandedStudy, setExpandedStudy] = useState(null);

  // State for managing the anchor element of the menu
  // This is used to control the visibility of the upload menu
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Function to handle the confirmation and deletion of a study
  // This function prompts the user for confirmation before deleting a study
  const handleConfirmStudyDelete = async (event, study_instance_uid) => {
    event.stopPropagation();
  
    const confirmDelete = window.confirm("Are you sure you want to delete this study?");
    if (!confirmDelete) {
      return; // Cancel the deletion if the user says no
    }
  
    console.log("study_instance_uid in handleConfirmStudyDelete:", study_instance_uid);
  
    dispatch(setSnackbar({
      open: true,
      message: 'Deleting Selected Study',
      severity: "info"
    }));
  
    try {
      const deleteResponse = await handleDicomDelete({token: token, studyInstanceUid: study_instance_uid});
  
      if (deleteResponse instanceof Error) {
        dispatch(setSnackbar({
          open: true,
          message: deleteResponse.message || "Failed to delete study.",
          severity: "error"
        }));
      } else {
        const { S3FilesDeleted, DeleteText, message } = deleteResponse;
  
        const successMessage =
          DeleteText ||
          (S3FilesDeleted
            ? "Study and related files deleted successfully."
            : "Study deleted, but no DICOM files were present in S3.");
  
        dispatch(setSnackbar({
          open: true,
          message: successMessage,
          severity: "success"
        }));
  
        // localStorage.removeItem('patientData');
        // localStorage.removeItem('statsData');
        // localStorage.removeItem('studyData');
      }
      dispatch(triggerRefresh()); // Trigger a refresh of the data
    } catch (error) {
      dispatch(setSnackbar({
        open: true,
        message: error.message || "Unexpected error during deletion.",
        severity: "error"
      }));
    }
  };  

  // Function to handle refreshing studies
  const handleRefreshStudies = () => {
    removeLSItemsByPrefix('studyData');
    dispatch(triggerRefresh()); // or use a specific slice action
  };
  

  return (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "#001A48",
        px: 3,
        py: 4,
        height: "460px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            px: 1,
          }}
        >
          {/* Left: Title */}
          <Typography
            sx={{
              color: "white",
              fontSize: { xs: "1.2rem", md: "2rem" },
              fontWeight: 600,
            }}
          >
            Studies
          </Typography>

          {/* Right: Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Refresh Studies" arrow>
              <IconButton
                onClick={handleRefreshStudies}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            {!auth?.isGuest && <Tooltip title="Upload DICOM Files" arrow>
              <Button
                onClick={handleOpenMenu}
                sx={{
                  backgroundColor: "#fc3003",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#ff5733",
                  },
                }}
              >
                <CloudUploadIcon />
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "white",
                    color: "white",
                    borderRadius: "40px 40px 10px 40px",
                    boxShadow: 3,
                  },
                }}
              >
                <MenuItem disableRipple>
                  <UploadButton
                    isStudy={true}
                    uploading={uploadingStudy}
                    onUpload={handleDicomUpload}
                    sx={{
                      backgroundColor: "#fc3003",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#ff5733",
                      },
                    }}
                  />
                </MenuItem>
                <MenuItem disableRipple>
                  <UploadButton
                    isStudy={false}
                    uploading={uploading}
                    onUpload={handleDicomUpload}
                    sx={{
                      backgroundColor: "#fc3003",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#ff5733",
                      },
                    }}
                  />
                </MenuItem>
              </Menu>
            </Tooltip>}
          </Box>
        </Box>


        {/* Scrollable Study List */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            pr: 1,
          }}
        >
          {study.map((studyItem) => {
            {/* Single Study Card */}
            return (
              <Box
                key={studyItem.study_instance_uid} // Added key prop here
                sx={{
                  borderRadius: 5,
                  bgcolor: "#fefefe",
                  px: 3,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  mb: 2,
                  boxShadow: 3,
                }}
              >
              {/* Top Row */}
              <Box
                sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                }}
              >
                <Box>
                <Typography variant="h6" color="black">
                  {formatDate(studyItem["study_date"]) || "Unknown Date"}
                </Typography>
                <Typography variant="body2" color="black">
                  {studyItem["StudyTime"] || studyItem["study_time"] || "Unknown Time"}
                </Typography>
                </Box>

                {/* Buttons */}
                <Stack direction="row" sx={{ spacing: { xs: 2, sm: 1 } }} mt={3}>
                {!auth?.isGuest && <Tooltip title="Delete Study" arrow>
                  <IconButton
                  onClick={(event) => handleConfirmStudyDelete(event, studyItem.study_instance_uid)}
                  >
                  <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>}

                <Tooltip title="View in OHIF Viewer" arrow>
                  <IconButton
                  onClick={() => handleViewInOHIF(studyItem["study_instance_uid"])}
                  sx={{
                    color: "#00bcd4",
                    height: 40,
                    width: 40,
                    borderRadius: "50%",
                    "&:hover": {
                    backgroundColor: "#0B1073",
                    },
                  }}
                  >
                  <GridViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Expand Study Details" arrow>
                  <IconButton
                  onClick={() =>
                    setExpandedStudy((prev) =>
                    prev === studyItem.study_instance_uid ? null : studyItem.study_instance_uid
                    )
                  }
                  >
                  {expandedStudy === studyItem.study_instance_uid ? (
                    <RemoveCircleIcon color="secondary" />
                  ) : (
                    <AddCircleIcon color="secondary" />
                  )}
                  </IconButton>
                </Tooltip>
                </Stack>
              </Box>

              {/* Expanded Info */}
              <Collapse in={expandedStudy === studyItem.study_instance_uid}>
                <Box mt={2}>
                <Grid container spacing={2}>
                  {/* Left Column */}
                  <Grid item xs={12} sm={6}>
                  <LabelValueRow label="Study UID:" value={studyItem["study_instance_uid"] || "Unknown"} maxLength={30}/>
                  <LabelValueRow label="Accession #:" value={studyItem["accession_number"] || "Unknown"} />
                  <LabelValueRow label="Description:" value={studyItem["study_description"] || "Unknown"} />
                  <LabelValueRow label="Institution:" value={studyItem["institution_name"] || "Unknown"} />
                  <LabelValueRow label="Ref. Physician:" value={studyItem["referring_physician_name"] || "Unknown"} />
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} sm={6}>
                  <LabelValueRow label="Study ID:" value={studyItem["study_id"] || "Unknown"} />
                  <LabelValueRow label="Modalities:" value={studyItem["modality"] || "Unknown"} />
                  <LabelValueRow
                    label="Study Size:"
                    value={
                    studyItem["total_study_size_bytes"]
                      ? `${(studyItem["total_study_size_bytes"] / (1024 * 1024)).toFixed(2)} MB`
                      : "Unknown Size"
                    }
                  />
                  <LabelValueRow
                    label="# Of Series:"
                    value={studyItem?.number_of_series || 0}
                  />
                  <LabelValueRow
                    label="# Of Instances:"
                    value={studyItem?.number_of_instances || 0}
                  />
                  </Grid>
                </Grid>
                </Box>
              </Collapse>
              </Box>
            );})}
        </Box>
      </CardContent>
    </Card>
  );
}