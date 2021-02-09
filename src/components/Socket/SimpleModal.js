import React, {useState} from 'react';
import Modal from '@material-ui/core/Modal';
import {Button, makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: "auto",
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #000',
        boxShadow: theme.shadows[3],
        padding: theme.spacing(3),
    },
}))

function getModalStyle() {
    const top = 50 ;
    const left = 50 ;
    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

export default function SimpleModal({body, name, icon}) {

    // getModalStyle is not a pure function, we roll the style only on the first render
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button onClick={handleOpen} variant="contained" color="primary" startIcon={icon}>
                {name}
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {
                    <div style={modalStyle} className={classes.paper}>
                        {body}
                    </div>
                }
            </Modal>
        </div>
    );
}
