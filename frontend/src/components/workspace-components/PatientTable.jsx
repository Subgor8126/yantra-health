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
  ListItemIcon,
  Skeleton
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
import { formatName, formatDate, formatAge } from './table-utils';
// auth imports
import { useAuthCustom } from '../../hooks/useAuthCustom';
import { removeLSItemsByPrefix } from './table-utils';

const isAuthGuest = localStorage.getItem('isGuest') === 'true';

// Defines the columns for the patient table
const baseColumns = [
  { id: 'patient_id', label: 'Patient ID', minWidth: 50, align: 'left', sortable: true },
  { id: 'name', label: 'Patient Name', minWidth: 50, align: 'left', sortable: true },
  { id: 'sex', label: 'Patient Sex', minWidth: 30, align: 'center', sortable: true },
  { id: 'age', label: 'Patient Age', minWidth: 30, align: 'center', sortable: true },
  { id: 'ethnicity', label: 'Patient Ethnicity', minWidth: 30, align: 'center', sortable: true },
  {
    id: 'LatestStudy',
    label: 'Latest Study',
    minWidth: 40,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
    sortable: true
  },
  {
    id: 'LatestStudyDate',
    label: 'Latest Study Date',
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
  const token = auth.tokens?.access_token
  const userId = auth.userId;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deletingRowKey, setDeletingRowKey] = useState(null);
  
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

  // Refresh button handler
  const handleRefresh = () => {
    dispatch(triggerRefresh());
    dispatch(setSnackbar({ open: true, message: "Refreshing DICOM data...", severity: "info" }));
  };

  // Delete button handler
  // This function opens the delete confirmation dialog and sets the selected file key
  const handleOpenDeleteDialog = (event, patientId) => {
    console.log("Patient ID to be deleted: ", patientId);
    event.stopPropagation(); // to stop the click from being interpreted as a click on the entire row
    setSelectedPatientId(patientId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete handler
  // This function handles the deletion of a DICOM file if the user confirms the deletion in the dialog
  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    setDeletingRowKey(selectedPatientId); // Trigger skeleton state
  
    if (selectedPatientId) {
      try {
        dispatch(setSnackbar({
            open: true,
            message: `Deleting Patient ${selectedPatientId}`,
            severity: "info"
          }))
        const deleteResponse = await handleDicomDelete({token: token, patientId: selectedPatientId});
  
        if (deleteResponse instanceof Error) {
          dispatch(setSnackbar({
            open: true,
            message: deleteResponse.message || "Failed to delete patient.",
            severity: "error"
          }));
        } else {
          // Successful response
          const { S3FilesDeleted, DeleteText, message } = deleteResponse;
  
          // Choose message based on available fields
          const successMessage =
            DeleteText ||
            (S3FilesDeleted
              ? "Patient and related files deleted successfully."
              : "Patient deleted, but no DICOM files were present in S3.");
  
          dispatch(setSnackbar({
            open: true,
            message: successMessage,
            severity: "success"
          }));
  
          // Cleanup and refresh
          removeLSItemsByPrefix('patientData');
          removeLSItemsByPrefix('statsData');
          removeLSItemsByPrefix('studyData');
          dispatch(triggerRefresh());
        }
      } catch (error) {
        dispatch(setSnackbar({
          open: true,
          message: error.message || "Unexpected error during deletion.",
          severity: "error"
        }));
      }
    }
  
    setDeletingRowKey(null);
  };  

  // Cancel delete handler
  // This function closes the delete confirmation dialog and resets the selected file key
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedPatientId(null);
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
    navigate(`/app/workspace/patient/${row.patient_id}`); // Remove trailing slash
  };

  // Data fetching instantly after the component mounts
  // and whenever the dicomDataRefresh or userId changes
  useEffect(() => {
    if (!userId) return;
  
    const fetchData = async () => {
      setLoading(true);

      if (!localStorage.getItem('patientData')) {
        const token = auth.tokens?.access_token
        const fetchedData = await handleDicomDataFetching(userId, token);
  
        // Check if data exists
        if (fetchedData.length === 0) {
          setDataExists(false);
        } else {
          setDataExists(true);
        }

        console.log("Here's the fetchedData")
        console.log(fetchedData.patients)
  
        // Dispatch the fetched data to Redux
        dispatch(setDicomData(fetchedData['patients']));
  
        localStorage.setItem('patientData', JSON.stringify(fetchedData.patients));
      } else {
        const cachedData = JSON.parse(localStorage.getItem('patientData'));
        dispatch(setDicomData(cachedData));
        setDataExists(cachedData.length > 0);
      }
  
      // Reset pagination and filters
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
        if (sortConfig.key === 'name') {
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

  // Check if there are search/filter/sort active
  const hasActiveFiltersOrSearch = searchTerm !== '' || activeFilters.length > 0;

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: '50px 50px 0px 0px',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Table toolbar with search and filters */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
        }}
      >
        <Typography variant="h5" fontWeight="bold" visibility={{ xs: 'hidden', sm: 'visible' }} color="text.primary">
          Patients
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
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="button" sx={{ p: '10px', color:'white' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          
          {/* <Tooltip title="Filter by modality">
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
          </Tooltip> */}
          
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
                      (row.FileKey === deletingRowKey) ? (
                          <TableRow key={row.FileKey}>
                            <TableCell colSpan={columns.length}>
                              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <Skeleton 
                                  variant="rounded" 
                                  height={40} 
                                  animation="wave"
                                  sx={{ flex: 1, bgcolor: 'rgba(250, 3, 3, 0.27)', borderRadius: 10 }}
                                />
                                <Typography sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  color: 'rgb(255, 255, 255)',
                                  fontWeight: 600,
                                }}>
                                  Deleting Study...
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                      ) : (
                        
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
                            background: "#660033 !important",
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
                                  <Tooltip title="View Patient Details">
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
                                  
                                  <Tooltip title="Delete Patient">
                                    <IconButton 
                                      size="small"
                                      color="text.primary"
                                      onClick={(e) => {
                                          handleOpenDeleteDialog(e, row.patient_id);
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
                            if (column.id === "name") {
                            displayValue = formatName(value);
                            } else if (column.id === "LatestStudyDate") {
                            displayValue = formatDate(value);
                            } else if (column.id === "age") {
                            displayValue = value ? formatAge(value) : '—';
                            } else if (column.id === "sex") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                              <Tooltip title={value === 'M' ? 'Male' : value === 'F' ? 'Female' : 'Other/Unknown'}>
                                {value === 'M' ? (
                                <MaleIcon sx={{ color: "rgb(3, 34, 211)" }} />
                                ) : value === 'F' ? (
                                <FemaleIcon sx={{ color: 'rgb(215, 42, 94)' }} />
                                ) : (
                                <Typography>{value || '—'}</Typography>
                                )}
                              </Tooltip>
                              </TableCell>
                            );
                          } else if (column.id === "modality") {
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
                      </TableRow>)
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
            </CardContent>
          </Card>
        </Box>
      )}
    </Paper>
  );
}

export default PatientTable;