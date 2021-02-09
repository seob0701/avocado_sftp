import React from 'react'
import Socket from "./containers/Socket";
// import Designed from './components/Socket/Designed'

// for strict mode error
import {ThemeProvider, unstable_createMuiStrictModeTheme} from '@material-ui/core/styles'

const theme = unstable_createMuiStrictModeTheme()

function App() {
    return (
        <ThemeProvider theme={theme}>
            <div className="App" style={{padding:'10px'}}>
                <Socket/>
                {/*<Designed/>*/}
            </div>
        </ThemeProvider>
    );
}

export default App;
