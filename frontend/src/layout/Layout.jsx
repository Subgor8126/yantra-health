// src/layout/Layout.jsx
import React from 'react';
import HeaderAppBar from '../components/workspace-components/HeaderAppBar';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <HeaderAppBar />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet /> {/* 👈 This is where your nested page (AppHome, Workspace, etc.) will render */}
      </Box>
    </Box>
  );
};

export default Layout;