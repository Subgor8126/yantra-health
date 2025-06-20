import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem } from '@mui/material';

const roles = ['Radiologist', 'Technician', 'Researcher', 'Student', 'Other'];

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const user_id = params.get('user_id');
  const emailParam = params.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const body = {
      user_id,
      email,
      full_name: fullName,
      role
    };
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      const data = await res.json(); // Always consume the body
  
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'User creation failed');
      }
  
      navigate('/app');
    } catch (err) {
      console.error("Onboarding failed:", err);
      alert("Something went wrong during onboarding.");
    }
  };  

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 8, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Complete Your Onboarding
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Role"
          select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          margin="normal"
        >
          {roles.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Continue
        </Button>
      </form>
    </Box>
  );
};

export default Onboarding;