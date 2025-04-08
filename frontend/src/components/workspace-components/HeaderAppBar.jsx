import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Button, AppBar, Box, Toolbar, IconButton, Typography, InputBase, Badge, MenuItem, Menu, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import MenuIcon from '@mui/icons-material/Menu';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Search, SearchIconWrapper, StyledInputBase } from './search-bar-utils';
import { useAuth } from 'react-oidc-context';
import { triggerRefresh } from '../../redux/slices/dicomDataSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setSnackbar } from '../../redux/slices/snackbarSlice';


// For the actual input functionality of the Upload Dicom File button. The Button component itself renders the button,
// while this VisuallyHiddenInput thing provides the functionality, like opening the file picker to upload files.
// It's like the <input type="file"/> element in HTML, just that this element changes appearance in different browsers,
// so we do it the Material UI way.
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function HeaderAppBar() {
  const API_BASE_URL = import.meta.env.API_URL || "http://localhost:8000";
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const auth = useAuth();
  const dispatch = useDispatch();
  const snackbar = useSelector((state) => state.snackbar?.snackbarState || { open: false, message: '', severity: 'success' });

  React.useEffect(() => {
    console.log("selectedFile state changed, "+ (selectedFile ? "file present" : "file not present"));
  }, [selectedFile]);

  const handleDicomFileUpload = async (selectedFile) => {
    if (!selectedFile) {
        dispatch(setSnackbar({ open: true, message: "Please select a file first!", severity: "error" }))
        return;
    }

    // if (selectedFile.name.split('.')[1] !== 'dcm') {
    //     setSnackbar({ open: true, message: "Unsupported file format, please select a DICOM file!", severity: "error" });
    //     return;
    // }

    console.log("handleDicomFileUpload called");
    console.log(selectedFile ? "file present" : "file not present");

    setUploading(true);
    dispatch(setSnackbar({ open: false, message: "", severity: "success" }));
    console.log("uploading:"+uploading);
    console.log("snackbar:"+snackbar);

    try {
        console.log("try block");
        const token = auth.user?.access_token;
        console.log("token: "+token);
        if (!token) throw new Error("User is not authenticated");
        console.log("trying upload with token: "+token);

        const formData = new FormData();
        formData.append("file", selectedFile);
        // binary data needs to be sent as FormData, not JSON, so

        // This just sends the file to the parse-dicom api route which returns some important info about the file, just
        // like the PatientID, etc. This is important because we send the PatientID to the upload-dicom route to store the
        // file in the bucket at <bucket-name>/<user-id>/<patient-id>/<filename>.dcm
        const dicomFileParseResponse = await fetch(`${API_BASE_URL}/api/parse-dicom`, {
          method: "POST",
          body: formData
        })

        const dicomData = await dicomFileParseResponse.json(); 
        console.log(dicomData.data);
        

        const response = await fetch(`${API_BASE_URL}/api/upload-dicom`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ 
              filename: selectedFile.name,
              patient_id: dicomData.data.PatientID,
           }),
        });

        if (!response.ok) throw new Error("Failed to get pre-signed URL");
        const { upload_url } = await response.json();

        const uploadResponse = await fetch(upload_url, {
            method: "PUT",
            body: selectedFile,
            headers: { "Content-Type": "application/dicom" },
            mode: "cors"  // This is important, it tells the browser that you're making a cross-origin request
        })

        if (!uploadResponse.ok) throw new Error("File upload failed");

        //
        setSelectedFile(null);

        dispatch(setSnackbar({ open: true, message: "File uploaded successfully! Updating Patient Table", severity: "success" }));

        setTimeout(() => {
          dispatch(triggerRefresh());
        }, 4000); // 4000ms = 4 seconds
        

    } catch (error) {
      console.log("error block with error: "+error.message);
        dispatch(setSnackbar({ open: true, message: error.message, severity: "error" }));
    } finally {
      console.log("finally block");
      setUploading(false);
    }
  };

  const handleStudyFolderUpload = async (dir) => {
    if (!dir || dir.length === 0) {
        dispatch(setSnackbar({ open: true, message: "Please select a folder first!", severity: "error" }));
    }
    setUploading(true);

    

  }

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

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

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  // Upload Button to use for both the mobile menu and the desktop menu.
  const uploadButton = (
    <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            sx={{
              "&:hover": {
                background: "linear-gradient(270deg, #fc3003, rgb(0, 89, 255))"
              },
              background: uploading
                ? "linear-gradient(270deg, #fc3003, rgb(0, 89, 255), rgb(15, 1, 92))"
                : "#fc3003",
              backgroundSize: uploading ? "300% 300%" : "auto", // Increased speed by adjusting size
              animation: uploading ? "gradientShift 0.3s infinite linear" : "none", // Faster animation
              transition: "background 0.2s ease-in-out",
            }}            
          >
            {uploading ? "Uploading..." : "Upload DICOM File"}
          <VisuallyHiddenInput
              type="file"
              onChange={(event) => {
                const file = event.target.files[0];
                setSelectedFile(file);
                handleDicomFileUpload(file);
              }}
              multiple
          />
    </Button>
  )

  const uploadStudyButton = (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
      sx={{
        "&:hover": {
          background: "linear-gradient(270deg, #fc3003, rgb(0, 89, 255))"
        },
        background: uploading
          ? "linear-gradient(270deg, #fc3003, rgb(0, 89, 255), rgb(15, 1, 92))"
          : "#fc3003",
        backgroundSize: uploading ? "300% 300%" : "auto",
        animation: uploading ? "gradientShift 0.3s infinite linear" : "none",
        transition: "background 0.2s ease-in-out",
      }}
    >
      {uploading ? "Uploading..." : "Upload DICOM Study"}
      <VisuallyHiddenInput
        type="file"
        webkitdirectory=""
        directory="" // sometimes needed for cross-browser support
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files); // All files in the folder
          if (files.length > 0) {
            handleStudyFolderUpload(files); // New handler for processing folder upload
          }
        }}
      />
    </Button>
  );  

  const mobileMenuId = 'primary-search-account-menu-mobile';
  // This is for a mobile phone size screen. It defines a small three-dot menu to render when the screen is small enough.
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {uploadButton}
        {uploadStudyButton}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => dispatch(setSnackbar({ ...snackbar, open: false }))}>
          <Alert onClose={() => dispatch(setSnackbar({ ...snackbar, open: false }))} severity={snackbar.severity}>
               {snackbar.message}
          </Alert>
      </Snackbar>
      </MenuItem>
    </Menu>
  );

  // AppBar: A navigation bar that sticks to the top.
  // Toolbar: To arrange the items horizontally, arranges elements inside the AppBar.
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          {/* display: { xs: 'none', sm: 'block' }: xs: 'none' → Hides it on very small screens.
          sm: 'block' → Shows it on small screens and larger. */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Yantra Health
          </Typography>
          {/* <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search> */}
          {/* This Box element below is to create a space between the search bar and the notification and profile buttons
          and all. It pushes the items to the right, and flexGrow: 1 takes up all available space, ensuring elements 
          on the right stay aligned. */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {uploadButton}
            {uploadStudyButton}
          </Box>
              <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => dispatch(setSnackbar({ ...snackbar, open: false }))}>
                <Alert onClose={() => dispatch(setSnackbar({ ...snackbar, open: false }))} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
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
    </Box>
  );
}