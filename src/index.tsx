import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {render} from "react-dom";

const root = document.getElementById('root') as HTMLElement
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

render(<App />, root);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// import { ThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';

// const theme = createMuiTheme();

// const useStyles = makeStyles((theme) => {
//   root: {
//     // some CSS that accesses the theme
//   }
// });

// function App() {
//   const classes = useStyles(); // ❌ If you have this, consider moving it
//   // inside of a component wrapped with <ThemeProvider />
//   return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
// }

