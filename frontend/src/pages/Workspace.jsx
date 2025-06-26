import React from 'react';
import { PatientTable, HeaderAppBar, PatientDetails } from '../components/workspace-components';
import { Stack, Box } from '@mui/material';

function Workspace() {

  return (
    <Box sx={{ width: '100%', bgcolor: '#660033' }}>
      <Stack>
        {/* <HeaderAppBar/> */}
        <PatientTable/>
        {/* <PatientDetails/> */}
      </Stack>
    </Box>
  );
}

export default Workspace;
