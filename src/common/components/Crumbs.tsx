import React from 'react';
import {RouteComponentProps, withRouter} from "react-router";
import {Box, Breadcrumbs, Link, Paper, Typography} from "@material-ui/core";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

declare global {
    interface Window {
        CONFIG: {
            pathPrefix: string;
        }
    }
}

export interface Crumb {
    name: string;
    path?: string;
}

interface Props extends RouteComponentProps {
    crumbs: Crumb[];
}

class Crumbs extends React.Component<Props> {

    private getPath = (path: string) => {
        return path;
    };

    private navigateTo = (path: string) => {
        this.props.history.push(this.getPath(path));
    };

    render() {
        const {crumbs} = this.props;
        return (
            <Box display={'flex'} flex={1}>
                <Paper>
                    <Box px={2} py={1}>
                        <Breadcrumbs aria-label="Breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
                            {crumbs.map(({name, path}) => {
                                if (path) {
                                    return (
                                        <Link
                                            key={name}
                                            color="inherit"
                                            href={this.getPath(path)}
                                            onClick={() => this.navigateTo(path)}
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else {
                                    return (
                                        <Typography
                                            key={name}
                                            color="textPrimary"
                                        >
                                            {name}
                                        </Typography>
                                    );
                                }
                            })}
                        </Breadcrumbs>
                    </Box>
                </Paper>
            </Box>
        );
    }
}

export default withRouter(Crumbs);
