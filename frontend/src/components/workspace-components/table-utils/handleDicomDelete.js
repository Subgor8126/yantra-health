import * as React from 'react';
import { triggerRefresh } from '../../../redux/slices/dicomDataSlice';
// import { useDispatch } from 'react-redux';
import { setSnackbar } from '../../../redux/slices/snackbarSlice';
import deleteDialog from './DeleteDialog';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:8000";

const handleDicomDelete = async (userId, fileKey) => {
    // const dispatch = useDispatch();

    // confirmation = deleteDialog();
    // if(!confirmation){
    //     dispatch(setSnackbar({ open: true, message: "Operation Cancelled by User", severity: "error" }))
    //     return;
    // }

    try {
        const response = await fetch(`${API_BASE_URL}/api/delete-data-by-file-key?userId=${userId}&fileKey=${fileKey}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data.DeleteText); // Access the DeleteText field
        // dispatch(setSnackbar({ open: true, message: data.DeleteText, severity: "success" }));
        // dispatch(triggerRefresh())
        return data;

    } catch (error) {
        // dispatch(setSnackbar({ open: true, message: error.message, severity: "error" }))
        return error;
    }
};

export default handleDicomDelete;