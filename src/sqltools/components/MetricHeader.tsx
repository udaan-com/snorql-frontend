import React, {useState, ReactNode, FunctionComponent} from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {Typography, Tooltip} from '@material-ui/core';
import { IMetricMetadata } from '../models';
import { useStyles } from "./StyleClass";
import InfoIcon from '@material-ui/icons/Info';
import HelpIcon from '@material-ui/icons/Help';


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
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
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
    title: string;
    metadata?: IMetricMetadata
}

export const MetricHeader: FunctionComponent<Props> = (props: Props) => {
  const {metadata, title} = props;
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
      setOpen(true);
  };
  const handleClose = () => {
      setOpen(false);
  };

  return (
    <>
        <Typography className={classes.heading}>{title}
            {metadata && (metadata.description || metadata.referenceDocumentation.length > 0 ) &&
                <IconButton aria-label="info" onClick={handleClickOpen}>
                    <InfoIcon />
                </IconButton> }
        </Typography>
        <Dialog onClose={handleClose} aria-labelledby="metric-dialog-title" open={open}>
            <DialogTitle id="metric-dialog-title" onClose={handleClose}>
                Metric Description
            </DialogTitle>
            <DialogContent dividers>
                {metadata && metadata.description && 
                <div>
                    <div>{metadata && metadata.description}</div>
                </div>}
                {metadata && metadata.referenceDocumentation.length > 0 &&
                    <>
                        <summary>References</summary>
                        <ul>
                            {metadata.referenceDocumentation.map((item, i) => (
                                <li key={i}><a href={item} target='_blank'>{item}</a></li>
                            ))}
                        </ul>
                    </>
                }
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>
    </>
  );
}
