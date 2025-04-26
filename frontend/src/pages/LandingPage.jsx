import React from "react";
import { useAuthCustom } from '../hooks/useAuthCustom';
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Divider,
  Stack,
  CircularProgress
} from "@mui/material";
import { 
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  DevicesOther as DevicesIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';

// This component replaces your LPHero component
const LPHero = () => {
  const theme = useTheme();
  const auth = useAuthCustom();
  
  const handleSignIn = () => {
    auth.login();
  };

  const handleGuestSignIn = () => {
    auth.loginAsGuest();
    console.log("Guest login initiated");
  }
  
  const features = [
    {
      icon: <StorageIcon fontSize="large" />,
      title: "Cloud Storage",
      description: "Securely store your DICOM files in the cloud with unlimited scalability"
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security ensuring patient data remains protected"
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: "Fast Access",
      description: "Rapid retrieval of studies from anywhere with an internet connection"
    },
    {
      icon: <DevicesIcon fontSize="large" />,
      title: "Cross-Platform",
      description: "Access your DICOM server from any device or operating system"
    }
  ];
  
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Radiologist",
      comment: "This cloud DICOM solution has transformed our workflow. We can now access patient studies from anywhere, saving us valuable time."
    },
    {
      name: "Memorial Hospital",
      role: "Radiology Department",
      comment: "The security features and ease of use make this platform indispensable for our growing imaging needs."
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, rgba(248, 4, 57, 0.92) 0%,rgba(122, 6, 87, 0.7) 100%)`,
          color: 'white',
          pt: 8,
          pb: 12,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Abstract background elements */}
        <Box 
          sx={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(248, 4, 57, 0.92)',
            top: '-200px',
            right: '-100px',
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(122, 6, 87, 0.7)',
            bottom: '-100px',
            left: '10%',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
                Cloud-Based DICOM Server
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Secure, scalable, and accessible medical imaging storage
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '90%' }}>
                Store, view, and share DICOM files with ease. Our platform provides healthcare professionals with instant access to medical images from anywhere, on any device.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  onClick={handleSignIn}
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleGuestSignIn}
                  sx={{ 
                    borderRadius: 2,
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Try as Guest
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              {/* Hero Image */}
              <Box 
                sx={{ 
                  position: 'relative',
                  height: '400px',
                  width: '100%',
                  display: {xs: 'none', md: 'block'}
                }}
              >
                <Paper
                  elevation={10}
                  sx={{
                    position: 'absolute',
                    width: '80%',
                    height: '60%',
                    top: '10%',
                    left: '10%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ height: '50px', bgcolor: theme.palette.primary.dark, display: 'flex', alignItems: 'center', px: 2 }}>
                    <MedicalIcon sx={{ color: 'white', mr: 1 }} />
                    <Typography variant="subtitle2" color="white">DICOM Viewer</Typography>
                  </Box>
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    background: 'repeating-linear-gradient(45deg, #1e1e1e, #1e1e1e 10px, #252525 10px, #252525 20px)'
                  }}>
                    <Typography variant="body2" color="text.secondary">Medical Imaging Preview</Typography>
                  </Box>
                </Paper>
                <Paper
                  elevation={6}
                  sx={{
                    position: 'absolute',
                    width: '60%',
                    height: '40%',
                    bottom: '5%',
                    right: '5%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 2
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>Patient Data</Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">ID: PAT-12345</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">Study: CT Scan</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">Date: 2025-03-11</Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary"
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Powerful Features
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Our cloud-based DICOM server provides everything you need for medical imaging management
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', flex: 1 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Simple, secure, and efficient
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main', 
                  mb: 2,
                  mx: 'auto'
                }}>
                  <CloudUploadIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>1. Upload</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload your DICOM files securely to our cloud platform
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main', 
                  mb: 2,
                  mx: 'auto'
                }}>
                  <StorageIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>2. Store</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your data is encrypted and stored in our HIPAA-compliant cloud
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main', 
                  mb: 2,
                  mx: 'auto'
                }}>
                  <DevicesIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>3. Access</Typography>
                <Typography variant="body2" color="text.secondary">
                  Access your studies from anywhere, on any device, anytime
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Trusted by Healthcare Professionals
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  bgcolor: index === 0 ? 'primary.main' : 'background.paper',
                  color: index === 0 ? 'white' : 'inherit'
                }}
              >
                <Typography variant="body1" paragraph sx={{ 
                  fontStyle: 'italic',
                  color: index === 0 ? 'white' : 'text.secondary'
                }}>
                  "{testimonial.comment}"
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: index === 0 ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}>
                    {testimonial.role}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        py: 8,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ready to get started?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Join healthcare professionals worldwide who trust our cloud DICOM server
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSignIn}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5
            }}
          >
            Sign In Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: theme.palette.primary.dark, color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Cloud DICOM Server
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Secure medical imaging storage and access for healthcare professionals.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                support@clouddicom.example.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                +1 (555) 123-4567
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Legal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Terms of Service
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Cloud DICOM Server. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

function LandingPage() {
  const auth = useAuthCustom();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handling authentication logic
    if (auth.isAuthenticated && auth.tokens?.access_token) {
      console.log("Got them goddamn tokens");

      const tokens = {
        access_token: auth.tokens.access_token,
        refresh_token: auth.tokens.refresh_token,
        id_token: auth.tokens.id_token
      };

      console.log(`Authentication successful:
        access token: ${tokens.access_token}
        id token: ${tokens.id_token}
        refresh token: ${tokens.refresh_token}`);

      return;
    }
    console.log("--------------------------------------------------")
    console.log(location);
    console.log("Here's the location from landing page")
    console.log(location.search)
    console.log("What's this?")
    console.log("--------------------------------------------------")
  }, [auth.isAuthenticated, location.search, navigate]);

  if (auth.error) {
    console.log("_____________error_________________")
    console.log(auth.error);
    console.log("_____________error_________________")
    return <Box>Encountering error... {auth.error.message}</Box>;
  }

  if(auth.isLoading){
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary'
      }}>
          <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
          >
          <CircularProgress color="primary" size="3rem" />
          <Typography variant="h5">Please Wait</Typography>
        </Box>
      </Box>
    )
  }

  return <LPHero />;
}

export default LandingPage;


// Original UI
// import React from "react";
// import { useAuthCustom } from "react-oidc-context";
// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Box, Typography, Button, Container, InputLabel, Link, Stack, TextField } from "@mui/material";
// import visuallyHidden from '@mui/utils/visuallyHidden';
// import { styled } from '@mui/material/styles';
// import StyledBox from "../assets/lp/StyledBox";
// import LPHero from "../components/landing-page-components/LPHero";

// function LandingPage() {

//   const auth = useAuthCustom();
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     // Step 1: Check if the user is already authenticated
//     if (auth.isAuthenticated && auth.user?.access_token) {
//       console.log("Got them goddamn tokens");

//       const tokens = { 
//         access_token: auth.user?.access_token,
//         refresh_token: auth.user?.refresh_token,
//         id_token: auth.user?.id_token
//       };

//       // localStorage.setItem("access_token", tokens.access_token);
//       // localStorage.setItem("id_token", tokens.id_token);
//       // localStorage.setItem("refresh_token", tokens.refresh_token);

//       console.log(`Authentication successful:
//         access token: ${tokens.access_token}
//         id token: ${tokens.id_token}
//         refresh token: ${tokens.refresh_token}`);

//       // Redirect to /app if on the landing page
//       // if (window.location.pathname === "/") {
//       //   navigate("/app/workspace", { replace: true });
//       // }
//       return;
//     }
//     console.log("--------------------------------------------------")
//     console.log(location);
//     console.log("Here's the location from landing page")
//     console.log(location.search)
//     console.log("What's this?")
//     console.log("--------------------------------------------------")

//     // Step 2: If user is NOT authenticated but there is an auth code in the URL, process it
//     // const searchParams = new URLSearchParams(location.search);
//     // const code = searchParams.get("code");
//     // const state = searchParams.get("state");

//     // if (code && state) {
//     //   console.log("Detected auth code + state, processing signinCallback...");

//     //   auth.signinCallback().catch(error => {
//     //     console.error("Error during signinCallback:", error);
//     //   });
//     // }
//   }, [auth.isAuthenticated, location.search, navigate]);

//   if (auth.error) {
//     console.log("_____________error_________________")
//     console.log(auth.error);
//     console.log("_____________error_________________")
//     return <Box>Encountering error... {auth.error.message}</Box>;
//   }

//   if(auth.isLoading){
//     return (
//       <Box>
//         Authenticating, Please Wait.............
//       </Box>
//     )
//   }

//   // Box is div with extra styling, mostly cause of the sx prop. Typography is for text, variant prop for type of txt
//   // like h1 or h2, and p: 1 means a padding of 8 pixels because Material UI uses units like 1 = 8px. Just watch this
//   // video, it's quick and awesome:- https://youtu.be/FB-sKY63AWo?si=6WVrqg8Tz2thoqNV
//   return (
    
//     <LPHero/>

//     // <Container>
//     //   <LPHero/>
//     // </Container>
//   );
// }

// export default LandingPage;
