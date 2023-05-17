import React from 'react';
import './App.css';
import {InfraRoot} from "./sqltools";
import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const theme = createTheme();

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}><InfraRoot/></ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App;