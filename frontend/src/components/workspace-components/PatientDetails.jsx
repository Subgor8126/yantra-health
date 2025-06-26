import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { useAuthCustom } from '../../hooks/useAuthCustom';
import { PatientDetailsCard, DetailsHeaderBar, StudyMenu } from './details-page-utils';

// const DICOM_TAGS = {
//   "00100020": "PatientID",
//   "00100010": "PatientName",
//   "00100040": "PatientSex",
//   "00101010": "PatientAge",
//   "00101030": "PatientWeight",
//   "00100030": "PatientBirthDate",
//   "00080060": "Modality",
//   "00080050": "AccessionNumber",
//   "00180015": "BodyPartExamined",
//   "00200010": "StudyID",
//   "00200011": "SeriesNumber",
//   "00080020": "StudyDate",
//   "00080030": "StudyTime",
//   "00081030": "StudyDescription",
//   "00080090": "ReferringPhysicianName",
//   "00101020": "PatientSize",
//   "00102160": "EthnicGroup",
//   "00101040": "PatientAddress",
//   "00080080": "InstitutionName",
//   "0008103E": "SeriesDescription",
//   "00081090": "ManufacturerModelName",
//   "00180010": "StationName",
//   "00180022": "ScanOptions",
//   "00180060": "KVP",
//   "00181020": "SoftwareVersions",
//   "00181150": "ExposureTime",
//   "00181151": "XRayTubeCurrent",
//   "00181210": "ConvolutionKernel",
//   "0020000D": "StudyInstanceUID",
//   "0020000E": "SeriesInstanceUID"
// };

// const getNamedData = (studyDataArray) => {
//   return studyDataArray.map((studyDataObject) =>
//     Object.entries(studyDataObject).reduce((acc, [key, value]) => {
//       const tagName = DICOM_TAGS[key] || key;
//       acc[tagName] = value;
//       return acc;
//     }, {})
//   );
// };

const PatientDetails = () => {
  const { patient_id } = useParams();
  const [searchParams] = useSearchParams();
  // const fileKey = searchParams.get('fileKey');

  const dicomDataRefresh = useSelector((state) => state.dicomData.refreshTable);

  const patientDataObject = useSelector((state) => state.patient.patient);
  const patientData = [patientDataObject];
  const [studyData, setStudyData] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const auth = useAuthCustom();
  const userId = auth.userId;
  const token = auth.tokens?.access_token

  // const namedPatientData = getNamedData(patientData);

  useEffect(() => {
    const cacheKey = `studyData-${patient_id}`;
    console.log("🔍 Checking cache for studyData with key:", cacheKey);
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("✅ Loaded studyData from cache:", parsed);
        setStudyData(parsed);
        return;
      } catch (err) {
        console.warn("⚠️ Corrupt cache. Will fetch fresh data.", err);
      }
    }

    const fetchStudyData = async () => {
      try {
        console.log("🌐 Fetching study data from API...");
        const response = await fetch(`${API_BASE_URL}/api/get-studies?patientId=${patient_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const preliminaryStudyData = await response.json();
        // const named = getNamedData(preliminaryStudyData);
        const studies = preliminaryStudyData.studies

        console.log("✅ API data fetched and transformed:", studies);

        setStudyData(studies);
        localStorage.setItem(cacheKey, JSON.stringify(studies));
      } catch (error) {
        console.error("❌ Error fetching study data:", error);
      }
    };

    fetchStudyData();
  }, [patient_id, API_BASE_URL, userId, dicomDataRefresh]);

  if (!patientDataObject) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Patient Details</Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Patient ID: {patient_id}</Typography>
          <Typography color="error">No patient data found.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, md: 5 },
        pt: { xs: 2, md: 5 }, // Top padding varies based on screen
        mx: 'auto',
        minHeight: '100vh',
      }}
    >
      <Box sx={{ p: 1, pb: { xs: 5 }, height: '100px' }}>
        <DetailsHeaderBar patientName={patientData[0].name} />
      </Box>
      <Grid container spacing={2} padding={1}>
        <Grid item xs={12} md={5}>
          <PatientDetailsCard patientData={patientData[0]} />
        </Grid>
        <Grid item xs={12} md={7}>
          <StudyMenu study={studyData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDetails;