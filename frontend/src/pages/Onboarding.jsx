import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormLabel,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

// Account types
const accountTypes = {
  individual: 'Individual Account',
  institution: 'Institution Account'
};

// Individual specialties/roles
const individualRoles = ['Radiologist', 'Student', 'Technician', 'Researcher', 'Other'];

// Institution types
const institutionTypes = ['Hospital', 'Radiology Center', 'Imaging Lab', 'Clinic', 'Other'];

// Sample countries (you should replace with a proper ISO country list)
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
  'Australia', 'Japan', 'India', 'Brazil', 'Mexico', 'Other'
];

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const user_id = params.get('user_id');
  const emailParam = params.get('email') || '';
  const nameParam = params.get('name') || '';

  // Step management for institution onboarding
  const [activeStep, setActiveStep] = useState(0);
  const institutionSteps = ['Confirm Admin Details', 'Institution Information'];

  // Common fields
  const [accountType, setAccountType] = useState('');
  const [email] = useState(emailParam); // Read-only from Cognito

  // Individual account fields
  const [fullName, setFullName] = useState(nameParam);
  const [country, setCountry] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [institution, setInstitution] = useState('');

  // Institution account fields
  const [adminName, setAdminName] = useState(nameParam);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [institutionCountry, setInstitutionCountry] = useState('');
  const [cityAddress, setCityAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [accreditationId, setAccreditationId] = useState('');

  // Validation helpers
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isIndividualFormValid = () => {
    return fullName.trim().length >= 2 && 
           country && 
           specialty;
  };

  const isInstitutionStep1Valid = () => {
    return adminName.trim().length >= 2;
  };

  const isInstitutionStep2Valid = () => {
    return institutionName.trim().length >= 2 && 
           institutionType && 
           institutionCountry && 
           cityAddress.trim() && 
           contactEmail && 
           isValidEmail(contactEmail);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    
    if (!isIndividualFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }

    const body = {
      user_id,
      email,
      full_name: fullName,
      country,
      user_type: 'Individual',
      specialty,
      license_id: licenseId || null,
      institution: institution || null,
      onboarding_complete: true
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'User creation failed');
      }

      navigate('/app');
    } catch (err) {
      console.error("Individual onboarding failed:", err);
      alert("Something went wrong during onboarding.");
    }
  };

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    
    if (!isInstitutionStep2Valid()) {
      alert('Please fill in all required fields with valid information.');
      return;
    }

    try {
      // First create the admin user
      const userBody = {
        user_id,
        email,
        full_name: adminName,
        user_type: 'Admin',
        onboarding_complete: true
      };

      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userBody),
      });

      const userData = await userRes.json();

      if (!userRes.ok || !userData.success) {
        throw new Error(userData.error || 'Admin user creation failed');
      }

      // Then create the institution
      const institutionBody = {
        name: institutionName,
        institution_type: institutionType,
        country: institutionCountry,
        city_address: cityAddress,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
        accreditation_id: accreditationId || null,
        admin_user_id: user_id
      };

      const institutionRes = await fetch(`${import.meta.env.VITE_API_URL}/api/create-institution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionBody),
      });

      const institutionData = await institutionRes.json();

      if (!institutionRes.ok || !institutionData.success) {
        throw new Error(institutionData.error || 'Institution creation failed');
      }

      navigate('/app');
    } catch (err) {
      console.error("Institution onboarding failed:", err);
      alert("Something went wrong during onboarding.");
    }
  };

  const renderIndividualForm = () => (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Individual Account Information
      </Typography>
      <form onSubmit={handleIndividualSubmit}>
        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          fullWidth
          margin="normal"
          helperText="Personal full name (minimum 2 characters)"
        />
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Country</InputLabel>
          <Select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            label="Country"
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Specialty / Role</InputLabel>
          <Select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            label="Specialty / Role"
          >
            {individualRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="License / University ID (Optional)"
          value={licenseId}
          onChange={(e) => setLicenseId(e.target.value)}
          fullWidth
          margin="normal"
          helperText="Optional professional ID"
        />

        <TextField
          label="Institution (Optional)"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          fullWidth
          margin="normal"
          helperText="Free text - can be used for future invites"
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 3 }}
          disabled={!isIndividualFormValid()}
        >
          Complete Onboarding
        </Button>
      </form>
    </Paper>
  );

  const renderInstitutionStep1 = () => (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Admin Details
      </Typography>
      <TextField
        label="Admin Email"
        value={email}
        disabled
        fullWidth
        margin="normal"
        helperText="From Cognito - cannot be changed"
      />
      <TextField
        label="Admin Full Name"
        value={adminName}
        onChange={(e) => setAdminName(e.target.value)}
        required
        fullWidth
        margin="normal"
        helperText="This will be the permanent institution administrator"
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isInstitutionStep1Valid()}
        >
          Next
        </Button>
      </Box>
    </Paper>
  );

  const renderInstitutionStep2 = () => (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Institution Details
      </Typography>
      <form onSubmit={handleInstitutionSubmit}>
        <TextField
          label="Institution Name"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          required
          fullWidth
          margin="normal"
          helperText="Official institution name (minimum 2 characters)"
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Institution Type</InputLabel>
          <Select
            value={institutionType}
            onChange={(e) => setInstitutionType(e.target.value)}
            label="Institution Type"
          >
            {institutionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Country</InputLabel>
          <Select
            value={institutionCountry}
            onChange={(e) => setInstitutionCountry(e.target.value)}
            label="Country"
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="City / Address"
          value={cityAddress}
          onChange={(e) => setCityAddress(e.target.value)}
          required
          fullWidth
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          label="Contact Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          type="email"
          required
          fullWidth
          margin="normal"
          helperText="For patient reports / public contact (separate from admin email)"
          error={contactEmail && !isValidEmail(contactEmail)}
        />

        <TextField
          label="Contact Phone (Optional)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          fullWidth
          margin="normal"
          type="tel"
        />

        <TextField
          label="Accreditation ID (Optional)"
          value={accreditationId}
          onChange={(e) => setAccreditationId(e.target.value)}
          fullWidth
          margin="normal"
          helperText="National/State accreditation/licensing body ID (recommended)"
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button onClick={handleBack}>
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isInstitutionStep2Valid()}
          >
            Complete Onboarding
          </Button>
        </Box>
      </form>
    </Paper>
  );

  const renderInstitutionForm = () => (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {institutionSteps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 ? renderInstitutionStep1() : renderInstitutionStep2()}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Complete Your Onboarding
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            <Typography variant="h6">
              What type of account are you creating? *
            </Typography>
          </FormLabel>
          <RadioGroup
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <FormControlLabel
              value="individual"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">Individual Account</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Radiologist, Student, Technician, Researcher, Other
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="institution"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">Institution Account</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hospital, Radiology Center, Imaging Lab, Clinic, Other
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      {accountType === 'individual' && renderIndividualForm()}
      {accountType === 'institution' && renderInstitutionForm()}
    </Box>
  );
};

export default Onboarding;