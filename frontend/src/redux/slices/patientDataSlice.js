import { createSlice } from "@reduxjs/toolkit";

const storedPatient = localStorage.getItem("patient")
  ? JSON.parse(localStorage.getItem("patient"))
  : null;

const initialState = {
  patient: storedPatient,
};
// This thing above actually stores the state value. 

const patientSlice = createSlice({
    name: "patient",
    initialState,
    reducers: {
      setPatient: (state, action) => {
        state.patient = action.payload;
        localStorage.setItem("patient", JSON.stringify(action.payload)); // Persist data
      },
      clearPatient: (state) => {
        state.patient = null;
        localStorage.removeItem("patient");
      },
    },
});
// High level overview:-
// createSlice() is a function that generates a slice object for Redux. A slice contains the initial state and reducers.
// This function:- 
// Defines the name (patient) of the slice.
// Sets the initialState (the starting value of the state).
// Defines reducers (functions that modify the state).

// Then we add the slice to the store by configuring the store with the reducer from the slice.
// The key (patient key inside the configureStore object) determines where this slice's state will be stored inside Redux.
// At this point, the Redux store is set up, but nothing is modifying the state yet!

// Action creators (setPatient, clearPatient) generate actions.
// Dispatch sends those actions to Redux.
// The corresponding reducer updates the state.
// Example: Dispatching an Action
// store.dispatch(setPatient({ id: 1, name: "John Doe" }));

// setPatient({ id: 1, name: "John Doe" }) generates:
// { type: "patient/setPatient", payload: { id: 1, name: "John Doe" } }

// The setPatient reducer modifies the state:
// state.patient = { id: 1, name: "John Doe" };

// Now, store.getState().patient will return:
// { patient: { id: 1, name: "John Doe" } }
// Here, store.getState() returns the current state of the Redux store, and in store.getState().patient, the "patient"
// refers to the patient key set in the configureStore function.
// But in the return value, you can imagine that the "patient" in the return value is the patient key in the initialState.

// The name: "patient" in createSlice() does not affect the Redux state structure directly.
// Instead, it serves two main purposes:

// 1. It Helps with Action Type Naming
// When you define reducers inside createSlice(), Redux Toolkit automatically generates actions.
// The name field is used as a prefix for these actions.

// An action is a plain JavaScript object that tells Redux what happened.

// Example of a Redux Action
// {
//   type: "patient/setPatient",
//   payload: { id: 1, name: "John Doe" }
// }
// 🔹 type: A string that uniquely identifies the action (e.g., "patient/setPatient").
// 🔹 payload: (Optional) Any data needed to update the state (e.g., patient details).

// What Are Action Types?
// An action type is just a string that acts as an identifier for an action.
// They help Redux know which reducer function should handle the action.

// Example of Manually Defining Action Types
// Without Redux Toolkit, you typically define action types as constants:

// const SET_PATIENT = "SET_PATIENT";
// const CLEAR_PATIENT = "CLEAR_PATIENT";
// And use them in actions:

// const setPatient = (patient) => ({
//   type: SET_PATIENT,
//   payload: patient,
// });

// const clearPatient = () => ({
//   type: CLEAR_PATIENT,
// });

// Then, in a reducer:

// const patientReducer = (state = {}, action) => {
//   switch (action.type) {
//     case SET_PATIENT:
//       return { patient: action.payload };
//     case CLEAR_PATIENT:
//       return { patient: null };
//     default:
//       return state;
//   }
// };

// Now with this slice with name: "patient", Redux Toolkit generates actions like:
// {
//   type: "patient/setPatient"
// }

// {
//   type: "patient/clearPatient"
// }

// The "patient" prefix comes from name: "patient".
// "setPatient" and "clearPatient" come from the reducer function names.

// If you renamed name to "banana", the actions would change:
// {
//   type: "banana/setPatient"
// }

// {
//   type: "banana/clearPatient"
// }
// This helps Redux identify which slice the action belongs to, especially when debugging or logging actions.

// 2. It Helps with Redux DevTools Debugging
// If you're using Redux DevTools, the name field helps organize and label actions.
// For example, in DevTools, you might see:

// ▶ patient/setPatient
// ▶ patient/clearPatient

// Instead of something generic like:

// ▶ setPatient
// ▶ clearPatient

export const { setPatient, clearPatient } = patientSlice.actions;
// What’s Happening?
// patientSlice.actions is an object that contains all action creators generated from the reducers.
// The export const { setPatient, clearPatient } = ... syntax extracts those action creators and exports them.
// An action creator is simply a function that returns an action (an object with a type field).
// Instead of manually writing action objects, we use action creators to generate them dynamically.
// Example Without Action Creators
// Imagine if we had to dispatch an action manually like this:

// dispatch({
//   type: "patient/setPatient",
//   payload: { id: 1, name: "John Doe" },
// });
// This works, but it's repetitive and prone to mistakes.

// Example With Action Creators
// Redux allows us to use functions to generate actions instead:
// dispatch(setPatient({ id: 1, name: "John Doe" }));
// Here, setPatient is an action creator, and it automatically generates the action:
// {
//   type: "patient/setPatient",
//   payload: { id: 1, name: "John Doe" }
// }

// Why?
// This allows components to dispatch these actions to update Redux state.

// Example usage in a component:-
// const ExampleComponent = () => {
//   const dispatch = useDispatch();

//   const handleSelectPatient = (patientData) => {
//     dispatch(setPatient(patientData)); // Calls the reducer and updates state
//   };

//   const handleClearPatient = () => {
//     dispatch(clearPatient()); // Calls the reducer to reset state
//   };
// };

export default patientSlice.reducer;
// This is exported as patientSlice.reducer, but we import it in the store.js file as patientReducer, and that works
// because this is a default import, not a named import. So we can give it any name we want when we import it.
// patientSlice.reducer is the actual reducer function generated by createSlice().
// The export default syntax allows other files (like store.js) to import it easily.