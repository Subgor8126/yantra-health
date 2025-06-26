const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const handleDicomDataFetching = async (userId, token) => {
    console.log(userId)
    try {
      const response = await fetch(`${API_BASE_URL}/api/get-patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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