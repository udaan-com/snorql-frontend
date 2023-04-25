import React, { useState } from "react";
import { Typography } from "@material-ui/core";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { createStyles, Theme } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import ProgressView from "../../common/components/ProgressView";
import { DatabaseType } from "../models";
import {MiscService} from "../services/MiscService";

interface Props {
  dbType: DatabaseType;
  db: string;
  setIsConfigured: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,

    content: {
      maxWidth: 1500,
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  })
);

export const ConfigureDb: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { dbType, db, setIsConfigured, setErrorMessage } = props;

  const handleConfigureDb = () => {
    setLoading(true);
    MiscService.configureDatabase(dbType, db)
      .then((r) => {
        setIsConfigured(r);
        setLoading(false);
      })
      .catch((e) => {
        setErrorMessage(`[ERROR] Failed to Configure ${db}. Please try again.`);
        setLoading(false);
      });
  };

  return (
    <Box
      className={[classes.content, classes.toolbar].join(" ")}
      mt={10}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Paper>
        {loading ? (
          <ProgressView />
        ) : (
          <div style={{ padding: "10px" }}>
            <Typography variant={"h6"}>Database not configured </Typography>
            {dbType == DatabaseType.SQLSERVER && (
              <Button variant="contained" onClick={() => handleConfigureDb()}>
                Configure Now{" "}
              </Button>
            )}

            <Button
              style={{ margin: "16px" }}
              variant={"contained"}
              onClick={() => history.push("/")}
            >
              {" "}
              Back to Home
            </Button>
          </div>
        )}
      </Paper>
    </Box>
  );
};
