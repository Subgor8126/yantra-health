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
      const statsData = localStorage.getItem("statsData");
      if (statsData) {
        setStats(JSON.parse(statsData));
      } else {
        fetch(`${import.meta.env.VITE_API_URL}/api/stats?userId=${auth.userId}`)
          .then(res => res.json())
          .then(data => {
            setStats(data);
            localStorage.setItem("statsData", JSON.stringify(data));
          })
          .catch(err => {
            console.error("Error fetching stats:", err);
            dispatch(setSnackbar({ 
              open: true, 
              message: "Failed to load stats", 
              severity: "error" 
            }));
          });
      }
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
              color: 'white',
              borderRadius: '50px',
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
              >
                Go To Workspace
              </Button>
            </Link>
          </Paper>
        </Grid>
        
        {/* Stats Card */}
        {!auth.isGuest ? (
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
              color: 'white',
              borderRadius: '50px',
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
        ) : (
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
            <Typography variant="h5" sx={{ mb: 2 }}>Log In as a User and Upload Files to view stats</Typography>

          </Paper>
        </Grid>
        )}
      </Grid>

      {/* Graph Below */}
      {stats && !auth.isGuest && (
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: '50px' }}>
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