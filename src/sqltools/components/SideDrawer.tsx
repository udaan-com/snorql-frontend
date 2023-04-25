import React from 'react'
import { ScreenContainer } from "../../common/components/ScreenContainer";

import { Drawer, List, ListItem, ListItemText, ListItemIcon, ListSubheader, Divider, Collapse, Hidden, IconButton, CssBaseline, AppBar, Toolbar, Typography, Box } from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { RouteComponentProps, withRouter } from "react-router-dom";
import { useHistory, useLocation } from 'react-router';
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { MenuItem, Menus } from '../models';
import MenuIcon from '@material-ui/icons/Menu';
import { ArrowBack, Home } from '@material-ui/icons';
import { useAdminEmail } from '../../hooks';
import { selectMetricEvent } from '../tracking/TrackEventMethods';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        drawerPaper: {
            width: drawerWidth,
        },
        toolbar: theme.mixins.toolbar,

        nestedItems: {
            paddingLeft: theme.spacing(4),
        },
        closeMenuButton: {
            marginRight: 'auto',
            marginLeft: 0,
        },
        appBar: {
            [theme.breakpoints.up('sm')]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
    }),
);

const SideDrawer: React.FunctionComponent<RouteComponentProps & { menus: Menus[], navbarTitle: string, dbName?: string }> = ({ history, menus, navbarTitle, dbName }) => {
    const classes = useStyles();
    const { pathname } = useLocation<Location>()
    const [itemsClicked, setItemsClicked] = React.useState<any>({});
    const [open, setOpen] = React.useState(false);
    const email = useAdminEmail();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const triggerSelectMetricEvent = (metricTitle: string, metricText: string) => {        
        dbName && selectMetricEvent({
            dbName,
            userEmail: email,
            metricTitle,
            metricText
        })
    }

    const handleItemClickWithSubItems = (menuTitle: string, item: MenuItem) => {
        setItemsClicked({ [item.text]: !itemsClicked[item.text] })
        triggerSelectMetricEvent(menuTitle, item.text)
    }

    const handleItemClickWithNoSubItems = (menuTitle: string, itemText: string, itemPath: string) => {
        history.push(itemPath);
        triggerSelectMetricEvent(menuTitle, itemText)
    }

    return (
        <div className={classes.root} >
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Btns />
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        {navbarTitle}
                    </Typography>
                </Toolbar>
            </AppBar>

            <nav className={classes.drawer} >
                <Hidden xsUp implementation="css">
                    <Drawer
                        variant="temporary"
                        classes={{ paper: classes.drawerPaper }}
                        anchor="left"
                        open={open}
                        onClose={handleDrawerToggle}
                    >
                        <IconButton onClick={handleDrawerToggle} className={classes.closeMenuButton}>
                            X
                        </IconButton>
                        <div>
                            <div className={classes.toolbar} />
                            <Divider />
                            {menus.map((menu, index) => (
                                <List key={index} subheader={<ListSubheader>{menu.title}</ListSubheader>} >
                                    {menu.items.map((item, j) => (
                                        <div key={j}>
                                            {item.subitems != null ? (
                                                <div key={j}>
                                                    <ListItem 
                                                        button key={j} 
                                                        onClick={() => handleItemClickWithSubItems(menu.title, item)} 
                                                        selected={item.path === pathname}
                                                    >
                                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                                        <ListItemText primary={item.text} />
                                                        {itemsClicked[item.text] ? (
                                                            <ExpandLess />
                                                        ) : (
                                                            <ExpandMore />
                                                        )}
                                                    </ListItem>
                                                    <Collapse key={index} component="li" in={itemsClicked[item.text]} timeout="auto" unmountOnExit >
                                                        <List disablePadding>
                                                            {item.subitems.map((sitem, k) => (
                                                                <ListItem button key={k} 
                                                                    className={classes.nestedItems} 
                                                                    onClick={() => handleItemClickWithNoSubItems(menu.title, sitem.text, sitem.path)} 
                                                                    selected={sitem.path === pathname} 
                                                                >
                                                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                                                    <ListItemText key={j} primary={sitem.text} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Collapse>{" "}
                                                </div>
                                            ) : (
                                                <ListItem 
                                                    button key={j} 
                                                    onClick={() => item.path && handleItemClickWithNoSubItems(menu.title, item.text, item.path)} 
                                                    selected={item.path === pathname}
                                                >
                                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                                    <ListItemText primary={item.text} />
                                                </ListItem>
                                            )}
                                        </div>
                                    ))}
                                </List>
                            ))}
                            <Divider />
                        </div>
                    </Drawer>
                </Hidden>
                <Hidden xsDown={true} implementation="css">
                    <Drawer
                        variant="permanent"
                        classes={{ paper: classes.drawerPaper }}
                        open
                    >
                        <div className={classes.toolbar} />
                        <Divider />
                        {menus.map((menu, index) => (
                            <List key={index} subheader={<ListSubheader>{menu.title}</ListSubheader>} >
                                {menu.items.map((item, j) => (
                                    <div key={j}>
                                        {item.subitems != null ? (
                                            <div key={j}>
                                                <ListItem 
                                                    button key={j} 
                                                    onClick={() => handleItemClickWithSubItems(menu.title, item)} 
                                                    selected={item.path === pathname}
                                                >
                                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                                    <ListItemText primary={item.text} />
                                                    {itemsClicked[item.text] ? (
                                                        <ExpandLess />
                                                    ) : (
                                                        <ExpandMore />
                                                    )}
                                                </ListItem>
                                                <Collapse key={index} component="li" in={itemsClicked[item.text]} timeout="auto" unmountOnExit >
                                                    <List disablePadding>
                                                        {item.subitems.map((sitem, k) => (
                                                            <ListItem 
                                                                button key={k} 
                                                                className={classes.nestedItems} 
                                                                onClick={() => handleItemClickWithNoSubItems(menu.title, sitem.text, sitem.path)} 
                                                                selected={sitem.path === pathname} 
                                                            >
                                                                <ListItemIcon>{item.icon}</ListItemIcon>
                                                                <ListItemText key={j} primary={sitem.text} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>{" "}
                                            </div>
                                        ) : (
                                            <ListItem 
                                                button key={j} 
                                                onClick={() => item.path && handleItemClickWithNoSubItems(menu.title, item.text, item.path)}
                                                selected={item.path === pathname}
                                            >
                                                <ListItemIcon>{item.icon}</ListItemIcon>
                                                <ListItemText primary={item.text} />
                                            </ListItem>
                                        )}
                                    </div>
                                ))}
                            </List>
                        ))}
                        <Divider />
                    </Drawer>
                </Hidden>
            </nav>
        </div>
    );
};
const Btns = ({ hideBack }: { hideBack?: boolean }) => {
    const history = useHistory();
    return (
        <Box mr={2}>
            {!hideBack && (
                <IconButton onClick={() => history.goBack()} color={"default"}>
                    <ArrowBack />
                </IconButton>
            )}
            <IconButton onClick={() => history.push("/")} color={"default"}>
                <Home />
            </IconButton>
        </Box>
    );
};

export default withRouter(SideDrawer)