import * as React from "react";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";

export interface ConfirmationDialogRawProps {
    onClose: (confirm: boolean) => void;
}

const Confirm: React.FC<ConfirmationDialogRawProps> = (props: ConfirmationDialogRawProps) => {
    const { onClose } = props;

    const handleCancel = () => {
        onClose(false);
    };

    const handleOk = () => {
        onClose(true);
    };

    return (
        <Dialog
            sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
            maxWidth="xs"
            open={true}
        >
            <DialogTitle>Löschen</DialogTitle>
            <DialogContent dividers>
                Möchtest du den Eintrag wirklisch löschen?
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleCancel}>
                    Abbrechen
                </Button>
                <Button color={"error"} onClick={handleOk}>Bestätigen</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Confirm;