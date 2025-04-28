import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// mui imports
import { 
  Box, 
  TableRow, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  IconButton, 
  Typography, 
  LinearProgress,
  Chip,
  Tooltip,
  InputBase,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
// redux imports
import { useDispatch, useSelector } from 'react-redux';
import { setPatient } from '../../redux/slices/patientDataSlice';
import { setDicomData, triggerRefresh } from '../../redux/slices/dicomDataSlice';
import { setSnackbar } from '../../redux/slices/snackbarSlice';
// util imports
import { handleDicomDataFetching } from './table-utils';
import { handleDicomDelete } from './table-utils';
import DeleteDialog from './table-utils/DeleteDialog';
import { formatName, formatDate } from './table-utils';
// auth imports
import { useAuthCustom } from '../../hooks/useAuthCustom';

const isAuthGuest = localStorage.getItem('isGuest') === 'true';

const baseColumns = [
  { id: 'PatientID', label: 'Patient ID', minWidth: 50, align: 'left', sortable: true },
  { id: 'PatientName', label: 'Patient Name', minWidth: 50, align: 'left', sortable: true },
  { id: 'PatientSex', label: 'Sex', minWidth: 30, align: 'center', sortable: true },
  {
    id: 'NumberOfInstances',
    label: 'Images',
    minWidth: 30,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
    sortable: true
  },
  {
    id: 'Modality',
    label: 'Modality',
    minWidth: 40,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
    sortable: true
  },
  {
    id: 'AccessionNumber',
    label: 'Accession #',
    minWidth: 40,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
    sortable: true
  },
  {
    id: 'BodyPartExamined',
    label: 'Body Part',
    minWidth: 40,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
    sortable: true
  },
  {
    id: 'StudyDate',
    label: 'Study Date',
    minWidth: 40,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
    sortable: true
  }
];

const columns = isAuthGuest
  ? baseColumns
  : [...baseColumns, {
      id: 'Actions',
      label: 'Actions',
      minWidth: 40,
      align: 'center',
      sortable: false
    }];

// Modality color mapping
const modalityColors = {
  CT: 'primary',
  MR: 'secondary',
  XR: 'success',
  US: 'info',
  NM: 'warning',
  PT: 'error',
  DX: 'default'
};

// Helper function to get modality color
const getModalityColor = (modality) => {
  return modalityColors[modality] || 'default';
};

function PatientTable() {
  const auth = useAuthCustom();
  const userId = auth.userId;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Redux state
  const rows = useSelector((state) => state.dicomData.dicomData);
  const dicomDataRefresh = useSelector((state) => state.dicomData.refreshTable);

  // Table handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenDeleteDialog = (event, fileKey) => {
    console.log("FileKey to be deleted: ", fileKey);
    event.stopPropagation(); // to stop the click from being interpreted as a click on the entire row
    setSelectedFileKey(fileKey);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    if (selectedFileKey) {
      try {
        const deleteResponse = await handleDicomDelete(userId, selectedFileKey);
        
        if (deleteResponse?.DeleteText) {
          dispatch(setSnackbar({ open: true, message: deleteResponse.DeleteText, severity: "success" }));
          dispatch(triggerRefresh());
        } else if (deleteResponse?.message) {
          dispatch(setSnackbar({ open: true, message: deleteResponse.message, severity: "error" }));
        }
      } catch (error) {
        dispatch(setSnackbar({ open: true, message: error.message, severity: "error" }));
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedFileKey(null);
    dispatch(setSnackbar({ open: true, message: "Delete operation cancelled", severity: "info" }));
  };

  // Filter handlers
  const handleFilterOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const toggleFilter = (filterValue) => {
    setActiveFilters(prev => {
      if (prev.includes(filterValue)) {
        return prev.filter(f => f !== filterValue);
      }
      return [...prev, filterValue];
    });
    handleFilterClose();
  };

  const clearFilters = () => {
    setActiveFilters([]);
    handleFilterClose();
  };

  // Sort handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // View study handler
  const handleViewStudy = (row) => {
    dispatch(setPatient(row));
    navigate(`/app/workspace/${row.PatientID}`);
  };

  // Data fetching
  useEffect(() => {
    if (!userId) return;
  
    const fetchData = async () => {
      setLoading(true);
  
      const fetchedData = await handleDicomDataFetching(userId);
  
      if (fetchedData.length === 0) {
        setDataExists(false);
      } else {
        setDataExists(true);
      }
      dispatch(setDicomData(fetchedData));
  
      setLoading(false);
    };
  
    fetchData();
  }, [dicomDataRefresh, userId, dispatch]);

  // Filter and sort data
  const filteredAndSortedData = React.useMemo(() => {
    // First, filter the data
    let filteredData = [...rows].filter(row => {
      // Apply search term filter
      const matchesSearch = Object.values(row).some(
        value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Apply active filters
      const matchesFilters = activeFilters.length === 0 || 
        activeFilters.some(filter => row.Modality === filter);
      
      return matchesSearch && matchesFilters;
    });
    
    // Then, sort the filtered data
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle special cases for formatting
        if (sortConfig.key === 'PatientName') {
          aValue = formatName(aValue);
          bValue = formatName(bValue);
        } else if (sortConfig.key === 'StudyDate') {
          // Ensure dates are compared correctly
          return sortConfig.direction === 'asc' 
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  }, [rows, searchTerm, activeFilters, sortConfig]);

  // Get unique modalities for filter menu
  const uniqueModalities = React.useMemo(() => {
    return [...new Set(rows.map(row => row.Modality))].filter(Boolean);
  }, [rows]);

  // Refresh button handler
  const handleRefresh = () => {
    dispatch(triggerRefresh());
    dispatch(setSnackbar({ open: true, message: "Refreshing DICOM data...", severity: "info" }));
  };

  // Check if there are search/filter/sort active
  const hasActiveFiltersOrSearch = searchTerm !== '' || activeFilters.length > 0;

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: 'background.paper'
      }}
    >
      {/* Table toolbar with search and filters */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: '1px solid rgba(224, 224, 224, 1)' 
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Patient Studies
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Paper
            component="form"
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center', 
              width: 250,
              borderRadius: 2
            }}
            elevation={1}
          >
            <InputBase
              sx={{ ml: 1, flex: 1}}
              placeholder="Search patient studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="button" sx={{ p: '10px', color:'white' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          
          <Tooltip title="Filter by modality">
            <IconButton onClick={handleFilterOpen} sx={{ color: 'white' }}>
              <FilterListIcon />
              {activeFilters.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {activeFilters.length}
                </Box>
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 2,
            gap: 2,
          }}
        >
          <LinearProgress 
            sx={{ 
              width: '300px', 
              mb: 2,
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255, 99, 9, 0.1)',
              '.MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, rgb(255, 99, 9) 30%, rgb(102, 8, 82) 90%)',
              }
            }} 
          />
          <Typography variant="h6" color="text.primary">
            Please Wait, Fetching DICOM Data...
          </Typography>
        </Box>
      ) : dataExists ? (
        <>
          {/* Filter indicators */}
          {hasActiveFiltersOrSearch && (
            <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'background.default' }}>
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
              
              {searchTerm && (
                <Chip 
                  label={`Search: "${searchTerm}"`} 
                  size="small" 
                  onDelete={() => setSearchTerm('')}
                />
              )}
              
              {activeFilters.map((filter) => (
                <Chip 
                  key={filter}
                  label={filter} 
                  size="small" 
                  color={getModalityColor(filter)}
                  onDelete={() => toggleFilter(filter)}
                />
              ))}
              
              {hasActiveFiltersOrSearch && (
                <Button size="small" onClick={() => {
                  setSearchTerm('');
                  setActiveFilters([]);
                }}>
                  Clear All
                </Button>
              )}
            </Box>
          )}
          
          <TableContainer sx={{ maxHeight: hasActiveFiltersOrSearch ? '64vh' : '70vh' }}>
            <Table stickyHeader aria-label="patient studies table">
              <TableHead>
                <TableRow>
                  
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        bgcolor: 'background.default',
                        fontWeight: "bold",
                        cursor: column.sortable ? 'pointer' : 'default',
                        '&:hover': column.sortable ? {
                          bgcolor: 'action.hover'
                        } : {}
                      }}
                      onClick={() => column.sortable && requestSort(column.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: column.align === 'center' ? 'center' : 'flex-start' }}>
                        {column.label}
                        {column.sortable && sortConfig.key === column.id && (
                          <SortIcon 
                            fontSize="small" 
                            sx={{ 
                              ml: 0.5,
                              transform: sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none'
                            }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.FileKey}
                        onClick={() => handleViewStudy(row)}
                        sx={{
                          transition: "background 0.3s ease",
                          background: 'primary',
                          "&:hover": {
                            background: "linear-gradient(90deg, rgba(15, 2, 73, 0.68) 0%, rgba(122, 4, 30, 0.66) 100%)",
                            cursor: "pointer",
                          },
                        }}
                      >
                        
                        {columns.map((column) => {
                          const value = row[column.id];
                          
                          if (column.id === "Actions") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                  <Tooltip title="View Study Details">
                                    <IconButton 
                                      size="small" 
                                      color="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewStudy(row);
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="Delete Study">
                                    <IconButton 
                                      size="small"
                                      color="text.primary"
                                      onClick={(e) => {
                                          handleOpenDeleteDialog(e, row.FileKey);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            );
                          }

                          let displayValue = value;
                          let chipColor;

                          // Format specific columns
                          if (column.id === "PatientName") {
                            displayValue = formatName(value);
                          } else if (column.id === "StudyDate") {
                            displayValue = formatDate(value);
                          } else if (column.id === "PatientSex") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <Tooltip title={value === 'M' ? 'Male' : value === 'F' ? 'Female' : 'Other/Unknown'}>
                                  {value === 'M' ? (
                                    <MaleIcon color="primary" />
                                  ) : value === 'F' ? (
                                    <FemaleIcon sx={{ color: 'rgb(215, 42, 94)' }} />
                                  ) : (
                                    <Typography>{value || '—'}</Typography>
                                  )}
                                </Tooltip>
                              </TableCell>
                            );
                          } else if (column.id === "Modality") {
                            chipColor = getModalityColor(value);
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <Chip 
                                  label={value || '—'} 
                                  size="small" 
                                  color={chipColor}
                                />
                              </TableCell>
                            );
                          } else if (column.format && typeof value === "number") {
                            displayValue = column.format(value);
                          }

                          return (
                            <TableCell key={column.id} align={column.align}>
                              {displayValue || '—'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredAndSortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
              borderTop: '1px solid rgba(224, 224, 224, 1)',
              '.MuiTablePagination-selectIcon': { color: 'primary.main' }
            }}
          />
          
          {/* Delete Confirmation Dialog */}
          <DeleteDialog 
            open={deleteDialogOpen} 
            onConfirm={handleConfirmDelete} 
            onCancel={handleCancelDelete} 
          />
        </>
      ) : (
        <Box
          sx={{
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 2,
            gap: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Card 
            elevation={2} 
            sx={{ 
              maxWidth: 400, 
              width: '100%',
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                No DICOM Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload DICOM files to view and analyze your studies.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<CloudDownloadIcon />}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, rgb(255, 99, 9) 30%, rgb(102, 8, 82) 90%)',
                }}
              >
                Upload DICOM Files
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Paper>
  );
}

export default PatientTable;

// import React from 'react';
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// // mui imports
// import { Box, TableRow, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, IconButton, Typography, LinearProgress } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// // redux imports
// import { useDispatch, useSelector } from 'react-redux';
// import { setPatient } from '../../redux/slices/patientDataSlice';
// import { setDicomData } from '../../redux/slices/dicomDataSlice';
// import { triggerRefresh } from '../../redux/slices/dicomDataSlice';
// // util imports
// import { handleDicomDataFetching } from './table-utils';
// import { handleDicomDelete } from './table-utils';
// import DeleteDialog from './table-utils/DeleteDialog';
// import { formatName, formatDate } from './table-utils';
// // auth imports
// import { useAuthCustom } from '../../hooks/useAuthCustom';
// import { setSnackbar } from '../../redux/slices/snackbarSlice';

// const isAuthGuest = localStorage.getItem('isGuest') === 'true';

// const baseColumns = [
//   { id: 'PatientID', label: 'Patient\u00a0ID', minWidth: 50, align: 'center' },
//   { id: 'PatientName', label: 'Patient\u00a0Name', minWidth: 50, align: 'center' },
//   { id: 'PatientSex', label: 'Patient\u00a0Sex', minWidth: 50, align: 'center' },
//   {
//     id: 'NumberOfInstances',
//     label: 'Number\u00a0of\u00a0Instances',
//     minWidth: 100,
//     align: 'center',
//     format: (value) => value.toLocaleString('en-US'),
//   },
//   {
//     id: 'Modality',
//     label: 'Modality',
//     minWidth: 100,
//     align: 'center',
//     format: (value) => value.toLocaleString('en-US'),
//   },
//   {
//     id: 'AccessionNumber',
//     label: 'Accession\u00a0Number',
//     minWidth: 100,
//     align: 'center',
//     format: (value) => value.toLocaleString('en-US'),
//   },
//   {
//     id: 'BodyPartExamined',
//     label: 'Body\u00a0Part\u00a0Examined',
//     minWidth: 100,
//     align: 'center',
//     format: (value) => value.toLocaleString('en-US'),
//   },
//   {
//     id: 'StudyDate',
//     label: 'Study\u00a0Date',
//     minWidth: 100,
//     align: 'center',
//     format: (value) => value.toLocaleString('en-US'),
//   }
// ];

// const columns = isAuthGuest
//   ? baseColumns
//   : [...baseColumns, {
//       id: 'DeleteStudyButton',
//       label: 'Delete\u00a0Study',
//       minWidth: 100,
//       align: 'center',
//     }];

// function PatientTable() {
//   const auth = useAuthCustom();
//   const userId = auth.userId
//   const navigate = useNavigate();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [selectedFileKey, setSelectedFileKey] = useState(null);
//   const [dataExists, setDataExists] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const dispatch = useDispatch();
//   const rows = useSelector((state) => state.dicomData.dicomData);
//   const dicomDataRefresh = useSelector((state) => state.dicomData.refreshTable);
//   // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   console.log("Here are the rowsVVVV")
//   console.log(rows)
//   console.log("User ID ist hier VVVV")
//   console.log(userId)

//   console.log("Here are the rows VVVVVVV")
//   console.log(rows)

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(+event.target.value);
//     setPage(0);
//   }; 

//   const handleOpenDeleteDialog = (event, fileKey) => {
//     event.stopPropagation(); // to stop the click on the delete button from being interpreted as a click on the entire row
//     setSelectedFileKey(fileKey);
//     setDeleteDialogOpen(true);
//   };

//   const handleConfirmDelete = async () => {
//     setDeleteDialogOpen(false);
//     if (selectedFileKey) {
//       console.log("Deleting file:", selectedFileKey);
//       // Call the actual delete function here
//       // await handleDicomDelete(selectedFileKey);
//       try {
//         const deleteResponse = await handleDicomDelete(userId, selectedFileKey);

//         console.log("HERE IS THE DELETE RESPONSE")
    
//         if (deleteResponse?.DeleteText) {
//           console.log(deleteResponse.DeleteText);
//           dispatch(setSnackbar({ open: true, message: deleteResponse.DeleteText, severity: "success" }));
//           dispatch(triggerRefresh());
//         } else if (deleteResponse?.message) {
//           dispatch(setSnackbar({ open: true, message: deleteResponse.message, severity: "error" }));
//         }
//       } catch (error) {
//         dispatch(setSnackbar({ open: true, message: error.message, severity: "error" }));
//       }
//     }
//   };

//   const handleCancelDelete = () => {
//     setDeleteDialogOpen(false);
//     setSelectedFileKey(null);
//     dispatch(setSnackbar({ open: true, message: "Delete operation cancelled", severity: "success" }))
//   };

//   useEffect(() => {
//       if (!userId) return;
    
//       const fetchData = async () => {
//         setLoading(true); // <-- start loading
    
//         const fetchedData = await handleDicomDataFetching(userId);
    
//         if (fetchedData.length === 0) {
//           setDataExists(false);
//         } else {
//           setDataExists(true);
//         }
//         dispatch(setDicomData(fetchedData));
    
//         setLoading(false); // <-- loading finished
//       };
    
//       fetchData();
//     }, [dicomDataRefresh, userId]);
  

//   return (
//     <Paper sx={{ width: '100%', overflow: 'hidden' }}>
//       {loading ? (
//       <Box
//         sx={{
//           height: '81vh',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           textAlign: 'center',
//           px: 2,
//           gap: 2,
//         }}
//       >
//         <LinearProgress sx={{ width: '300px', mb: 2 }} color="primary" />
//         <Typography variant="h6" color="text.primary">
//           Please Wait, Fetching DICOM Data...
//         </Typography>
//       </Box>
//     ) : dataExists ? (
//       <>
//       <TableContainer sx={{ maxHeight: '81vh', height: '81vh' }}>
//         <Table stickyHeader aria-label="sticky table">
//           <TableHead>
//             <TableRow>
//               {columns.map((column) => (
//                 <TableCell
//                 key={column.id}
//                 align={column.align || "left"}
//                 sx={{
//                   width: `${100 / columns.length}%`, // Distributes columns equally
//                   fontWeight: "bold",
//                 }}
//                 >
//                   {column.label}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {rows
//               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//               .map((row) => {
//                 return (
//                   <TableRow
//                     hover
//                     role="checkbox"
//                     tabIndex={-1}
//                     key={row.FileKey}
//                     onClick={() => {
//                       dispatch(setPatient(row)); // Store patient data in Redux
//                       navigate(`/app/workspace/${row.PatientID}`);
//                     }}
//                     sx={{
//                       transition: "background 0.4s ease-in-out", // Smooth transition
//                       background: "transparent", // Default background
//                       "&:hover": {
//                         background: "linear-gradient(90deg, rgba(150,5,39,0.2) 0%, rgba(215,42,94,0.3) 100%)",
//                         cursor: "pointer", // Change cursor on hover
//                       },
//                     }}
//                   >
//                     {columns.map((column) => {
//                       const value = row[column.id];
//                       // console.log(row)
//                       return (
//                         <TableCell key={column.id} align={column.align}>
//                           {(() => {
//                               if (column.id === "DeleteStudyButton") {
//                                 return (
//                                   <IconButton onClick={(event) => handleOpenDeleteDialog(event, row.FileKey)} color="error">
//                                     <DeleteIcon />
//                                   </IconButton>
//                                 );
//                               }

//                               let displayValue = value;

//                               if (column.id === "PatientName") {
//                                 displayValue = formatName(value);
//                               } else if (column.format && typeof value === "number") {
//                                 displayValue = column.format(value);
//                               } else if(column.id === "StudyDate"){
//                                 displayValue = formatDate(value);
//                               }

//                               return displayValue;
//                             })()}

//                           {/* The extra parentheses in your JSX {(() => { ... })()} are due to an Immediately Invoked Function Expression (IIFE) */}
//                           {/* (() => { ... }) → This is an arrow function with a block body. */}
//                           {/* (() => { ... })() → The final () at the end immediately invokes the function. */}
//                         </TableCell>
//                       );
//                     })}
//                   </TableRow>
//                 );
//               })}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <TablePagination
//         rowsPerPageOptions={[10, 25, 100]}
//         component="div"
//         count={rows.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//       />
//       <DeleteDialog 
//         open={deleteDialogOpen} 
//         onConfirm={handleConfirmDelete} 
//         onCancel={handleCancelDelete} 
//       />
      
//       </>
//       ) : (
//         <Box
//           sx={{
//             height: '81vh',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             textAlign: 'center',
//             px: 2,
//             gap: 2,
//           }}
//         >
//           <Typography variant="h6" color="text.primary">
//             No DICOM Data Available. Please upload to view studies.
//           </Typography>
//         </Box>
//       )}
//     </Paper>
//   );
// }

// export default PatientTable;