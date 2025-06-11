import { createSlice } from "@reduxjs/toolkit";
import { removeLSItemsByPrefix } from "../../components/workspace-components/table-utils";

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
        removeLSItemsByPrefix('patientData');
        removeLSItemsByPrefix('statsData');
        removeLSItemsByPrefix('studyData');
      },
      clearDicomData: (state) => {
        state.patient = null;
        removeLSItemsByPrefix("patientData");
      },
    },
});

export const { setDicomData, clearDicomData, triggerRefresh } = dicomDataSlice.actions;
export default dicomDataSlice.reducer;