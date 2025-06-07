const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const handleDicomDataFetching = async (userId) => {
    console.log(userId)
    const recordType = "patient";
    try {
      const response = await fetch(`${API_BASE_URL}/api/get-dicom-metadata?userId=${userId}&recordType=${recordType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("Response received:", response);

      const patientData = await response.json(); // Parse JSON first
      return patientData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };  

export default handleDicomDataFetching;