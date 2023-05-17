import React from 'react';
import {AppBar, Box, Button, Container, IconButton, Typography} from "@mui/material";
import Crumbs, {Crumb} from "./Crumbs";
import {ArrowBack, Home, SvgIconComponent} from "@mui/icons-material";
import {useHistory} from "react-router";
import {FBox} from "./FBox";

interface ScreenContainerProps<R> {
    title: string;
    crumbs?: Crumb[];
    hideBack?: boolean;
    rightButtons?: Array<{
        title: string,
        icon?: SvgIconComponent,
        onPress: (ev: any) => void,
    }>;
    maxWidth?: 'lg'|'xl';
    children: (string | JSX.Element | JSX.Element[] | boolean )
}

export class ScreenContainer<R> extends React.Component<ScreenContainerProps<R>> {

    private renderButtons () {
        const {rightButtons} = this.props;
        if (rightButtons) {
            return (
                <Box flexDirection={'row'}>
                    {rightButtons.map(it => {
                        const Icon = it.icon;
                        return (
                            <Button
                                key={it.title}
                                color={"primary"}
                                variant="contained"
                                size={"small"}
                                onClick={it.onPress}
                            >
                                {Icon && <Icon />}
                                {it.title}
                            </Button>
                        )
                    })}
                </Box>
            );
        }
    }

    componentDidMount () {
        const {title} = this.props;
        if (title) {
            window.document.title = `${title} | Dev Tools`;
        }
    }


    render () {
        const {title, crumbs, rightButtons, hideBack, children, maxWidth} = this.props;
        return (
            <Box>
                <AppBar position="static">
                    <Container maxWidth={maxWidth || 'lg'}>
                        <FBox pt={2} pb={2} flexDirection={"row"} alignItems={"center"}>
                            <Btns hideBack={hideBack} />
                            <Typography variant="h5">
                                {title}
                            </Typography>
                        </FBox>
                    </Container>
                </AppBar>
                <Container maxWidth={maxWidth || 'lg'}>
                    {(crumbs || (rightButtons && rightButtons.length)) && (
                        <Box marginBottom={2} display={'flex'} flexDirection={'row'} justifyContent={'space-between'} marginY={2}>
                            {crumbs && <Crumbs crumbs={crumbs}/>}
                            {this.renderButtons()}
                        </Box>
                    )}
                    {children}
                </Container>
            </Box>
        );
    }
}

const Btns = ({hideBack}: {hideBack?: boolean}) => {
    const history = useHistory();
    return (
        <Box mr={2}>
            {!hideBack && (
                <IconButton onClick={() => history.goBack()} color={"default"} size="large">
                    <ArrowBack />
                </IconButton>
            )}
            <IconButton onClick={() => history.push("/")} color={"default"} size="large">
                <Home />
            </IconButton>
        </Box>
    );
};
