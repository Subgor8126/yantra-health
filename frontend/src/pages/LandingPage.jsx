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
  CircularProgress,
  Chip,
  Link
} from "@mui/material";
import { 
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  DevicesOther as DevicesIcon,
  MedicalServices as MedicalIcon,
  AccountCircle as AccountCircleIcon,
  Visibility as VisibilityIcon,
  Api as ApiIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  Psychology as PsychologyIcon,
  IntegrationInstructions as IntegrationIcon,
  Business as BusinessIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import GitHubIcon from '@mui/icons-material/GitHub';
import CloudIcon from '@mui/icons-material/Cloud';
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
  
  const liveFeatures = [
    {
      icon: <CloudUploadIcon fontSize="large" />,
      title: "DICOM Studies Upload",
      description: "Upload complete DICOM studies via folder upload with secure cloud storage",
      status: "Live",
      statusColor: "success"
    },
    {
      icon: <VisibilityIcon fontSize="large" />,
      title: "Integrated OHIF Viewer",
      description: "View studies using the integrated OHIF Viewer with DICOMweb-compliant backend",
      status: "Beta",
      statusColor: "warning"
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "Secure Authentication",
      description: "User authentication with normal and guest login options",
      status: "Live",
      statusColor: "success"
    },
    {
      icon: <DashboardIcon fontSize="large" />,
      title: "Real-time Dashboard",
      description: "Live dashboard showing study count, storage usage with filters and search",
      status: "Live",
      statusColor: "success"
    },
    {
      icon: <StorageIcon fontSize="large" />,
      title: "AWS Serverless Architecture",
      description: "Built on AWS Lambda, API Gateway, DynamoDB for unlimited scalability",
      status: "Live",
      statusColor: "success"
    },
    {
      icon: <ApiIcon fontSize="large" />,
      title: "DICOMweb Compliant",
      description: "Full WADO-RS and QIDO-RS compliance for seamless integration",
      status: "Live",
      statusColor: "success"
    }
  ];

  const upcomingFeatures = [
    {
      icon: <SmartToyIcon fontSize="large" />,
      title: "AI Assistant (Preview)",
      description: "Ask questions or get smart summaries using a multimodal AI assistant (early preview)",
      status: "Coming Soon (Q3 2025)",
      statusColor: "info"
    },
    {
      icon: <MedicalIcon fontSize="large" />,
      title: "Structured Reporting",
      description: "Radiologist-style reporting templates with free-text capabilities",
      status: "Coming Soon (Q3 2025)",
      statusColor: "info"
    },
    {
      icon: <BusinessIcon fontSize="large" />,
      title: "Admin Dashboard",
      description: "Role-based access control with user management and upload limits",
      status: "Coming Soon (Q3 2025)",
      statusColor: "info"
    },
    {
      icon: <ShareIcon fontSize="large" />,
      title: "Secure Study Sharing",
      description: "Share studies via secure temporary links with time-based expiration",
      status: "Coming Soon (Q3 2025)",
      statusColor: "info"
    }
  ];

  const futureFeatures = [
    {
      icon: <PsychologyIcon fontSize="large" />,
      title: "AI Anomaly Detection",
      description: "AI-assisted anomaly detection powered by AWS Bedrock and SageMaker",
      status: "Planned",
      statusColor: "default"
    },
    {
      icon: <IntegrationIcon fontSize="large" />,
      title: "HL7 Bridge Integration",
      description: "Seamless integration with RIS/HIS systems via HL7 bridge",
      status: "Planned",
      statusColor: "default"
    },
    {
      icon: <BusinessIcon fontSize="large" />,
      title: "Multi-tenant Architecture",
      description: "Per-clinic isolation with zero-footprint teleradiology capabilities",
      status: "Planned",
      statusColor: "default"
    }
  ];

  const signInButton = (
    <Button 
      variant="contained" 
      color="secondary" 
      size="large"
      onClick={handleSignIn}
      sx={{
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

<<<<<<< production
    const FeatureCard = ({ feature, index }) => (
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
            },
            borderRadius: '50px',
            border: `3px solid #660033`,
            backgroundColor: 'background.paper',
          }}
        >
          <CardContent sx={{ textAlign: 'center', flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ color: 'rgb(0, 255, 234)' }}>
                {feature.icon}
              </Box>
              <Chip 
                label={feature.status} 
                color={feature.statusColor}
                size="small"
                variant="outlined"
              />
=======
  const FeatureCard = ({ feature, index }) => (
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
          },
          borderRadius: '50px',
          border: `3px solid #660033`,
          backgroundColor: 'background.paper',
        }}
      >
        <CardContent sx={{ textAlign: 'center', flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ color: 'rgb(0, 255, 234)' }}>
              {feature.icon}
>>>>>>> master
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
    );

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
        borderRadius: '50px',
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
          pt: 14,
          borderRadius: '0px 0px 50px 50px',
        }}
      >

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" fontWeight="bold" sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg,rgb(0, 255, 128) 0%,rgb(0, 255, 234) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Yantra Health
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                Cloud-Based DICOM Server
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '90%' }}>
                Upload DICOM studies, view with our integrated OHIF Viewer, and manage everything through a workspace.
              </Typography>
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
                    <Typography variant="subtitle2" color="white">OHIF Viewer</Typography>
                    <Chip label="Beta" color="warning" size="small" sx={{ ml: 1 }} />
                  </Box>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      backgroundImage: 'url(/images/ohif-viewer-lp-preview.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      height: '100%',
                      width: '100%',
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      filter: 'brightness(0.9) saturate(1.5)', // adds richness and dims slightly for contrast
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                    }}
                  >
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
                    <Typography variant="subtitle2" gutterBottom>Dashboard</Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">Studies: 24</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">Storage: 1.4 GB</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">Number Of Instances: 1853</Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary"
                      fullWidth
                    >
                      Open in OHIF Viewer
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Live Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Live Features
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          These features are fully implemented and ready for production use
        </Typography>

        <Grid container spacing={4}>
          {liveFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </Grid>
      </Container>

      {/* Upcoming Features */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Coming Soon - Next 1-2 Months
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Exciting features currently in development
          </Typography>

          <Grid container spacing={4}>
            {upcomingFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index}/>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Future Roadmap */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Future Roadmap - 3-6 Months
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Long-term vision for advanced capabilities
        </Typography>

        <Grid container spacing={4}>
          {futureFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, borderRadius: '0px 0px 50px 50px' }}>
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
                  <AccountCircleIcon fontSize="large" sx={{ color: '#ffffff'}} />
                </Avatar>
                <Typography variant="h6" gutterBottom>1. Authenticate</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in with secure user authentication or try as guest
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
                  <CloudUploadIcon fontSize="large" sx={{ color: '#ffffff'}} />
                </Avatar>
                <Typography variant="h6" gutterBottom>2. Upload Studies</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload complete DICOM studies via folder upload to AWS S3 storage
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
                  <VisibilityIcon fontSize="large" sx={{ color: '#ffffff'}} />
                </Avatar>
                <Typography variant="h6" gutterBottom>3. View & Analyze</Typography>
                <Typography variant="body2" color="text.secondary">
                  Access studies through integrated OHIF Viewer with real-time dashboard
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: 8,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ready to get started?
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
      <Box sx={{ bgcolor: theme.palette.primary.dark, color: 'white', py: 4, borderRadius: '50px 50px 0px 0px' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Contact
              </Typography>
              <Typography 
                variant="body2"
                component="a"
                href="mailto:contact@yantrahealth.in"
                sx={{
                  opacity: 0.7,
                  textDecoration: 'none',
                  color: 'inherit', // keep it consistent with theme
                  cursor: 'pointer',
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                contact@yantrahealth.in
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Developer Resources
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GitHubIcon fontSize="small" sx={{ mr: 1, color: 'inherit', opacity: 0.7 }} />
                <Link 
                  href="https://github.com/Subgor8126/yantra-health/tree/production" 
                  target="_blank" 
                  rel="noopener" 
                  underline="hover" 
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                >
                  Source Code (GitHub Repo)
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudIcon fontSize="small" sx={{ mr: 1, color: 'inherit', opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Cloud-native infra powered by AWS Lambda, S3, Cognito, DynamoDB, API Gateway
                </Typography>
              </Box>
            </Grid>

            {/* 
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Technology
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                AWS Serverless • DICOMweb • OHIF Viewer
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Architecture
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Lambda • API Gateway • DynamoDB • S3
              </Typography>
            </Grid>
            */}

          </Grid>

          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Yantra Health DICOM Server. All rights reserved.
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

      const tokens = {
        access_token: auth.tokens.access_token,
        refresh_token: auth.tokens.refresh_token,
        id_token: auth.tokens.id_token
      };

      return;
    }
  }, [auth.isAuthenticated, location.search, navigate]);

  if (auth.error) {
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