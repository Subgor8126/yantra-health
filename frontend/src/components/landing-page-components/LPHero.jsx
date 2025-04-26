import { Box, Typography, Button, Container, InputLabel, Link, Stack, TextField } from "@mui/material";
import visuallyHidden from '@mui/utils/visuallyHidden';
import { styled } from '@mui/material/styles';
import StyledBox from "../../assets/lp/StyledBox";
import { useAuthCustom } from "react-oidc-context";

function LPHero(){
    const auth = useAuthCustom();

    return(
        <Box
    id="hero"
    sx={(theme) => ({
      width: '100%',
      backgroundRepeat: 'no-repeat',
      backgroundImage:
        'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
      ...theme.applyStyles('dark', {
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
      }),
    })}
  >
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: { xs: 14, sm: 20 },
        pb: { xs: 8, sm: 12 },
      }}
    >
      <Stack
        spacing={2}
        useFlexGap
        sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
      >
        <Typography
          variant="h1"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            fontSize: 'clamp(3rem, 10vw, 3.5rem)',
          }}
        >
          Yantra&nbsp;
          <Typography
            component="span"
            variant="h1"
            sx={(theme) => ({
              fontSize: 'inherit',
              color: 'primary.main',
              ...theme.applyStyles('dark', {
                color: 'primary.light',
              }),
            })}
          >
            Health
          </Typography>
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            width: { sm: '100%', md: '80%' },
          }}
        >
          A modern DICOM file management platform with AI-powered analysis, real-time processing, 
          and an intuitive dashboard for viewing, organizing, and diagnosing medical images efficiently.
        </Typography>
          <Button
            onClick={() => auth.signinRedirect()}
            variant="contained"
            color="primary"
            size="small"
            sx={{ minWidth: 'fit-content' }}
          >
            Sign Up
          </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
        </Typography>
      </Stack>
    </Container>
  </Box>
    )
}

export default LPHero;