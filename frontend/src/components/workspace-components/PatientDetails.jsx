import React, { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from "react-router-dom";
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

const DICOM_TAGS = {
  PatientID: "00100020",
  PatientName: "00100010",
  PatientSex: "00100040",
  PatientAge: "00101010",
  Modality: "00080060",
  AccessionNumber: "00080050",
  BodyPartExamined: "00180015",
  StudyID: "00200010",
  SeriesNumber: "00200011",
  StudyDate: "00080020",
  StudyDescription: "00081030",
  ReferringPhysicianName: "00080090",
  BodyPartExamined: "00180015"
};

const PatientDetails = () => {
  const { patient_id } = useParams();
  const [searchParams] = useSearchParams();
  const fileKey = searchParams.get('fileKey');

  const patientData = useSelector((state) => state.patient.patient);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const auth = useAuthCustom();
  const userId = auth.userId

  let studyData = {};

  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/get-dicom-metadata?userId=${userId}&recordType=study&fileKey=${fileKey}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        studyData = await response.json();
        console.log("Fetched study data:", studyData);

      } catch (error) {
        console.error("Error fetching study data:", error);
      }
    };

    fetchStudyData();
    }, [patient_id, API_BASE_URL, userId]);

  const handleViewInOHIF = async () => {
     const ohifViewerUrl = `${import.meta.env.VITE_OHIF_URL}/viewer?StudyInstanceUIDs=${patientData?.StudyInstanceUID}`;
     console.log("OHIF Viewer URL:", ohifViewerUrl);
     // Open OHIF Viewer in a new tab
     window.open(ohifViewerUrl, "_blank");
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
          <Typography variant="h6">Patient ID: {patient_id}</Typography>
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
              {formatName(patientData[DICOM_TAGS.PatientName]) || 'Unknown Patient'}
            </Typography>
          </Box>
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
                      {patientData[DICOM_TAGS.PatientID] || patient_id || 'Not Available'}
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
                      {patientData[DICOM_TAGS.PatientSex] === 'M' ? 'Male' : 
                       patientData[DICOM_TAGS.PatientSex] === 'F' ? 'Female' : 
                       patientData[DICOM_TAGS.PatientSex] || 'Not Available'}
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
                      {formatAge(patientData[DICOM_TAGS.PatientAge])}
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
                      {patientData[DICOM_TAGS.AccessionNumber]}
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
                      {formatName(patientData[DICOM_TAGS.ReferringPhysicianName])}
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
                      {patientData[DICOM_TAGS.StudyDescription] || 'Not Available'}
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
                      {formatDate(patientData[DICOM_TAGS.StudyDate])}
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
                      {patientData[DICOM_TAGS.BodyPartExamined]}
                    </Typography>
                  </Grid>
                  
                  {/* <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Image fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Instance Number
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData[DICOM_TAGS.InstanceNumber] || 'N/A'}
                    </Typography>
                  </Grid> */}
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Numbers fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Series Number
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {patientData[DICOM_TAGS.SeriesNumber] || 'N/A'}
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
                      {patientData[DICOM_TAGS.StudyID] || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PatientDetails;