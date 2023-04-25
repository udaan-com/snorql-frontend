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

/* Example imports for nested routes
import { UserScreen } from '../database-dashboard/UserScreen';
import { ExampleScreen } from '../database-dashboard/ExampleScreen';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
**/

export const ServicesDashboardScreen: FunctionComponent<RouteComponentProps> = (props) => {
    const { serviceName } = useParams<{ serviceName: string }>();
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
        /* *** Example nested route handling **** 
        {
            title: "Example header",
            items: [
                {
                    text: "Example 2",
                    icon: <InboxIcon />,
                    subitems: [
                        {
                            text: "sub-example 1",
                            icon: <MailIcon />,
                            path: `${baseurl}/example-two/sub-one`,
                        },
                        {
                            text: "sub-example 2",
                            icon: <MailIcon />,
                            path: `${baseurl}/example-two/sub-two`,
                        },
                    ]
                },
            ]
        }***********/
    ]
    return (

        <div style={{ display: "flex" }}>
            <SideDrawer menus={menus} navbarTitle="SQL Services Dashboard" />
            <Switch>
                <Route path={baseurl + "/slow-query/realtime"} exact render={(props) => (<RelatimeSlowQueryScreen {...props} name={serviceName} type="service" />)} />
                <Route path={baseurl + "/slow-query/configure"} exact render={(props) => (<SlowQueryAlertScreen {...props} name={serviceName} type="service" />)} />

                {/* *** Example nested route handling ****
                <Route path={baseurl + "/example-two/sub-one"} exact={true} component={ExampleScreen} /> 
                <Route path={baseurl + "/example-two/sub-two"} exact={true} component={ExampleScreen} /> ***/}
            </Switch>
        </div>

    );
};
