import { Snackbar } from "@material-ui/core"
import Alert, { Color } from "@material-ui/lab/Alert"
import React, { useEffect, useState } from "react"

interface Props {
    handleClose: () => void;
    snackbarOpen: boolean;
    snackbarType: string; // error, warning, info, success
    snackbarMessage: string | undefined;
    snackbarDuration?: number;
}

export const SnackbarComponent: React.FunctionComponent<Props> = (props: Props) => {
    const {snackbarOpen, snackbarType, snackbarMessage, snackbarDuration, handleClose } = props
    const [snackbarTypeColor, setSnackbarTypeColor] = useState<Color>('error')

    useEffect(() => {
        if (snackbarType == 'error') { setSnackbarTypeColor('error') }
        else if (snackbarType == 'success') { setSnackbarTypeColor('success') }
        else if (snackbarType == 'warning') { setSnackbarTypeColor('warning') }
        else if (snackbarType == 'info') { setSnackbarTypeColor('info') }
    }, [snackbarType])

    return (
        <Snackbar open={snackbarOpen} autoHideDuration={snackbarDuration || 5000} onClose={handleClose}>
            <Alert severity={snackbarTypeColor}>
                {snackbarMessage}
            </Alert>
        </Snackbar>
    )
}