export { default as PatientTable } from './PatientTable';
export { default as HeaderAppBar } from './HeaderAppBar';
export { default as PatientDetails } from './PatientDetails';

// We write it like this because these components are exported as default from their own files, which means that whatever
// file imports them will import them as default, like import PatientTable from '../workspace-components/PatientTable';
// But by using this syntax where do { default as PatientTable } we are essentially converting te default export in their
// respective files to a named export, so that when we import them in other files, we can import them as named exports, like
// import { PatientTable, HeaderAppBar } from '../workspace-components';