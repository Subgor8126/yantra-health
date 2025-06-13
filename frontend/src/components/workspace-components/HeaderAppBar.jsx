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
import { useFileUpload } from '../../hooks/useFileUpload'; // Import the custom hook
import { useDispatch } from 'react-redux';
import { setSnackbar } from '../../redux/slices/snackbarSlice';
import ProfilePage from './ProfilePage';
import { useNavigate } from 'react-router-dom';
import { UploadButton } from './table-utils';

export default function HeaderAppBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const auth = useAuthCustom();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Use the custom upload hook
  const { handleDicomUpload, uploading, uploadingStudy } = useFileUpload();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // Menu handlers (unchanged)
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

  // Rest of your component remains the same...
  // (drawerContent, renderMenu, renderMobileMenu, return statement)

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

  // Menu components (same as before, just using the hook's state)
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
      <AppBar position="static" elevation={2} sx={{ background: '#660033' }}>
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