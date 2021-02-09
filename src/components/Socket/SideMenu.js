import React, {useState} from 'react';
import {Button, Collapse, List, ListItem, ListItemText, makeStyles, TextField} from "@material-ui/core";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {CreateNewFolder} from "@material-ui/icons";
import SimpleModal from "./SimpleModal";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper
    },
    nested: {
        paddingLeft: theme.spacing(4)
    },
    input: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    }
}))

let i = 1

const SideMenu = ({listName = "name"}) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [serverList, setServerList] = useState([]);

    // 사용자가 입력하는 5가지 값
    const [protocol, setProtocol] = useState("sftp");
    const [host, setHost] = useState("211.253.10.9");
    const [port, setPort] = useState("10021");
    const [user, setUser] = useState("root");
    const [password, setPassword] = useState("Netand141)");


    const handleClick = () => {
        setOpen(!open);
    };

    const addServer = () => {
        let temp = {id: i, name: `서버 ${i}`}
        setServerList([...serverList, temp])
        i++
    }

    const TextFieldInput = ({label, value, onChange}) => {
        return (
            <TextField
                label={label}
                value={value}
                onChange={onChange}
                variant="outlined"
            />
        )
    }

    const serverInput = (
        <div>
            <form className={classes.input}>
                <TextFieldInput label="프로토콜" value={protocol} onChange={(e) => setProtocol(e.target.value)}/>
                <TextFieldInput label="호스트" value={host} onChange={(e) => setHost(e.target.value)}/>
                <TextFieldInput label="포트" value={port} onChange={(e) => setPort(e.target.value)}/>
                <TextFieldInput label="유저" value={user} onChange={(e) => setUser(e.target.value)}/>
                <TextFieldInput label="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </form>
            <Button onClick={addServer} variant="contained" color="primary">
                완료
            </Button>
        </div>
    )

    return (
        <div>
            {/*서버 추가 버튼*/}

            <SimpleModal icon={<CreateNewFolder/>} name="서버 생성" body={serverInput}/>
            <List
                component="nav"
                aria-labelledby="nested-list-subheader"

                className={classes.root}
            >
                <ListItem button onClick={handleClick}>
                    <ListItemText primary={listName}/>
                    {/* eslint-disable-next-line react/jsx-no-undef */}
                    {open ? <ExpandLess/> : <ExpandMore/>}
                </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {serverList.map((item) => {
                            return (
                                <ListItem key={item.id} button className={classes.nested}>
                                    <ListItemText primary={item.name}/>
                                </ListItem>
                            )
                        })}
                    </List>
                </Collapse>
            </List>
        </div>
    );
};

export default SideMenu;
