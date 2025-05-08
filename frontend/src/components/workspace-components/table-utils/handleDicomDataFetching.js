// import { useDispatch } from 'react-redux';
// import { useAuthCustom } from '../../hooks/useAuthCustom'; // Assuming you have a custom hook for authentication
import { setDicomData } from '../../../redux/slices/dicomDataSlice';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import handleDicomDelete from './handleDicomDelete';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const handleDicomDataFetching = async (userId) => {
    // const dispatch = useDispatch();
    // const auth = useAuthCustom();
    console.log("User ID VVVV")
    console.log(userId)
    const recordType = "study";
    try {
      const response = await fetch(`${API_BASE_URL}/api/get-study-data-by-uid?userId=${userId}&recordType=${recordType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("+++++++got response")
      console.log(response)
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const patientData = await response.json(); // Parse JSON first!

    //   const patientDataWithDeleteButton = patientData.map(obj => ({
    //     ...obj,
    //     DeleteStudyButton: (
    //       <IconButton 
    //         aria-label="delete"
    //         size="large"
    //         sx={{color: "red"}}
    //         onClick={
    //           (event) => {
    //             event.stopPropagation();
    //             // Clicking the delete button only triggers the delete action, not the row redirection.
    //             console.log(obj['FileKey'])
    //             // When you're defining the object (row), row.fileKey (or whatever identifier you're using) is just a property.
    //             // It only makes sense when React renders the table and each row gets its corresponding data.
    //             // So, when you pass row.fileKey in the onClick handler inside the table row, it works because at that 
    //             // moment, row refers to the specific data object for that table row.
    //             // Initially, we were trying to access row['FileKey'] inside the delete button's onClick handler,
    //             // but at that point, row wasn’t yet defined in that context—it only exists later when React renders the table.
    //             // Instead, by using obj['FileKey'] when constructing the patientDataWithDeleteButton array,
    //             // we ensured that each row object already contained the correct value before React rendered the table.
    //             // This way, when the delete button's onClick runs, it correctly references the intended FileKey.

    //             handleDicomDelete(obj['FileKey']);
                
    //             console.log("Delete study button clicked")
    //           }
    //         }
    //       > 
    //           <DeleteIcon fontSize="inherit" />
    //       </IconButton>
    //     )
    //   }));
  
    //   console.log("+++++++parsed response to json")
    //   console.log(patientDataWithDeleteButton)

    //   if (!Array.isArray(patientDataWithDeleteButton)) {
    //     console.error("Expected an array but got:", patientDataWithDeleteButton);
    //     return;
    //   }

    // dispatch(setDicomData(patientData)); // Set parsed data to state
      return patientData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };  

export default handleDicomDataFetching;