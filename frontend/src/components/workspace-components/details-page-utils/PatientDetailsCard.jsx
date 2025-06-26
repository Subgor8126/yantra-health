import { Card, CardContent, Typography, Box } from "@mui/material";
import { formatDate, formatName, formatAge } from "../table-utils/formatHelpers";

export default function PatientDetails({ patientData }) {
  const cleanedPatientData = { 
    "Patient ID": patientData.patient_id || "N/A",
    "Patient Age" : formatAge(patientData.age) || "N/A",
    "Patient Name": formatName(patientData.name) || "N/A",
    "Patient Sex": patientData.sex || "N/A",
    "Patient DOB": formatDate(patientData.birth_date) || "N/A",
    "Patient Address": patientData.address || "N/A",
    "Ethnicity": patientData.ethnicity || "N/A"
   };

  return (
    <Card
      sx={{
        bgcolor: "#57D270",
        borderRadius: 3,
        height: '460px',
        overflow: 'auto',
        px: 3,
        py: 2,
      }}
    >
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'black' }}>Patient Details</Typography>
        <Box mt={2}>
          {Object.entries(cleanedPatientData).map(([key, value]) => (
            <Typography key={key} variant="body1" sx={{ mb: 1, color: 'black' }}>
              <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>
              {value}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>

    
  );
}
