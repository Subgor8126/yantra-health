import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  AppBar, Box, Toolbar, IconButton, Typography, 
  Button, Menu, MenuItem, Avatar, Divider, 
  Dialog, DialogTitle, DialogContent, 
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Tooltip, Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import { useAuthCustom } from '../../hooks/useAuthCustom';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../../redux/slices/dicomDataSlice';
import { setSnackbar } from '../../redux/slices/snackbarSlice';
import ProfilePage from './ProfilePage';
import { useNavigate } from 'react-router-dom';
import { UploadButton } from './table-utils';

export default function HeaderAppBar() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingStudy, setUploadingStudy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const auth = useAuthCustom();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // Upload handlers
  const handleDicomUpload = async (filesArray, isStudy) => {
    if (!filesArray || filesArray.length === 0) {
      dispatch(setSnackbar({ open: true, message: "Please select a file or folder!", severity: "error" }));
      return;
    }
  
    try {
      const token = auth.tokens?.access_token;
      if (!token) throw new Error("User is not authenticated");

      if (isStudy) {
        console.log("Uploading study...");
        setUploadingStudy(true);
      }
      else{
        setUploading(true);
      }
  
      const formData = new FormData();
      for (const file of filesArray) {
        formData.append("files", file, file.webkitRelativePath || file.name);
      }
  
      const response = await fetch(`${API_BASE_URL}/api/upload-dicom`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.error || "Upload failed");
  
      dispatch(setSnackbar({ open: true, message: result.message || "Upload successful!", severity: "success" }));
      setTimeout(() => dispatch(triggerRefresh()), 1000);
  
    } catch (error) {
      dispatch(setSnackbar({ open: true, message: error.message, severity: "error" }));
    } finally {
      setUploading(false);
      setUploadingStudy(false);
    }
  };

  // Menu handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
    handleMenuClose();
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleLogout = () => {
    auth.logout(); 
    dispatch(setSnackbar({ open: true, message: "Logged out successfully!", severity: "success" }));
    handleMenuClose();
  };

  // Side drawer content
  const drawerContent = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Yantra Health
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/app')}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Go Back to Dashboard" />
        </ListItem>
        <ListItem button onClick={handleProfileOpen}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {auth.user && (
          <Typography variant="body2" color="text.secondary">
            Logged in as: {auth.user.username || "User"}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // Menu components
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id="profile-menu"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { mt: 1, width: 200 }
      }}
    >
      <MenuItem onClick={handleProfileOpen}>
        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={handleLogout}
        sx={{
          color: 'white',
          backgroundColor: 'rgb(230, 3, 3)',
          '&:hover': {
            background: 'linear-gradient(270deg, rgb(230, 3, 3), rgb(0, 0, 0))',
          },
        }}
      >
        <ListItemIcon sx={{ color: 'white' }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>

    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="mobile-menu"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {auth.isGuest ? (
        <>
        <MenuItem onClick={auth.login}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              fontWeight: 'bold',
              background: "#fc3003",
              "&:hover": {
                background: "linear-gradient(270deg,rgb(230, 3, 3), rgb(0, 89, 255))"
              },
            }}
          >
            Sign In
          </Button>
        </MenuItem>
        <MenuItem onClick={auth.logout}>
          <Button
            variant="contained"
            onClick={auth.logout}
            sx={{
              fontWeight: 'bold',
              background: "rgba(235, 0, 0, 0.85)",
              "&:hover": {
                  background: "linear-gradient(270deg,rgba(196, 8, 8, 0.85), rgb(0, 0, 0))"
              },
            }}
            >
                Log Out
          </Button>
        </MenuItem>
        </>
      ) : (
        <>
          <MenuItem>
          <UploadButton 
            uploading={uploading}
            onUpload={handleDicomUpload}
          />
          </MenuItem>
          <MenuItem>
            <UploadButton 
              isStudy={true} 
              uploading={uploading}
              onUpload={handleDicomUpload}
            />
          </MenuItem>
          <MenuItem onClick={handleProfileOpen}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              color: 'white',
              backgroundColor: 'rgb(230, 3, 3)',
              '&:hover': {
                background: 'linear-gradient(270deg, rgb(230, 3, 3), rgb(0, 0, 0))',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>

        </>
      )}
    </Menu>
  );

  return (
    <>
      <AppBar position="static" elevation={2} sx={{ background: 'primary' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
          >
            Yantra Health
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Desktop actions */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {auth.isGuest ? (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={auth.login}
                  sx={{
                    fontWeight: 'bold',
                    background: "#fc3003",
                    "&:hover": {
                      background: "linear-gradient(270deg,rgb(230, 3, 3), rgb(0, 89, 255))"
                    },
                  }}
                >
                  Sign In
                </Button>
                
                <Button
                variant="contained"
                onClick={auth.logout}
                sx={{
                  fontWeight: 'bold',
                  background: "rgba(235, 0, 0, 0.85)",
                  "&:hover": {
                    background: "linear-gradient(270deg,rgba(196, 8, 8, 0.85), rgb(0, 0, 0))"
                  },
                }}
              >
                Log Out
              </Button>
              <UploadButton 
                uploading={uploading}
                onUpload={handleDicomUpload}
              />
            </Stack>
            ) : (
              <>
                <UploadButton 
                  uploading={uploading}
                  onUpload={handleDicomUpload}
                />
                <UploadButton 
                  isStudy={true}
                  uploading={uploading}
                  onUpload={handleDicomUpload}
                />
                <Tooltip title="Account">
                  <IconButton
                    edge="end"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                    sx={{ ml: 1 }}
                  >
                    {auth.user?.avatar ? (
                      <Avatar 
                        src={auth.user.avatar} 
                        alt={auth.user.username || "User"}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircle />
                    )}
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          
          {/* Mobile actions */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="mobile-menu"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {renderMobileMenu}
      {renderMenu}
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
      
      <Dialog 
        open={profileOpen} 
        onClose={handleProfileClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 0 }}>
          <ProfilePage onClose={handleProfileClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// import * as React from 'react';
// import { styled, alpha } from '@mui/material/styles';
// import { useState } from 'react';
// import { Button, AppBar, Box, Toolbar, IconButton, Typography, InputBase, Badge, MenuItem, Menu, Snackbar, Alert } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import AccountCircle from '@mui/icons-material/AccountCircle';
// import MailIcon from '@mui/icons-material/Mail';
// import NotificationsIcon from '@mui/icons-material/Notifications';
// import MoreIcon from '@mui/icons-material/MoreVert';
// import MenuIcon from '@mui/icons-material/Menu';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { Search, SearchIconWrapper, StyledInputBase } from './search-bar-utils';
// import { useAuthCustom } from '../../hooks/useAuthCustom';
// import { triggerRefresh } from '../../redux/slices/dicomDataSlice';
// import { useDispatch } from 'react-redux';
// import { useSelector } from 'react-redux';
// import { setSnackbar } from '../../redux/slices/snackbarSlice';


// // For the actual input functionality of the Upload Dicom File button. The Button component itself renders the button,
// // while this VisuallyHiddenInput thing provides the functionality, like opening the file picker to upload files.
// // It's like the <input type="file"/> element in HTML, just that this element changes appearance in different browsers,
// // so we do it the Material UI way.
// const VisuallyHiddenInput = styled('input')({
//   clip: 'rect(0 0 0 0)',
//   clipPath: 'inset(50%)',
//   height: 1,
//   overflow: 'hidden',
//   position: 'absolute',
//   bottom: 0,
//   left: 0,
//   whiteSpace: 'nowrap',
//   width: 1,
// });

// export default function HeaderAppBar() {
//   const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [uploadingStudy, setUploadingStudy] = useState(false);
//   const auth = useAuthCustom();
//   const dispatch = useDispatch();

//   React.useEffect(() => {
//     console.log("selectedFile state changed, "+ (selectedFile ? "file present" : "file not present"));
//     console.log(auth.user?.username);
//     console.log(auth.user);
//   }, [selectedFile]); 

//   const handleDicomUpload = async (filesArray) => {
//     if (!filesArray || filesArray.length === 0) {
//       dispatch(setSnackbar({ open: true, message: "Please select a file or folder!", severity: "error" }));
//       return;
//     }
  
//     try {
//       const token = auth.tokens.access_token;
//       if (!token) throw new Error("User is not authenticated");
//       setUploading(false);
  
//       const formData = new FormData();
//       for (const file of filesArray) {
//         formData.append("files", file, file.webkitRelativePath || file.name); // smart fallback
//       }
  
//       const response = await fetch(`${API_BASE_URL}/api/upload-dicom`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });
  
//       const result = await response.json();
  
//       if (!response.ok) throw new Error(result.error || "Upload failed");
  
//       dispatch(setSnackbar({ open: true, message: result.message || "Upload successful!", severity: "success" }));
//       setTimeout(() => dispatch(triggerRefresh()), 1000);
  
//     } catch (error) {
//       dispatch(setSnackbar({ open: true, message: error.message, severity: "error" }));
//     } finally {
//       setUploading(false);
//       setUploadingStudy(false);
//     }
//   };
  
//   const isMenuOpen = Boolean(anchorEl);
//   const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

//   const handleProfileMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMobileMenuClose = () => {
//     setMobileMoreAnchorEl(null);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     handleMobileMenuClose();
//   };

//   const handleMobileMenuOpen = (event) => {
//     setMobileMoreAnchorEl(event.currentTarget);
//   };

//   // Upload Button to use for both the mobile menu and the desktop menu.
//   const uploadButton = (
//     <Button
//       component="label"
//       variant="contained"
//       startIcon={<CloudUploadIcon />}
//       sx={{
//         "@keyframes gradientShift": {
//           "0%": {
//             backgroundPosition: "0% 50%",
//           },
//           "100%": {
//             backgroundPosition: "100% 50%",
//           }
//         },
//         "&:hover": {
//           background: "linear-gradient(270deg, #fc3003, rgb(0, 89, 255))",
//         },
//         background: uploading
//           ? "linear-gradient(270deg, #fc3003, rgb(0, 89, 255), rgb(15, 1, 92))"
//           : "#fc3003",
//         backgroundSize: uploading ? "300% 300%" : "auto",
//         animation: uploading ? "gradientShift 1s infinite linear" : "none",
//         willChange: uploading ? "background-position" : "auto",
//         transition: "background 0.2s ease-in-out",
//       }}
//     >
//       {uploading ? "Uploading..." : "Upload DICOM Files"}
//       <input
//         type="file"
//         multiple
//         hidden
//         onChange={(event) => {
//           const files = Array.from(event.target.files);
//           if (files.length > 0) {
//             handleDicomUpload(files);
//             setUploading(true);
//             event.target.value = null; // Reset the input value to allow re-uploading the same file
//           }
//         }}
//       />
//     </Button>
//   );  

//   const uploadStudyButton = (
//     <Button
//       component="label"
//       variant="contained"
//       startIcon={<CloudUploadIcon />}
//       sx={{
//         "&:hover": {
//           background: "linear-gradient(270deg, #fc3003, rgb(0, 89, 255))"
//         },
//         background: uploadingStudy
//           ? "linear-gradient(270deg, #fc3003, rgb(0, 89, 255), rgb(15, 1, 92))"
//           : "#fc3003",
//         backgroundSize: uploadingStudy ? "300% 300%" : "auto",
//         animation: uploadingStudy ? "gradientShift 0.3s infinite linear" : "none",
//         transition: "background 0.2s ease-in-out",
//       }}
//     >
//       {uploadingStudy ? "Uploading..." : "Upload DICOM Study"}
//       <input
//         type="file"
//         webkitdirectory="true"
//         directory="true"
//         multiple
//         hidden
//         onChange={(event) => {
//           const files = Array.from(event.target.files);
//           if (files.length > 0) {
//             handleDicomUpload(files);
//             setUploadingStudy(true);
//           }
//         }}
//       />
//     </Button>
//   );

//   const logoutButton = (
//     <Button
//       component="label"
//       variant="contained"
//       onClick={() => {
//         auth.logout(); 
//         dispatch(setSnackbar({ open: true, message: "Logged out successfully!", severity: "success" }));
//       }}
//       sx={{
//         "&:hover": {
//           background: "linear-gradient(270deg,rgb(230, 3, 3), rgb(0, 0, 0))"
//         },
//         background: "rgb(230, 3, 3)",
//         backgroundSize: uploadingStudy ? "300% 300%" : "auto",
//         animation: uploadingStudy ? "gradientShift 0.3s infinite linear" : "none",
//         transition: "background 0.2s ease-in-out",
//       }}
//     >
//       Log Out
//     </Button>
//   );

//   const signInForGuestButton = (
//     <Box
      
//     >
//       <Button
//         variant="contained"
//         onClick={auth.login} // 👈 your existing normal login redirect
//         sx={{
//           fontWeight: 'bold',
//           boxShadow: 3,
//           borderRadius: 2,
//           "&:hover": {
//             background: "linear-gradient(270deg,rgb(230, 3, 3), rgb(0, 89, 255))"
//           },
//           background: "rgb(230, 3, 3)",
//         }}
//       >
//         Sign in to Upload or Delete Files
//       </Button>
//     </Box>
//   );

//   const menuId = 'primary-search-account-menu';
//   const renderMenu = (
//     <Menu
//       anchorEl={anchorEl}
//       anchorOrigin={{
//         vertical: 'top',
//         horizontal: 'right',
//       }}
//       id={menuId}
//       keepMounted
//       transformOrigin={{
//         vertical: 'top',
//         horizontal: 'right',
//       }}
//       open={isMenuOpen}
//       onClose={handleMenuClose}
//     >
//       <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
//       <MenuItem onClick={handleMenuClose}>My account</MenuItem>
//       <Box
//         sx={{
//           width: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           p: 1,
//         }}
//       >
//         {logoutButton}
//       </Box>
//     </Menu>
//   );
  

//   const mobileMenuId = 'primary-search-account-menu-mobile';
//   // This is for a mobile phone size screen. It defines a small three-dot menu to render when the screen is small enough.
//   const renderMobileMenu = (
//     <Menu
//       anchorEl={mobileMoreAnchorEl}
//       anchorOrigin={{
//         vertical: 'top',
//         horizontal: 'right',
//       }}
//       id={mobileMenuId}
//       keepMounted
//       transformOrigin={{
//         vertical: 'top',
//         horizontal: 'right',
//       }}
//       open={isMobileMenuOpen}
//       onClose={handleMobileMenuClose}
//     >
//       <MenuItem onClick={handleProfileMenuOpen}>
//         <IconButton
//           size="large"
//           aria-label="account of current user"
//           aria-controls="primary-search-account-menu"
//           aria-haspopup="true"
//           color="inherit"
//         >
//           <AccountCircle />
//         </IconButton>
//         <p>Profile</p>
//       </MenuItem>
//       <MenuItem onClick={handleProfileMenuOpen}>
//       {auth.isGuest ? (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           {signInForGuestButton}
//         </Box>
//       ) : (<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//         {uploadButton}
//         {uploadStudyButton}
//       </Box>)}
//       </MenuItem>
//     </Menu>
//   );

//   // AppBar: A navigation bar that sticks to the top.
//   // Toolbar: To arrange the items horizontally, arranges elements inside the AppBar.
//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       <AppBar position="static">
//         <Toolbar>
//           <IconButton
//             size="large"
//             edge="start"
//             color="inherit"
//             aria-label="open drawer"
//             sx={{ mr: 2 }}
//           >
//             <MenuIcon />
//           </IconButton>
//           {/* display: { xs: 'none', sm: 'block' }: xs: 'none' → Hides it on very small screens.
//           sm: 'block' → Shows it on small screens and larger. */}
//           <Typography
//             variant="h6"
//             noWrap
//             component="div"
//             sx={{ display: { xs: 'none', sm: 'block' } }}
//           >
//             Yantra Health
//           </Typography>
//           {/* This Box element below is to create a space between the search bar and the notification and profile buttons
//           and all. It pushes the items to the right, and flexGrow: 1 takes up all available space, ensuring elements 
//           on the right stay aligned. */}
//           <Box sx={{ flexGrow: 1 }} />
//           <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
//           {auth.isGuest ? (
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               {signInForGuestButton}
//             </Box>
//           ) : (<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             {uploadButton}
//             {uploadStudyButton}
//           </Box>)}
//             <IconButton
//               size="large"
//               edge="end"
//               aria-label="account of current user"
//               aria-controls={menuId}
//               aria-haspopup="true"
//               onClick={handleProfileMenuOpen}
//               color="inherit"
//             >
//               <AccountCircle />
//             </IconButton>
//           </Box>
//           <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
//             <IconButton
//               size="large"
//               aria-label="show more"
//               aria-controls={mobileMenuId}
//               aria-haspopup="true"
//               onClick={handleMobileMenuOpen}
//               color="inherit"
//             >
//               <MoreIcon />
//             </IconButton>
//           </Box>
//         </Toolbar>
//       </AppBar>
//       {renderMobileMenu}
//       {renderMenu}
//     </Box>
//   );
// }