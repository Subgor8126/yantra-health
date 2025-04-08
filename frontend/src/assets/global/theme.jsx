import { createTheme } from '@mui/material/styles';
import "@fontsource/kanit"; // Import Kanit font
import "@fontsource/manrope"; // Import Manrope font

const theme = createTheme({
  palette: {
    primary: {
      main: '#960527', // Custom primary color
    },
    secondary: {
      main: '#4caf50', // Custom secondary color
    },
    background: {
      default: '#121212', // Dark background (for dark mode vibes)
      paper: '#1e1e1e', // Background for Paper components
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#aaaaaa', // Light gray text
    },
    button:{
      primary: '#960527', // Custom primary color
      secondary: '#4caf50', // Custom secondary color
    }
  },
  typography: {
    fontFamily: 'Manrope, Arial, sans-serif',
    fontSize: 14,
    button: {
      textTransform: 'none', // Prevents uppercase button text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          padding: "10px 20px",
          textTransform: "none",
          background: "#960527",
          color: "#ffffff",
          // transition: "0.4s ease-in",
          "&:hover": {
            background: "linear-gradient(135deg, #7c041f 30%, #b71c4b 100%)",
          },
        },
      },
    },
  },
});

export default theme;