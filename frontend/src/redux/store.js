import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./slices/patientDataSlice"; // Import the slice
import dicomDataReducer from "./slices/dicomDataSlice";
import snackbarReducer from "./slices/snackbarSlice";
import userReducer from "./slices/userSlice"; // Import the user slice

export const store = configureStore({
  reducer: {
    patient: patientReducer, // Register the reducer
    dicomData: dicomDataReducer,
    snackbar: snackbarReducer,
    user: userReducer, // Register the user reducer
  },
});

// OK imagine this. There is like a global state that is stored in Redux. Something like a global variable that can 
// be accessed from anywhere in the app, but we don't directly define it.
// In our approach, we first define a slice of the state. In that slice (you can go and look at it right now), we defined
// an object called initialState. This object has a key called patient, which is set to storedPatient.
// storedPatient is either the value of the patient key in the localStorage, or null if it doesn't exist.
// Why is the value fetched from localStorage? Because that's what we wrote when we defined the storedPatient variable.
// And of course because we want to persist the data.
// Now, imagine that global state we talked about. The way we defined the store variable with configureStore, with 
// reducer: {
//   patient: patientReducer, // Register the reducer
// }
// means that inside Redux's global state, there will be a top-level key called "patient".
// The value under this key will be whatever patientReducer returns.
// And what does patientReducer return? It returns the state object with the patient key, which is set to storedPatient.
// Now, because we named the key "patient" in the configureStore function, the global state we talked about, the global
// state will look like:-
// {
//   patient: {
//     patient: { id: "...", name: "..." } // Actual data
//   }
// }

// If the object inside configureStore (for the reducer key) was like this:-
// reducer: { banana: patientReducer }
// Then the global state would look like:-
// {
//   banana: {
//     patient: { id: "...", name: "..." } // Actual data
//   }
// }
// So, the key in the object inside configureStore is the key in the global state. And the value is the object that the
// reducer returns. The reducer returns the state object with the patient key, which is set to storedPatient, which 
// entirely is assigned to the initialState variable in the slice.

// Now, if the initialState object in the slice was like this:-
// const initialState = {
//   kiwi: storedPatient,
// };

// The global state would look like:-
// {
//   patient: {
//     kiwi: { id: "...", name: "..." } // Actual data
//   }
// }

// So you can match which key corresponds to which key in the global state.

// Now when it comes to accessing the state, Components can access state.patient using
// import { useSelector } from "react-redux";
// const patient = useSelector((state) => state.patient.patient);

// In Redux, useSelector is a hook that retrieves data from the Redux store inside a React component.
// useSelector accepts a function (called a selector function).

// This function takes the entire Redux state as an argument.
// It returns the specific piece of state you need (in this case, state.patient.patient, if we used our kiwi banana
// analogy, it'll be state.banana.kiwi, so figure it out).

// Let's rewrite useSelector behavior using a normal function:
// function selectPatient(state) {
//   return state.patient.patient; 
// }

// const patient = selectPatient(store.getState());
// useSelector((state) => state.patient.patient) is equivalent to calling selectPatient(store.getState()).
// store.getState() retrieves the whole Redux state, and selectPatient extracts state.patient.patient.

// Why state.patient, Not initialState.patient?
// This confusion comes from the difference between where we define the initial state and where Redux stores it in memory.
// initialState only exists inside patientSlice.js.
// It is used to set up Redux state but is not directly accessed by components.
// Where Does state.patient Come From?
// When we set up the Redux store, the createSlice function registers initialState in Redux.
// When we add patientReducer to the store:

// configureStore({
//   reducer: {
//     patient: patientReducer, 
//   },
// });

// Redux stores patientSlice's state under state.patient, because of the reducer key (patient, the one we define here in
// reducer: {patient: patientReducer}).
// Thus, in useSelector((state) => state.patient.patient),

// state.patient refers to the Redux slice state.
// state.patient.patient is the actual patient data stored in initialState.patient.

// dispatch: Updating Redux State
// Redux doesn’t allow direct state mutations, so we use dispatch to send actions to the store.

// Basic Syntax
// import { useDispatch } from "react-redux";
// import { setPatient, clearPatient } from "./patientSlice";

// const dispatch = useDispatch();

// dispatch(setPatient({ id: "123", name: "John Doe" }));

// useDispatch() gives us the dispatch function.
// dispatch(setPatient(payload)) triggers an action, updating state via the reducer.

// Breaking It Down
// Let's say you call dispatch(setPatient({ id: "123", name: "John Doe" })).
// This does the following:

// Dispatches an action:
// {
//   type: "patient/setPatient",
//   payload: { id: "123", name: "John Doe" }
// }
// (There is more about actions near the end of the patientDataSlice.js file.)

// Redux runs the reducer function in patientSlice.js:
// setPatient: (state, action) => {
//   state.patient = action.payload; // Updates state
// }

// Redux updates the store:
// {
//   patient: { // Comes from `patientReducer`
//     patient: { id: "123", name: "John Doe" } // Updated value
//   }
// }
// useSelector picks up the new state, and React re-renders the component.

// So basically, it goes like this. First, any React component that wants to use a global state subscribes to the state
// using useSelector, like

// const patient = useSelector((state) => state.patient.patient);

// useSelector reads state.patient.patient (which is null), hence the patient variable will be null for the first time.

// Then, if the component wants to update the state, say onClick of some button, it dispatches an action using dispatch,
// like this:-
// <button
//   onClick={() =>
//     dispatch(setPatient({ id: "123", name: "John Doe" }))
//   }
// >
//   Set Patient
// </button> 

// Redux updates state.patient.patient to { id: "123", name: "John Doe" }.
// useSelector detects the change in state.patient.patient.
// Because the selected state changed, React re-renders the component.
// Now the new state ({ id: "123", name: "John Doe" }) is used in the JSX.

// Edge case:- If you use useSelector to subscribe to another state in 
// Redux—even if it's not used anywhere in the component—it will still trigger a re-render whenever that state changes.

// useSelector re-renders the component whenever the selected state changes, regardless of whether that state is
// actually used inside the JSX or logic.

// So dispatch changes the state, useSelector reads the state, and React re-renders the component.
// So its kinda like dispatch is like setState in React, useSelector is like useState, and the global state is like the
// state in React.
