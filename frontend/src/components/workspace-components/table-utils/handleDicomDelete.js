const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const handleDicomDelete = async ({ token, studyInstanceUid, patientId }) => {
  try {
    let endpoint = "";
    let query = "";

    if (studyInstanceUid) {
      endpoint = "delete-studies";
      query = `studyInstanceUid=${studyInstanceUid}`;
    } else if (patientId) {
      endpoint = "delete-patients";
      query = `patientId=${patientId}`;
    } else {
      throw new Error("Record identifier invalid or not passed");
    }

    const response = await fetch(`${API_BASE_URL}/api/${endpoint}?${query}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return error;
  }
};

export default handleDicomDelete;