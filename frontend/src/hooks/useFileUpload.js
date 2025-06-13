import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../redux/slices/dicomDataSlice';
import { setSnackbar } from '../redux/slices/snackbarSlice';
import { useAuthCustom } from './useAuthCustom';
import { removeLSItemsByPrefix } from '../components/workspace-components/table-utils';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadingStudy, setUploadingStudy] = useState(false);
  const auth = useAuthCustom();
  const dispatch = useDispatch();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleDicomUpload = async (filesArray, isStudy = false) => {
    if (!filesArray || filesArray.length === 0) {
      dispatch(setSnackbar({ 
        open: true, 
        message: "Please select a file or folder!", 
        severity: "error" 
      }));
      return;
    }

    try {
      const token = auth.tokens?.access_token;
      if (!token) throw new Error("User is not authenticated");

      // Set appropriate loading state
      if (isStudy) {
        console.log("Uploading study...");
        setUploadingStudy(true);
      } else {
        setUploading(true);
      }

      const formData = new FormData();
      for (const file of filesArray) {
        formData.append("files", file, file.webkitRelativePath || file.name);
      }

      const response = await fetch(`${API_BASE_URL}/api/upload-dicom`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Upload failed");

      dispatch(setSnackbar({ 
        open: true, 
        message: result.message || "Upload successful!", 
        severity: "success" 
      }));
      
      // Clear cached data
      removeLSItemsByPrefix("patientData");
      removeLSItemsByPrefix("statsData");
      removeLSItemsByPrefix("studyData");
      
      // Trigger refresh after a delay
      setTimeout(() => dispatch(triggerRefresh()), 1000);

    } catch (error) {
      dispatch(setSnackbar({ 
        open: true, 
        message: error.message, 
        severity: "error" 
      }));
    } finally {
      setUploading(false);
      setUploadingStudy(false);
    }
  };

  return {
    handleDicomUpload,
    uploading,
    uploadingStudy,
    isUploading: uploading || uploadingStudy
  };
};