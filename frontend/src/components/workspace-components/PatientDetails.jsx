import React from 'react';
import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { formatName, formatDate, formatAge } from './table-utils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Chip,
  Paper,
  IconButton,
  Link
} from '@mui/material';
import { 
  Person, 
  CalendarToday, 
  Description, 
  Fingerprint, 
  Wc, 
  Image, 
  Numbers, 
  OpenInNew, 
  ArrowBack,
  FileCopy
} from '@mui/icons-material';
import { XrayIcon } from './details_page_utils/XrayIcon';
import { useAuthCustom } from '../../hooks/useAuthCustom';

const PatientDetails = () => {
  const { patientId } = useParams();
  const patientData = useSelector((state) => state.patient.patient);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const auth = useAuthCustom();
  const userId = auth.userId

  const handleViewInOHIF = async () => {
    // Placeholder for OHIF viewer navigation
    console.log("Opening file in OHIF viewer:", patientData?.FileKey);
    // This would eventually route to your OHIF viewer with the appropriate parameters
    // window.open(`/ohif-viewer?fileKey=${encodeURIComponent(patientData.FileKey)}`, '_blank');

    // const response = await fetch(`${API_BASE_URL}/api/get-ohif-response?fileKey=${patientData?.FileKey}`, {
    //   method: 'GET'
    // });
    // console.log("response ist hier")

    // if (!response.ok) {
    //   throw new Error(`HTTP error! Status: ${response.status}`);
    // }

    // console.log("sparks")

    // console.log(response['pre_signed_url'])

    // const { pre_signed_url } = await response.json(); // Parse JSON first!

    //  const JsonResponseUrl = encodeURIComponent(`${API_BASE_URL}/api/get-ohif-response?fileKey=${patientData?.FileKey}&userId=${userId}`);
    // const JsonResponseUrl = encodeURIComponent('https://yantra-healthcare-imaging.s3.amazonaws.com/04989458-2081-70ba-7740-7ec9c9f34b66/8155012288/2-1.dcm?AWSAccessKeyId=AKIA6GBMICYNHJQZOPAV&Signature=uIwfvI3qM2p0mAL%2BDiNHQwJ85kc%3D&Expires=1742540396');

     // Construct OHIF Viewer URL using `wadouri:` to indicate raw DICOM file
     const ohifViewerUrl = `http://localhost:3000/viewer?StudyInstanceUIDs=${patientData?.StudyInstanceUID}`;

     console.log("OHIF Viewer URL:", ohifViewerUrl);

     // Open OHIF Viewer in a new tab
     window.open(ohifViewerUrl, "_blank");
  };

  // const handleGoBack = () => {
  //   const navigate = useNavigate();
  //   // Placeholder for navigation
  //   console.log("Navigating back to patient list");
  //   // history.goBack() or use your router's navigation
  // };

  const handleFilePathClick = () => {
    // Placeholder for file path click handler
    console.log("File path clicked:", patientData?.FileKey);
    // This would eventually do something with the file path
  };

  // If no patient data is found, show a simple message
  if (!patientData) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Patient Details
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Patient ID: {patientId}</Typography>
          <Typography color="error">No patient data found.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mx: 'auto', background: 'linear-gradient(90deg, #300030, #440044, #660033)', height: '100vh' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: "white" }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Patient Details
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<OpenInNew />}
            onClick={handleViewInOHIF}
            disabled={!patientData?.FileKey}
            sx={{ ml: 'auto' }}  // Pushes the button to the right
          >
            Open in OHIF Viewer
          </Button>
        </Box>

      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1 }} />
            <Typography variant="h6">
              {formatName(patientData.PatientName)}
            </Typography>
          </Box>
          <Chip 
            label={patientData.Modality || 'Unknown'} 
            color="secondary" 
            size="small"
          />
        </Box>

        <Grid container spacing={3} sx={{ p: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Patient Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Fingerprint fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Patient ID
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.PatientID || patientId || 'Not Available'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Wc fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Sex
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.PatientSex === 'M' ? 'Male' : 
                       patientData.PatientSex === 'F' ? 'Female' : 
                       patientData.PatientSex || 'Not Available'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Wc fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Age
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {formatAge(patientData.PatientAge)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Numbers fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Accession Number
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.AccessionNumber}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Numbers fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Referring Physician
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {formatName(patientData.ReferringPhysicianName)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Study Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Description fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Study Description
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.StudyDescription || 'Not Available'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Study Date
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {formatDate(patientData.StudyDate)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {/* <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> */}
                      <XrayIcon fontSize="small" color="text.secondary" />
                      <Typography variant="body2" color="text.secondary">
                          &nbsp;Body Part Examined
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.BodyPartExamined}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Image fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Instance Number
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.InstanceNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Numbers fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Series Number
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.SeriesNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Fingerprint fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Study ID
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData.StudyID || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        
      </Box> */}
    </Box>
  );
};

export default PatientDetails;

// import { useParams } from "react-router-dom";
// import { useSelector } from "react-redux";

// const PatientDetails = () => {
//   const { patientId } = useParams();
//   const patientData = useSelector((state) => state.patient.patient);

//   return (
//     <div>
//       <h1>Patient Details</h1>
//       <p>Patient ID: {patientId}</p>
//       {patientData ? (
//         <pre>{JSON.stringify(patientData, null, 2)}</pre>
//       ) : (
//         <p>No patient data found.</p>
//       )}
//     </div>
//   );
// };


// export default PatientDetails;