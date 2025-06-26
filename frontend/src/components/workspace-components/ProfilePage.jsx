import * as React from 'react';
import { 
  Box, Typography, Avatar, Paper, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import { useAuthCustom } from '../../hooks/useAuthCustom';

export default function ProfilePage({ onClose }) {
  const auth = useAuthCustom();

  const userData = JSON.parse(localStorage.getItem('userData'))
  console.log("User Data in profile page:", userData);

  if (auth.isGuest) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          You need to be logged in to view your profile
        </Typography>
        <Button 
          variant="contained" 
          onClick={auth.login}
          sx={{
            mt: 2,
            background: "#fc3003",
            "&:hover": {
              background: "linear-gradient(270deg,rgb(230, 3, 3), rgb(0, 89, 255))"
            },
          }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(90deg, #1e3c72, #2a5298)',
          color: 'white',
          position: 'relative'
        }}
      >
        <IconButton 
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ width: 80, height: 80, bgcolor: '#fc3003' }}
              alt={auth.user?.username || 'User'}
            >
              {auth.user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {userData.full_name || 'User'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Profile Info */}
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon fontSize="small" />
                {userData.full_name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                {userData.email || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                {userData.role || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                {userData.user_id || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

// import * as React from 'react';
// import { useState, useEffect } from 'react';
// import { 
//   Box, Typography, Avatar, Button, IconButton,
//   TextField, Paper, Grid, Divider, Tabs, Tab, 
//   CircularProgress, Card, CardContent, Alert,
//   List, ListItem, ListItemIcon, ListItemText
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import EditIcon from '@mui/icons-material/Edit';
// import SaveIcon from '@mui/icons-material/Save';
// import BadgeIcon from '@mui/icons-material/Badge';
// import EmailIcon from '@mui/icons-material/Email';
// import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
// import VpnKeyIcon from '@mui/icons-material/VpnKey';
// import HistoryIcon from '@mui/icons-material/History';
// import FolderIcon from '@mui/icons-material/Folder';
// import { useAuthCustom } from '../../hooks/useAuthCustom';
// import { useDispatch } from 'react-redux';
// import { setSnackbar } from '../../redux/slices/snackbarSlice';

// function TabPanel(props) {
//   const { children, value, index, ...other } = props;
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`profile-tabpanel-${index}`}
//       aria-labelledby={`profile-tab-${index}`}
//       {...other}
//     >
//       {value === index && (
//         <Box sx={{ p: 3 }}>
//           {children}
//         </Box>
//       )}
//     </div>
//   );
// }

// export default function ProfilePage({ onClose }) {
//   const API_BASE_URL = import.meta.env.API_URL || "http://localhost:8000";
//   const auth = useAuthCustom();
//   const dispatch = useDispatch();
//   const [tabValue, setTabValue] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [userDetails, setUserDetails] = useState({
//     username: auth.user?.username || '',
//     email: auth.user?.email || '',
//     firstName: auth.user?.firstName || '',
//     lastName: auth.user?.lastName || '',
//     organization: auth.user?.organization || '',
//     role: auth.user?.role || 'User',
//   });
//   const [editMode, setEditMode] = useState(false);
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [uploadHistory, setUploadHistory] = useState([]);
//   const [storageInfo, setStorageInfo] = useState(null);

//   // Fetch user's DICOM upload history
//   useEffect(() => {
//     if (!auth.isGuest && auth.tokens?.access_token) {
//       fetchUserData();
//     }
//   }, [auth.isGuest, auth.tokens]);

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       // This would fetch actual data from your API endpoints
//       const token = auth.tokens.access_token;
      
//       // You'll need to implement these API endpoints on your backend
//       const historyResponse = await fetch(`${API_BASE_URL}/api/user/upload-history`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       const storageResponse = await fetch(`${API_BASE_URL}/api/user/storage-info`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       if (historyResponse.ok) {
//         const historyData = await historyResponse.json();
//         setUploadHistory(historyData);
//       }
      
//       if (storageResponse.ok) {
//         const storageData = await storageResponse.json();
//         setStorageInfo(storageData);
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handleProfileEdit = () => {
//     setEditMode(true);
//   };

//   const handleProfileSave = async () => {
//     setLoading(true);
//     try {
//       // You'll need to implement this API endpoint
//       const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${auth.tokens.access_token}`
//         },
//         body: JSON.stringify(userDetails)
//       });
      
//       if (response.ok) {
//         dispatch(setSnackbar({ 
//           open: true, 
//           message: "Profile updated successfully!", 
//           severity: "success" 
//         }));
//         setEditMode(false);
//       } else {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update profile");
//       }
//     } catch (error) {
//       dispatch(setSnackbar({ 
//         open: true, 
//         message: error.message, 
//         severity: "error" 
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
    
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       dispatch(setSnackbar({ 
//         open: true, 
//         message: "New passwords don't match", 
//         severity: "error" 
//       }));
//       return;
//     }
    
//     setLoading(true);
//     try {
//       // You'll need to implement this API endpoint
//       const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${auth.tokens.access_token}`
//         },
//         body: JSON.stringify({
//           currentPassword: passwordData.currentPassword,
//           newPassword: passwordData.newPassword
//         })
//       });
      
//       if (response.ok) {
//         dispatch(setSnackbar({ 
//           open: true, 
//           message: "Password changed successfully!", 
//           severity: "success" 
//         }));
//         setPasswordData({
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: ''
//         });
//       } else {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to change password");
//       }
//     } catch (error) {
//       dispatch(setSnackbar({ 
//         open: true, 
//         message: error.message, 
//         severity: "error" 
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserDetails(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handlePasswordInputChange = (e) => {
//     const { name, value } = e.target;
//     setPasswordData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // If user is not logged in
//   if (auth.isGuest) {
//     return (
//       <Box sx={{ p: 4, textAlign: 'center' }}>
//         <Typography variant="h5" gutterBottom>
//           You need to be logged in to view your profile
//         </Typography>
//         <Button 
//           variant="contained" 
//           onClick={auth.login}
//           sx={{
//             mt: 2,
//             background: "#fc3003",
//             "&:hover": {
//               background: "linear-gradient(270deg,rgb(230, 3, 3), rgb(0, 89, 255))"
//             },
//           }}
//         >
//           Sign In
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       {/* Header */}
//       <Box 
//         sx={{ 
//           p: 3, 
//           background: 'linear-gradient(90deg, #1e3c72, #2a5298)',
//           color: 'white',
//           position: 'relative'
//         }}
//       >
//         <IconButton 
//           onClick={onClose}
//           sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
//         >
//           <CloseIcon />
//         </IconButton>
        
//         <Grid container spacing={2} alignItems="center">
//           <Grid item>
//             <Avatar 
//               sx={{ width: 80, height: 80, bgcolor: '#fc3003' }}
//               alt={userDetails.username}
//             >
//               {userDetails.firstName ? userDetails.firstName[0] : userDetails.username?.[0]?.toUpperCase()}
//             </Avatar>
//           </Grid>
//           <Grid item xs>
//             <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//               {userDetails.firstName && userDetails.lastName 
//                 ? `${userDetails.firstName} ${userDetails.lastName}`
//                 : userDetails.username
//               }
//             </Typography>
//             <Typography variant="subtitle1">
//               {userDetails.role} • {userDetails.organization || "No organization"}
//             </Typography>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Tabs */}
//       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           variant="fullWidth"
//         >
//           <Tab label="Profile" />
//           <Tab label="Security" />
//           <Tab label="Activity" />
//         </Tabs>
//       </Box>

//       {/* Profile Tab */}
//       <TabPanel value={tabValue} index={0}>
//         <Paper sx={{ p: 3 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//             <Typography variant="h6">Profile Information</Typography>
//             {!editMode ? (
//               <Button 
//                 startIcon={<EditIcon />} 
//                 onClick={handleProfileEdit}
//                 variant="outlined"
//               >
//                 Edit
//               </Button>
//             ) : (
//               <Button 
//                 startIcon={<SaveIcon />} 
//                 onClick={handleProfileSave}
//                 variant="contained"
//                 disabled={loading}
//                 sx={{
//                   background: "#fc3003",
//                   "&:hover": {
//                     background: "linear-gradient(270deg,#fc3003, rgb(0, 89, 255))"
//                   },
//                 }}
//               >
//                 {loading ? 'Saving...' : 'Save'}
//               </Button>
//             )}
//           </Box>
          
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Username"
//                 name="username"
//                 value={userDetails.username}
//                 onChange={handleInputChange}
//                 disabled={!editMode || loading}
//                 InputProps={{
//                   startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Email"
//                 name="email"
//                 type="email"
//                 value={userDetails.email}
//                 onChange={handleInputChange}
//                 disabled={!editMode || loading}
//                 InputProps={{
//                   startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="First Name"
//                 name="firstName"
//                 value={userDetails.firstName}
//                 onChange={handleInputChange}
//                 disabled={!editMode || loading}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Last Name"
//                 name="lastName"
//                 value={userDetails.lastName}
//                 onChange={handleInputChange}
//                 disabled={!editMode || loading}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Organization"
//                 name="organization"
//                 value={userDetails.organization}
//                 onChange={handleInputChange}
//                 disabled={!editMode || loading}
//                 InputProps={{
//                   startAdornment: <LocalHospitalIcon sx={{ mr: 1, color: 'text.secondary' }} />,
//                 }}
//               />
//             </Grid>
//           </Grid>
//         </Paper>
        
//         {storageInfo && (
//           <Paper sx={{ p: 3, mt: 3 }}>
//             <Typography variant="h6" gutterBottom>
//               Storage Usage
//             </Typography>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Card sx={{ bgcolor: '#f5f5f5' }}>
//                   <CardContent>
//                     <Typography color="text.secondary" gutterBottom>
//                       Total Storage
//                     </Typography>
//                     <Typography variant="h5">
//                       {storageInfo.totalUsed} / {storageInfo.totalAllowed}
//                     </Typography>
//                     <Box sx={{ mt: 2, position: 'relative', display: 'inline-flex' }}>
//                       <CircularProgress 
//                         variant="determinate" 
//                         value={storageInfo.usagePercentage} 
//                         color={storageInfo.usagePercentage > 80 ? "error" : "primary"}
//                       />
//                       <Box
//                         sx={{
//                           top: 0,
//                           left: 0,
//                           bottom: 0,
//                           right: 0,
//                           position: 'absolute',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                         }}
//                       >
//                         <Typography variant="caption" color="text.secondary">
//                           {`${Math.round(storageInfo.usagePercentage)}%`}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Card sx={{ bgcolor: '#f5f5f5' }}>
//                   <CardContent>
//                     <Typography color="text.secondary" gutterBottom>
//                       DICOM Files
//                     </Typography>
//                     <Typography variant="h5">
//                       {storageInfo.totalFiles || 0} files
//                     </Typography>
//                     <Typography variant="body2" sx={{ mt: 1 }}>
//                       {storageInfo.studies || 0} Studies • {storageInfo.series || 0} Series
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Paper>
//         )}
//       </TabPanel>

//       {/* Security Tab */}
//       <TabPanel value={tabValue} index={1}>
//         <Paper sx={{ p: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             Change Password
//           </Typography>
//           <form onSubmit={handlePasswordChange}>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Current Password"
//                   name="currentPassword"
//                   type="password"
//                   value={passwordData.currentPassword}
//                   onChange={handlePasswordInputChange}
//                   required
//                   disabled={loading}
//                   InputProps={{
//                     startAdornment: <VpnKeyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="New Password"
//                   name="newPassword"
//                   type="password"
//                   value={passwordData.newPassword}
//                   onChange={handlePasswordInputChange}
//                   required
//                   disabled={loading}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Confirm New Password"
//                   name="confirmPassword"
//                   type="password"
//                   value={passwordData.confirmPassword}
//                   onChange={handlePasswordInputChange}
//                   required
//                   disabled={loading}
//                   error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
//                   helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? "Passwords don't match" : ''}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   disabled={loading}
//                   sx={{
//                     background: "#fc3003",
//                     "&:hover": {
//                       background: "linear-gradient(270deg,#fc3003, rgb(0, 89, 255))"
//                     },
//                   }}
//                 >
//                   {loading ? 'Updating...' : 'Update Password'}
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//         </Paper>
//       </TabPanel>

//       {/* Activity Tab */}
//       <TabPanel value={tabValue} index={2}>
//         <Paper sx={{ p: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             Recent DICOM Uploads
//           </Typography>
          
//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//               <CircularProgress />
//             </Box>
//           ) : uploadHistory.length > 0 ? (
//             <List sx={{ width: '100%' }}>
//               {uploadHistory.map((item, index) => (
//                 <React.Fragment key={item.id || index}>
//                   <ListItem alignItems="flex-start">
//                     <ListItemIcon>
//                       <FolderIcon color="primary" />
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.filename || `Upload #${item.id}`}
//                       secondary={
//                         <>
//                           <Typography
//                             component="span"
//                             variant="body2"
//                             color="text.primary"
//                           >
//                             {item.studyDescription || "Unknown Study"}
//                           </Typography>
//                           {` — ${item.seriesCount || 0} series • ${item.instanceCount || 0} instances • `}
//                           <Typography
//                             component="span"
//                             variant="body2"
//                             color="text.secondary"
//                           >
//                             {new Date(item.uploadDate).toLocaleString()}
//                           </Typography>
//                         </>
//                       }
//                     />
//                   </ListItem>
//                   {index < uploadHistory.length - 1 && <Divider variant="inset" component="li" />}
//                 </React.Fragment>
//               ))}
//             </List>
//           ) : (
//             <Alert severity="info" sx={{ mt: 2 }}>
//               No upload history found. Upload DICOM files to see your activity.
//             </Alert>
//           )}
//         </Paper>
        
//         <Paper sx={{ p: 3, mt: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             Login History
//           </Typography>
          
//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <List sx={{ width: '100%' }}>
//               <ListItem>
//                 <ListItemIcon>
//                   <HistoryIcon />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Current Session"
//                   secondary={`Started at ${new Date().toLocaleString()}`}
//                 />
//               </ListItem>
//               <Divider variant="inset" component="li" />
//               {/* You would populate this with actual login history data from your API */}
//               <ListItem>
//                 <ListItemIcon>
//                   <HistoryIcon />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Previous Login"
//                   secondary="Not available - Implement login history tracking"
//                 />
//               </ListItem>
//             </List>
//           )}
//         </Paper>
//       </TabPanel>
//     </Box>
//   );
// }