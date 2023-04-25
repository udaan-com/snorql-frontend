import React, {FunctionComponent, useState} from "react";
import {Route, RouteComponentProps, Switch} from "react-router-dom";
import SideDrawer from "../../components/SideDrawer";
import {ErrorMessageCard} from "../../components/ErrorMessageCard";
import {Menus} from "../../models";
import VisibilityIcon from "@material-ui/icons/Visibility";
import {GithubQueryAnalyser} from "./github/GithubQueryAnalyser";
import {Box} from "@material-ui/core";

export const DocSAnalyserDashboard: FunctionComponent<RouteComponentProps> = (props) => {
  const baseurl = props.match.url;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const menus: Menus[] = [
    {
      title: "Analyser",
      items: [
        {
          text: 'Github Analyser',
          icon: <VisibilityIcon />,
          path: `${baseurl}/github-analyser`,
        },
        {
          text: 'Adhoc Analyser',
          icon: <VisibilityIcon />,
          path: `${baseurl}/adhoc-analyser`,
        },
      ]
    }
  ];


  return (
    <div style={{ display: "flex" }}>
      <SideDrawer menus={menus} navbarTitle="DocS Query Analyser Dashboard" />
      {errorMessage && <ErrorMessageCard text={errorMessage} />}
      <Switch>
          <Route path={baseurl + "/github-analyser"} exact render={(props) => ( <GithubQueryAnalyser /> )} />
          <Route path={baseurl + "/adhoc-analyser"} exact render={(props) => ( <Box />)} />
      </Switch>
    </div>
  );
};
