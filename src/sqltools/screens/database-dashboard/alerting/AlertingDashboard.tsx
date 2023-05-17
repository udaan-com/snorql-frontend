import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import React, { useState } from "react";
import { FunctionComponent } from "react";
import { Fetcher } from "../../../../common/components/Fetcher";
import { ICustomError, IErrorMessage, IMetricAlert } from "../../../models";
import { AlertDetailsTable } from "../../../components/AlertDetailsTable";
import { ErrorMessageCard } from "../../../components/ErrorMessageCard";
import { SnackbarComponent } from "../../../components/SnackbarComponent";
import { SQLService } from "../../../services/SQLService";
import { getAlertingColumns } from "./allAlertingColumns";
import { Box, Button, IconButton, Theme, Tooltip } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { SqlAlertDialog } from "../../../components/SqlAlertDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {AlertService} from "../../../services/AlertService";

interface AlertingDashboardProps {
  databaseName: string;
}

export const AlertingDashboard: FunctionComponent<AlertingDashboardProps> = (
  props
) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      toolbar: theme.mixins.toolbar,
      addRecorderButton: {
        textTransform: "none",
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(3),
      },
      iconContainer: {
        marginRight: "24px",
      },
    })
  );

  const classes = useStyles();
  const [columns, setColumns] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<IMetricAlert[]>([]);
  const [addAlertDialogOpen, setAddAlertDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarType, setSnackbarType] = useState("error");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [alertDialogMode, setAlertDialogMode] = useState("NEW");

  const options: MUIDataTableOptions = {
    filterType: "multiselect",
    selectableRows: "single",
    print: false,
    download: false,
    responsive: "standard",
    rowsPerPage: 10,
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      // console.log(`${rowData} | ${rowMeta}`);
      const dataIndex = rowMeta.dataIndex;
      return (
        <tr>
          <td colSpan={6}>
            <AlertDetailsTable
              alertData={activeAlerts[dataIndex]}
            ></AlertDetailsTable>
          </td>
        </tr>
      );
    },
    onRowsDelete: (e) => {
      deleteAlert(activeAlerts[e.data[0].dataIndex].alertId);
    },
    setTableProps: () => {
      return { size: "small" };
    },
    customToolbar: () => {
      return (
        <React.Fragment>
          <Tooltip title={"Add an alert"}>
            <Button
              onClick={() => setAddAlertDialogOpen(true)}
              variant="contained"
              color="primary"
              className={classes.addRecorderButton}
            >
              + Add Alert
            </Button>
            {/* <IconButton onClick={() => setIsAlertDialogOpen(true)}>
            <AddIcon />
          </IconButton> */}
          </Tooltip>
        </React.Fragment>
      );
    },
    // selectToolbarPlacement: "replace",
    // customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
    //   return (
    //     <React.Fragment>
    //       <div className={classes.iconContainer}>
    //         <Tooltip title={"Edit Alert"}>
    //           {/* <Button onClick={() => setAddAlertDialogOpen(true)} variant="contained" color="primary" className={classes.addRecorderButton}>+ Add Alert</Button> */}
    //           <IconButton onClick={() => handleEditAlert(selectedRows)}>
    //             <EditIcon />
    //           </IconButton>
    //         </Tooltip>
    //         <Tooltip title={"Delete Alert"}>
    //           {/* <Button onClick={() => setAddAlertDialogOpen(true)} variant="contained" color="primary" className={classes.addRecorderButton}>+ Add Alert</Button> */}
    //           <IconButton
    //             disabled={deleteLoading}
    //             onClick={() =>
    //               handleAlertDelete(
    //                 activeAlerts[selectedRows.data[0].dataIndex].alertId,
    //                 selectedRows.data[0].dataIndex
    //               )
    //             }
    //           >
    //             <DeleteIcon />
    //           </IconButton>
    //         </Tooltip>
    //       </div>
    //     </React.Fragment>
    //   );
    // },
  };

  const setSnackbarValues = (
    snackbarOpen: boolean,
    snackbarType: string,
    snackbarMessage: string
  ) => {
    setSnackbarOpen(snackbarOpen);
    setSnackbarType(snackbarType);
    setSnackbarMessage(snackbarMessage);
  };

  // const handleAlertDelete = async (alertId: string | undefined, dataIndex: number) => {
  //   setDeleteLoading(true);
  //   let copyAlertsList = activeAlerts;
  //   const rowRemoved = copyAlertsList.splice(dataIndex, 1)[0];
  //   // console.log("Spliced Alerts list", copyAlertsList)
  //   setActiveAlerts(copyAlertsList);
  //   let deleteRes = await deleteAlert(alertId, dataIndex);
  //   // console.log(`Response of deleting the alert: ${deleteRes}`)
  //   if (deleteRes == false) {
  //     // console.log(`Alert deletion is false`)
  //     copyAlertsList.splice(dataIndex, 0, rowRemoved);
  //     // console.log(`Updated Active Alerts:`, copyAlertsList)
  //     setActiveAlerts(copyAlertsList);
  //   }
  //   setDeleteLoading(false);
  // };

  const deleteAlert = async (
    alertId: string | undefined,
    // dataIndex: number
  ): Promise<Boolean> => {
    if (alertId) {
      AlertService.deleteAlert(alertId)
        .then((r) => {
          if (r.error) {
            setErrorMessage(r.error);
            setSnackbarValues(true, "error", r.error);
            return false;
          } else {
            AlertService.fetchActiveAlerts(props.databaseName).then((r) => {
              handleAlertList(r);
              setSnackbarValues(true, "success", "Alert successfully deleted");
              return r == true ? true : false;
            });
          }
        })
        .catch((e) => {
          setErrorMessage("Unable to delete alert: " + e);
          setSnackbarValues(true, "error", "Unable to delete alert: " + e);
          return false;
        });
    } else {
      setErrorMessage("Incorrect alert id: " + alertId + " found");
      setSnackbarValues(
        true,
        "warning",
        "Alert ID is null"
      );
      setDeleteLoading(false);
      return false;
    }
    return false;
  };

  const handleEditAlert = (selectedRows: any) => {
    if (
      activeAlerts[selectedRows.data[0].dataIndex].alertId
    ) {
      const alertId = activeAlerts[selectedRows.data[0].dataIndex].alertId
      setSelectedAlertId(alertId? alertId : "");
      setAlertDialogMode("EDIT");
      setAddAlertDialogOpen(true);
    }
  };

  const handleAlertList = (r: IMetricAlert[] | ICustomError | IErrorMessage) => {
    if ("code" in r && "message" in r && "details" in r) {
      setErrorMessage(`${r.message}: ${r.details}`);
    } else if ("error" in r || "message" in r) {
      // @ts-ignore
      setErrorMessage(`${r.error}: ${r.message}`)
    } else {
      setActiveAlerts(r);
      setColumns(getAlertingColumns());
    }
  };

  const closeAlertDialog = () => {
    AlertService.fetchActiveAlerts(props.databaseName).then((res) => {
      handleAlertList(res);
    });
    setSelectedAlertId("");
    setAlertDialogMode("NEW");
    setAddAlertDialogOpen(false);
  };

  return (
    <Box
      className={[classes.content, classes.toolbar].join(" ")}
      mt={10}
      alignItems={"center"}
      justifyContent={"center"}
      paddingTop={5}
    >
      <Fetcher
        fetchData={() => AlertService.fetchActiveAlerts(props.databaseName)}
        onFetch={(r) => {
          handleAlertList(r);
        }}
      >
        <>{errorMessage && <ErrorMessageCard text={errorMessage} />}
          <MUIDataTable
            columns={columns}
            data={activeAlerts}
            options={options}
            title="Active Alerts"
          ></MUIDataTable>
        </>
      </Fetcher>
      <SnackbarComponent
        snackbarOpen={snackbarOpen}
        handleClose={() => setSnackbarOpen(false)}
        snackbarType={snackbarType}
        snackbarMessage={snackbarMessage}
      ></SnackbarComponent>
      <SqlAlertDialog
        open={addAlertDialogOpen}
        handleClose={() => closeAlertDialog()}
        databaseName={props.databaseName}
        mode={alertDialogMode}
        alertId={selectedAlertId}
      />
    </Box>
  );
};
