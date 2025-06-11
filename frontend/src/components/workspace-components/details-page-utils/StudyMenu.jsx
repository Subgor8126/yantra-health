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

export default function StudyMenu({ study }) {

  // Custom hook to get authentication details
  const auth = useAuthCustom();
  const userId = auth.userId;
  
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
  const handleConfirmStudyDelete = async (event, userId, fileKey) => {
    event.stopPropagation();
  
    const confirmDelete = window.confirm("Are you sure you want to delete this study?");
    if (!confirmDelete) {
      return; // Cancel the deletion if the user says no
    }
  
    console.log("FileKey in handleConfirmStudyDelete:", fileKey);
  
    dispatch(setSnackbar({
      open: true,
      message: 'Deleting Selected Study',
      severity: "info"
    }));
  
    try {
      const deleteResponse = await handleDicomDelete(userId, fileKey, "study");
  
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
  

  // study = [
  //   {
  //     StudyDate: "19980505",
  //     StudyTime: "101037",
  //     StudyInstanceUID: "2.25.259822456388234982374",
  //     AccessionNumber: "19610729ES32433",
  //     StudyDescription: "Chest CT Scan",
  //     InstitutionName: "Daniels, Fowler & Co.",
  //     ReferringPhysicianName: "WILLIAM HAAS",
  //     ModalitiesInStudy: "CT, MR, OT",
  //     expandedStudy: false,
  //   },
  //   {
  //     StudyDate: "20120712",
  //     StudyTime: "143156",
  //     StudyInstanceUID: "2.25.899112983712738481001",
  //     AccessionNumber: "8134983",
  //     StudyDescription: "Abdomen MRI",
  //     InstitutionName: "NeuroMed Imaging",
  //     ReferringPhysicianName: "DR. ASHLEY KIM",
  //     ModalitiesInStudy: "MR, OT",
  //     expandedStudy: false,
  //   },
  //   {
  //     StudyDate: "20150905",
  //     StudyTime: "191156",
  //     StudyInstanceUID: "2.25.913829102398471264001",
  //     AccessionNumber: "11235813",
  //     StudyDescription: "Head PET-CT",
  //     InstitutionName: "FusionScan Ltd.",
  //     ReferringPhysicianName: "DR. LUIS MENDOZA",
  //     ModalitiesInStudy: "PET, CT",
  //     expandedStudy: false,
  //     SeriesInstanceUIDList: [
  //       "2.25.207506439191056754055271263682522889718",
  //       "2.25.266330404550956556941727606810649148918"
  //     ]
  //   }
  // ];

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
            
            <Tooltip title="Upload DICOM Files" arrow>
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
            </Tooltip>
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
          {study.map((study) => {
            {/* Single Study Card */}
            return (
              <Box
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
                  {formatDate(study["StudyDate"]) || "Unknown Date"}
                </Typography>
                <Typography variant="body2" color="black">
                  {study["StudyTime"] || "Unknown Time"}
                </Typography>
                </Box>

                {/* Buttons */}
                <Stack direction="row" sx={{ spacing: { xs: 2, sm: 1 } }} mt={3}>
                <Tooltip title="Delete Study" arrow>
                  <IconButton
                  onClick={(event) => handleConfirmStudyDelete(event, userId, study["FileKey"])}
                  >
                  <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="View in OHIF Viewer" arrow>
                  <IconButton
                  onClick={() => handleViewInOHIF(study["StudyInstanceUID"])}
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
                    prev === study.StudyInstanceUID ? null : study.StudyInstanceUID
                    )
                  }
                  >
                  {expandedStudy === study.StudyInstanceUID ? (
                    <RemoveCircleIcon color="secondary" />
                  ) : (
                    <AddCircleIcon color="secondary" />
                  )}
                  </IconButton>
                </Tooltip>
                </Stack>
              </Box>

              {/* Expanded Info */}
              <Collapse in={expandedStudy === study.StudyInstanceUID}>
                <Box mt={2}>
                <Grid container spacing={2}>
                  {/* Left Column */}
                  <Grid item xs={12} sm={6}>
                  <LabelValueRow label="Study UID:" value={study["StudyInstanceUID"]} maxLength={30}/>
                  <LabelValueRow label="Accession #:" value={study["AccessionNumber"]} />
                  <LabelValueRow label="Description:" value={study["StudyDescription"]} />
                  <LabelValueRow label="Institution:" value={study["InstitutionName"]} />
                  <LabelValueRow label="Ref. Physician:" value={study["ReferringPhysicianName"]} />
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} sm={6}>
                  <LabelValueRow label="Study ID:" value={study["StudyID"] || "Unknown"} />
                  <LabelValueRow label="Modalities:" value={study["Modality"] || "Unknown"} />
                  <LabelValueRow
                    label="Study Size:"
                    value={
                    study["TotalStudySizeBytes"]
                      ? `${(study["TotalStudySizeBytes"] / (1024 * 1024)).toFixed(2)} MB`
                      : "Unknown Size"
                    }
                  />
                  <LabelValueRow
                    label="# Of Series:"
                    value={study?.SeriesInstanceUIDList?.length || 0}
                  />
                  <LabelValueRow
                    label="# Of Instances:"
                    value={study?.SOPInstanceUIDList?.length || 0}
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