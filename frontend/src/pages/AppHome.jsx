import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Typography, 
  Container, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  Paper,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Dashboard as DashboardIcon,
  Image as ImageIcon,
  Bookmark as BookmarkIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

function AppHome() {
  const [recentStudies] = useState([
    { id: 1, patientId: "PAT-1023", studyDate: "2025-03-08", modality: "CT", images: 124 },
    { id: 2, patientId: "PAT-4567", studyDate: "2025-03-10", modality: "MR", images: 56 }
  ]);

  // Dummy handler functions
  const handleUpload = () => console.log("Upload initiated");
  const handleSearch = () => console.log("Search initiated");
  const handleNotifications = () => console.log("Notifications opened");
  const handleBookmark = (studyId) => console.log("Bookmarked study", studyId);
  const handleMoreOptions = (studyId) => console.log("More options for study", studyId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with welcome and quick actions */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Welcome back!
          </Typography>
          {/* <Typography variant="subtitle1" color="text.secondary">
            Your cloud DICOM server is running normally
          </Typography> */}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton color="primary" onClick={handleSearch} sx={{ bgcolor: 'background.paper' }}>
            <SearchIcon />
          </IconButton>
          <IconButton color="primary" onClick={handleNotifications} sx={{ bgcolor: 'background.paper' }}>
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Action cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(90deg,rgb(255, 99, 9) 30%,rgb(102, 8, 82) 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>Workspace</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Access your DICOM studies, perform analysis, and collaborate with your team.
            </Typography>
            <Link to="/app/workspace" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<DashboardIcon />}
                sx={{ borderRadius: 2 }}
              >
                Go To Workspace
              </Button>
            </Link>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              height: '100%',
              bgcolor: 'background.paper',
              background: 'linear-gradient(270deg, rgb(0, 89, 255), rgb(15, 1, 92))'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>Upload DICOM Files</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Import new DICOM studies directly to your cloud storage.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
              sx={{ borderRadius: 2 }}
            >
              Upload Files
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent studies section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Recent Studies</Typography>
        <Grid container spacing={2}>
          {recentStudies.map(study => (
            <Grid item xs={12} sm={6} key={study.id}>
              <Card elevation={1} sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{study.patientId}</Typography>
                    <Chip 
                      label={study.modality} 
                      size="small" 
                      color="primary" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Study Date: {study.studyDate}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <ImageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {study.images} images
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/app/workspace/${study.id}`}
                    variant="contained"
                  >
                    View Study
                  </Button>
                  <Box>
                    <IconButton size="small" onClick={() => handleBookmark(study.id)}>
                      <BookmarkIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleMoreOptions(study.id)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Statistics summary */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Storage Summary</Typography>
        <Grid container spacing={4}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Studies</Typography>
            <Typography variant="h5">327</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Storage Used</Typography>
            <Typography variant="h5">1.7 TB</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Recent Activity</Typography>
            <Typography variant="h5">12 views</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Active Users</Typography>
            <Typography variant="h5">4</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default AppHome;


// ChatGPT UI
// import React from "react";
// import { Link } from "react-router-dom";
// import { Typography, Container, Button, Box, Paper, Grid } from "@mui/material";
// import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"; // Example Icon

// function AppHome() {
//   console.log("in app home");

//   // Dummy handler functions
//   const handleExplore = () => console.log("Exploring Workspaces");
//   const handleRecentClick = (workspace) => console.log(`Opening ${workspace}`);

//   return (
//     <Container maxWidth="md" sx={{ mt: 6, textAlign: "center" }}>
//       {/* Welcome Section */}
//       <Paper
//         elevation={4}
//         sx={{
//           bgcolor: "background.paper",
//           p: 4,
//           borderRadius: 3,
//           textAlign: "center",
//         }}
//       >
//         <Typography variant="h4" color="text.primary" gutterBottom>
//           Welcome
//         </Typography>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           Manage your DICOM files and workspaces with ease.
//         </Typography>
//         <Link to="/app/workspace" style={{ textDecoration: "none" }}>
//           <Button variant="contained" color="primary" sx={{ mt: 2 }}>
//             Go To Workspace
//           </Button>
//         </Link>
//       </Paper>

//       {/* Recent Workspaces (Dummy Data) */}
//       <Box sx={{ mt: 4 }}>
//         <Typography variant="h6" color="text.primary" gutterBottom>
//           Recent Workspaces
//         </Typography>
//         <Grid container spacing={2} justifyContent="center">
//           {["MRI Scans", "CT Scans", "X-Ray Analysis"].map((workspace, index) => (
//             <Grid item key={index}>
//               <Paper
//                 elevation={3}
//                 sx={{
//                   p: 2,
//                   width: 180,
//                   textAlign: "center",
//                   cursor: "pointer",
//                   transition: "transform 0.2s",
//                   "&:hover": { transform: "scale(1.05)", bgcolor: "primary.main" },
//                 }}
//                 onClick={() => handleRecentClick(workspace)}
//               >
//                 <WorkspacePremiumIcon sx={{ fontSize: 40, color: "secondary.main" }} />
//                 <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
//                   {workspace}
//                 </Typography>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>

//       {/* Explore More Button */}
//       <Button variant="outlined" color="secondary" sx={{ mt: 4 }} onClick={handleExplore}>
//         Explore More
//       </Button>
//     </Container>
//   );
// }

// export default AppHome;


// original UI
// import React from "react";
// import { Link, Outlet } from "react-router-dom";
// import { Typography, Container, Button} from '@mui/material';

// function AppHome() {
//   console.log("in app home")

//       return (
//           <Container>
//             <Typography variant="h1">Welcome back!</Typography>
//               <Link to="/app/workspace">
//                 <Button variant="contained">Go To Workspace</Button>
//               </Link>
//               {/* <Link to="/app/files">Files</Link> */}
//           </Container>
//         );
// }

// export default AppHome;
