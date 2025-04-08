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
      },
      clearDicomData: (state) => {
        state.patient = null;
        localStorage.removeItem("patient");
      },
    },
});

export const { setDicomData, clearDicomData, triggerRefresh } = dicomDataSlice.actions;
export default dicomDataSlice.reducer;