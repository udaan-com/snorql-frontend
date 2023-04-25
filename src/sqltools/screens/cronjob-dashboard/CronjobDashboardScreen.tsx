import { ScreenContainer } from "../../../common/components/ScreenContainer";
import React, { FunctionComponent } from "react";
import { Route, Switch, RouteComponentProps } from "react-router-dom";
import SideDrawer from "../../components/SideDrawer";
import { Menus } from "../../models";
import SettingsIcon from '@material-ui/icons/Settings';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import { RelatimeSlowQueryScreen } from '../common-screens/RealtimeSlowQueryScreen';
import { useParams } from "react-router";
import { SlowQueryAlertScreen } from '../common-screens/SlowQueryAlertScreen';

export const CronjobDashboardScreen: FunctionComponent<RouteComponentProps> = (props) => {
    const { cronjobName } = useParams<{ cronjobName: string }>();
    const baseurl = props.match.url
    const menus: Menus[] = [
        {
            title: "Slow Queries",
            items: [
                {
                    text: 'Realtime View',
                    icon: <HourglassEmptyIcon />,
                    path: `${baseurl}/slow-query/realtime`,
                },
                {
                    text: 'Configure Alerts',
                    icon: <SettingsIcon />,
                    path: `${baseurl}/slow-query/configure`,
                },
            ]

        },
    ]
    return (

        <div style={{ display: "flex" }}>
            <SideDrawer menus={menus} navbarTitle="SQL Cronjobs Dashboard" />
            <Switch>
                <Route path={baseurl + "/slow-query/realtime"} exact render={(props) => (<RelatimeSlowQueryScreen {...props} name={cronjobName} type="cronjob" />)} />
                <Route path={baseurl + "/slow-query/configure"} exact render={(props) => (<SlowQueryAlertScreen {...props} name={cronjobName} type="cronjob" />)} />
            </Switch>
        </div>

    );
};
