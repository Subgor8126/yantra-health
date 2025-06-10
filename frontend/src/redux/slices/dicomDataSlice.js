import { createSlice } from "@reduxjs/toolkit";

const defaultDicomData = []

const initialState = {
  dicomData: defaultDicomData,
};
// // This thing above actually stores the state value. 

const dicomDataSlice = createSlice({
    name: "dicomData",
    initialState,
    reducers: {
      setDicomData: (state, action) => {
        state.dicomData = action.payload;
        // localStorage.setItem("dicomData", JSON.stringify(action.payload)); // Persist data
      },
      triggerRefresh: (state) => {
        state.refreshTable = !state.refreshTable;  // <-- Toggle state
        localStorage.removeItem('patientData');
        localStorage.removeItem('statsData');
        localStorage.removeItem('studyData');
      },
      clearDicomData: (state) => {
        state.patient = null;
        localStorage.removeItem("patientData");
      },
    },
});

export const { setDicomData, clearDicomData, triggerRefresh } = dicomDataSlice.actions;
export default dicomDataSlice.reducer;