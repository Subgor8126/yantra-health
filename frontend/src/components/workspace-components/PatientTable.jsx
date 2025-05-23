import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// mui imports
import { Box, TableRow, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, IconButton, Typography, LinearProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// redux imports
import { useDispatch, useSelector } from 'react-redux';
import { setPatient } from '../../redux/slices/patientDataSlice';
import { setDicomData } from '../../redux/slices/dicomDataSlice';
import { triggerRefresh } from '../../redux/slices/dicomDataSlice';
// util imports
import { handleDicomDataFetching } from './table-utils';
import { handleDicomDelete } from './table-utils';
import DeleteDialog from './table-utils/DeleteDialog';
import { formatName, formatDate } from './table-utils';
// auth imports
import { useAuthCustom } from '../../hooks/useAuthCustom';
import { setSnackbar } from '../../redux/slices/snackbarSlice';

const isAuthGuest = localStorage.getItem('isGuest') === 'true';

const baseColumns = [
  { id: 'PatientID', label: 'Patient\u00a0ID', minWidth: 50, align: 'center' },
  { id: 'PatientName', label: 'Patient\u00a0Name', minWidth: 50, align: 'center' },
  { id: 'PatientSex', label: 'Patient\u00a0Sex', minWidth: 50, align: 'center' },
  {
    id: 'NumberOfInstances',
    label: 'Number\u00a0of\u00a0Instances',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'Modality',
    label: 'Modality',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'AccessionNumber',
    label: 'Accession\u00a0Number',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'BodyPartExamined',
    label: 'Body\u00a0Part\u00a0Examined',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'StudyDate',
    label: 'Study\u00a0Date',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  // {
  //   id: 'StudyID',
  //   label: 'Study\u00a0ID',
  //   minWidth: 100,
  //   align: 'right',
  //   format: (value) => value.toLocaleString('en-US'),
  // },
];

const columns = isAuthGuest
  ? baseColumns
  : [...baseColumns, {
      id: 'DeleteStudyButton',
      label: 'Delete\u00a0Study',
      minWidth: 100,
      align: 'center',
    }];

function PatientTable() {
  const auth = useAuthCustom();
  const userId = auth.userId
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const rows = useSelector((state) => state.dicomData.dicomData);
  const dicomDataRefresh = useSelector((state) => state.dicomData.refreshTable);
  // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  console.log("Here are the rowsVVVV")
  console.log(rows)
  console.log("User ID ist hier VVVV")
  console.log(userId)

  console.log("Here are the rows VVVVVVV")
  console.log(rows)

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }; 

  // const handleDeleteButtonClick = async (fileKey) => {
  
  //   try {
  //     const deleteResponse = await handleDicomDelete(fileKey);
  
  //     if (deleteResponse?.DeleteText) {
  //       console.log(deleteResponse.DeleteText);
  //       dispatch(setSnackbar({ open: true, message: deleteResponse.DeleteText, severity: "success" }));
  //       dispatch(triggerRefresh());
  //     } else if (deleteResponse?.message) {
  //       dispatch(setSnackbar({ open: true, message: deleteResponse.message, severity: "error" }));
  //     }
  //   } catch (error) {
  //     dispatch(setSnackbar({ open: true, message: "Something went wrong!", severity: "error" }));
  //   }
  // }

  const handleOpenDeleteDialog = (event, fileKey) => {
    event.stopPropagation(); // to stop the click on the delete button from being interpreted as a click on the entire row
    setSelectedFileKey(fileKey);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    if (selectedFileKey) {
      console.log("Deleting file:", selectedFileKey);
      // Call the actual delete function here
      // await handleDicomDelete(selectedFileKey);
      try {
        const deleteResponse = await handleDicomDelete(userId, selectedFileKey);

        console.log("HERE IS THE DELETE RESPONSE")
    
        if (deleteResponse?.DeleteText) {
          console.log(deleteResponse.DeleteText);
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
    dispatch(setSnackbar({ open: true, message: "Delete operation cancelled", severity: "success" }))
  };

  useEffect(() => {
      if (!userId) return;
    
      const fetchData = async () => {
        setLoading(true); // <-- start loading
    
        const fetchedData = await handleDicomDataFetching(userId);
    
        if (fetchedData.length === 0) {
          setDataExists(false);
        } else {
          setDataExists(true);
        }
        dispatch(setDicomData(fetchedData));
    
        setLoading(false); // <-- loading finished
      };
    
      fetchData();
    }, [dicomDataRefresh, userId]);
  

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {loading ? (
      <Box
        sx={{
          height: '81vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
          gap: 2,
        }}
      >
        <LinearProgress sx={{ width: '300px', mb: 2 }} color="primary" />
        <Typography variant="h6" color="text.primary">
          Please Wait, Fetching DICOM Data...
        </Typography>
      </Box>
    ) : dataExists ? (
      <>
      <TableContainer sx={{ maxHeight: '81vh', height: '81vh' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                key={column.id}
                align={column.align || "left"}
                sx={{
                  width: `${100 / columns.length}%`, // Distributes columns equally
                  fontWeight: "bold",
                }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.FileKey}
                    onClick={() => {
                      dispatch(setPatient(row)); // Store patient data in Redux
                      navigate(`/app/workspace/${row.PatientID}`);
                    }}
                    sx={{
                      transition: "background 0.4s ease-in-out", // Smooth transition
                      background: "transparent", // Default background
                      "&:hover": {
                        background: "linear-gradient(90deg, rgba(150,5,39,0.2) 0%, rgba(215,42,94,0.3) 100%)",
                        cursor: "pointer", // Change cursor on hover
                      },
                    }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      // console.log(row)
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {(() => {
                              if (column.id === "DeleteStudyButton") {
                                return (
                                  <IconButton onClick={(event) => handleOpenDeleteDialog(event, row.FileKey)} color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                );
                              }

                              let displayValue = value;

                              if (column.id === "PatientName") {
                                displayValue = formatName(value);
                              } else if (column.format && typeof value === "number") {
                                displayValue = column.format(value);
                              } else if(column.id === "StudyDate"){
                                displayValue = formatDate(value);
                              }

                              return displayValue;
                            })()}

                          {/* The extra parentheses in your JSX {(() => { ... })()} are due to an Immediately Invoked Function Expression (IIFE) */}
                          {/* (() => { ... }) → This is an arrow function with a block body. */}
                          {/* (() => { ... })() → The final () at the end immediately invokes the function. */}
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
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <DeleteDialog 
        open={deleteDialogOpen} 
        onConfirm={handleConfirmDelete} 
        onCancel={handleCancelDelete} 
      />
      
      </>
      ) : (
        <Box
          sx={{
            height: '81vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 2,
            gap: 2,
          }}
        >
          <Typography variant="h6" color="text.primary">
            No DICOM Data Available. Please upload to view studies.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default PatientTable;