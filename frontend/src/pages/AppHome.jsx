import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Typography, Container, Button, Box, Grid, Paper 
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useAuthCustom } from "../hooks/useAuthCustom";
import { useDispatch } from "react-redux";
import { setSnackbar } from "../redux/slices/snackbarSlice";

function AppHome() {
  const auth = useAuthCustom();
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (auth.isGuest){
      dispatch(setSnackbar({ open: true, message: "Logged in as guest with limited usage privileges", severity: "success" }));
    }

    if (auth.userId) {
      fetch(`${import.meta.env.VITE_API_URL}/api/stats?userId=${auth.userId}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => {
          console.error("Error fetching stats:", err);
          dispatch(setSnackbar({ open: true, message: "Failed to load stats", severity: "error" }));
        });
    }
  }, []);

  const chartData = stats?.monthlyStudyCounts || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Workspace + Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {/* Workspace Card */}
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
              Access, view, and analyse your DICOM studies.
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
        
        {/* Stats Card */}
        {!auth.isGuest && (
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg,rgb(22, 97, 172) 0%,rgb(0, 10, 104) 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>My Data Overview</Typography>

            {stats ? (
              <>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">🧪 Total Instances</Typography>
                    <Typography variant="h6">{stats.totalInstances}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">🗂 Total Studies</Typography>
                    <Typography variant="h6">{stats.totalStudies}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">⏳ Avg Study Size</Typography>
                    <Typography variant="h6">{stats.averageStudySizeMB.toFixed(2)} MB</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">⬆️ Largest Study</Typography>
                    <Typography variant="h6">{stats.largestStudySizeMB.toFixed(2)} MB</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">🕓 Last Upload</Typography>
                    <Typography variant="h6">{new Date(stats.mostRecentUpload).toLocaleString()} UTC</Typography>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Typography>Loading stats...</Typography>
            )}
          </Paper>
        </Grid>
        )}
      </Grid>

      {/* Graph Below */}
      {stats && !auth.isGuest && (
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>📈 Upload Trends</Typography>
          <LineChart
            xAxis={[{
              scaleType: 'point',
              data: Object.keys(chartData),
            }]}
            series={[{
              data: Object.values(chartData),
            }]}
            height={250}
          />
        </Paper>
      )}
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
