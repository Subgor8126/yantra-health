import { createSlice } from "@reduxjs/toolkit";

const defaultSnackbar = { open: false, message: '', severity: 'success' }

const initialState = {
  snackbar: defaultSnackbar,
};
// // This thing above actually stores the state value. 

const snackbarSlice = createSlice({
    name: "snackbar",
    initialState,
    reducers: {
      setSnackbar: (state, action) => {
        state.snackbarState = action.payload;
        // localStorage.setItem("dicomData", JSON.stringify(action.payload)); // Persist data
      }
    },
});

export const { setSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;