import React, {useState, ReactNode, FunctionComponent} from 'react';
import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {Typography, Tooltip} from '@mui/material';
import { CopyToClipboard } from './CopyToClipboard';


const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
          size="large">
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

interface Props {
    statement: string
}

export const StatementDialog: FunctionComponent<Props> = (props: Props) => {
  const {statement} = props;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
      setOpen(true);
  };
  const handleClose = () => {
      setOpen(false);
  };

  const queryStatement = statement?.replaceAll("<?query --", "").replaceAll("--?>", "").replaceAll(/\/\*<<<<TRACE_ID:(.*)>>>>\*\//g, "")
  const traceId = statement?.match(/\/\*<<<<TRACE_ID:(.*)>>>>\*\//i)?.[1];
  return (
    <>
      <p onClick={handleClickOpen} style={{cursor:'pointer', margin:'0px'}}>
          {queryStatement?.substring(0, 20).concat('...')}
          <span style={{color:'grey'}}>..more</span>
        </p>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Query Statement
        </DialogTitle>
        <DialogContent dividers>
        {queryStatement}
        </DialogContent>
        <DialogActions>
          <CopyToClipboard text={queryStatement}/>
          { traceId ? 
            <Tooltip title="Trace ID">
              <span onClick={() => window.open(`https://tools.udaan.dev/tracer/trace/${traceId}`)} style={{color:'#4051b5', cursor:'pointer'}}>{traceId}</span>
            </Tooltip> : null }
        </DialogActions>
      </Dialog>
    </>
  );
}
