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
              uploading={uploadingStudy}
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
            </Stack>
            ) : (
              <>
                <UploadButton 
                  uploading={uploading}
                  onUpload={handleDicomUpload}
                />
                <UploadButton 
                  isStudy={true}
                  uploading={uploadingStudy}
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