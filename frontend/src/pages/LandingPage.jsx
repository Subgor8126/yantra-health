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
  MedicalServices as MedicalIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useDispatch } from "react-redux";
import { setSnackbar } from "../redux/slices/snackbarSlice";

const LPHero = () => {
  const theme = useTheme();
  const auth = useAuthCustom();
  const dispatch = useDispatch();
  
  const handleSignIn = () => {
    auth.login();
  };

  const handleGuestSignIn = () => {
    auth.loginAsGuest();
    dispatch(setSnackbar({ open: true, message: "Logging In as Guest", severity: "info" }));
    console.log("Guest login initiated");
  }
  
  const features = [
    {
      icon: <StorageIcon fontSize="large" />,
      title: "Cloud Storage",
      description: "Securely store your DICOM files in the cloud with unlimited scalability"
    },
    // {
    //   icon: <SecurityIcon fontSize="large" />,
    //   title: "HIPAA Compliant",
    //   description: "Enterprise-grade security ensuring patient data remains protected"
    // },
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

  const signInButton = (
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
  );

  const tryAsGuestButton = (
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
    );
  
  // const testimonials = [
  //   {
  //     name: "Dr. Sarah Johnson",
  //     role: "Radiologist",
  //     comment: "This cloud DICOM solution has transformed our workflow. We can now access patient studies from anywhere, saving us valuable time."
  //   },
  //   {
  //     name: "Memorial Hospital",
  //     role: "Radiology Department",
  //     comment: "The security features and ease of use make this platform indispensable for our growing imaging needs."
  //   }
  // ];

  return (
    <Box sx={{ overflow: 'hidden' }}>

      {/* Navigation */}
      <Box
      sx={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        zIndex: 1000,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgb(255, 255, 255)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        px: 4,
        py: 1.5
      }}
    >
        <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* Logo + Text */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/favicon-32x32.png"
            alt="Yantra Health Logo"
            style={{
              height: 28,
              width: 28,
              marginRight: 10,
              borderRadius: 4
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: 0, sm: '1.25rem' },
              background: 'linear-gradient(135deg, #FF1B6B 0%, #FF6B35 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'inline' }
            }}
          >
            Yantra Health
          </Typography>
        </Box>

        {/* Buttons */}
        <Stack
          direction={{ xs: 'row', sm: 'row' }}
          spacing={1}
          sx={{
            '& button': {
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 },
            },
          }}
        >
          {signInButton}
          {tryAsGuestButton}
        </Stack>
      </Box>
    </Box>

      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, rgba(248, 4, 57, 0.92) 0%,rgba(122, 6, 87, 0.7) 100%)`,
          color: 'white',
          pt: 8,
          pb: 12,
          position: 'relative',
          overflow: 'hidden',
          pt: 14
        }}
      >

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
                Cloud-Based DICOM Server
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Secure, scalable, and accessible medical imaging storage
              </Typography>
              {/* <Typography variant="body1" sx={{ mb: 4, maxWidth: '90%' }}>
                Store, view, and share DICOM files with ease. Our platform provides healthcare professionals with instant access to medical images from anywhere, on any device.
              </Typography> */}
              <Stack direction="row" spacing={2}>
                {/* {signInButton}
                {tryAsGuestButton} */}
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
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                  <AccountCircleIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>1. Authenticate</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign Up or Log In to your account
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
                  <CloudUploadIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" gutterBottom>2. Upload</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload your DICOM files to our secure cloud platform
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

      {/* Testimonials
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
      </Container> */}

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
          {/* <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Join healthcare professionals worldwide who trust our cloud DICOM server
          </Typography> */}
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
                gorwadkar@outlook.com
              </Typography>
            </Grid>
            {/* <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Legal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Terms of Service
              </Typography>
            </Grid> */}
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