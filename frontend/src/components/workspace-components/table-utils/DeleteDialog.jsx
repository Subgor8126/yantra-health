import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect } from 'react';

export default function DeleteDialog({ open, onConfirm, onCancel }) {

  // useEffect(() => {
  //   setOpen(true)
  // }, [])

  // const handleAgree = () => {
  //   setOpen(false);
  //   return true;
  // };

  // const handleDisagree = () => {
  //   setOpen(false);
  //   return false;
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this study?"}
        </DialogTitle>
        {/* <DialogContent>
          <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this file?
          </DialogContentText>
        </DialogContent> */}
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}