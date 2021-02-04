import React, {useState} from 'react';

// 입력박스 컴포넌트 분리
const InputBox = ({name, onChange, value}) => {
    return (
        <div>
            <label htmlFor={name} style={{marginRight: '10px'}}>{name} :</label>
            <input type="text" name={name} onChange={onChange} value={value}/>
        </div>
    )
}

// newList 생성시 id
let i = 1;

const handleClick = () => {
    const newList = document.createElement('li')
    const siteList = document.getElementById('site_list')

    newList.innerText = `newSite ${i}`
    newList.setAttribute("style", "padding:4px; marginTop:4px;")
    newList.setAttribute("id", `${i}`)
    siteList.appendChild(newList)
    i++
}

const SiteAdmin = () => {
    const [protocol, setProtocol] = useState("sftp");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [user, setUser] = useState("");
    const [uuid, setUuid] = useState("");
    const [password, setPassword] = useState("");

    const handleChange = (e) => {
        const {value, name} = e.target
        name === 'host' && setHost(value)
        name === 'port' && setPort(value)
        name === 'user' && setUser(value)
        name === 'password' && setPassword(value)
    }

    const remoteServer = `ws://${host}:8080/ws/${protocol}`

    const serverRequest = {
        "requestType": "Connect",
        "host": host,
        "user": user,
        "password": password,
        "port": port
    }

    const linkHandler = () => {
        console.log(remoteServer)
        if (host !== "" && port !== "" && user !== "" && password !== "") {
            const ws = new WebSocket(remoteServer)
            ws.onopen = (e) => {
                ws.send(JSON.stringify(serverRequest))
                ws.onmessage = (e) => {
                    console.log(e.data)
                }
            }

        } else {
            alert('입력하지 않은 값이 있습니다.')
        }
    }


    return (
        <>
            <div className="site_list">
                <h3>Select Entry</h3>
                <button onClick={handleClick}>새 사이트</button>
                <ul id="site_list" style={{background: '#e7e7e7', width: '500px', padding: '20px'}}>
                </ul>
            </div>
            <div className="remote_site_form">
                <h3>Remote Site</h3>
                <form style={{background: '#e7e7e7', width: '500px', padding: '20px'}}>
                    <label htmlFor="protocol" style={{marginRight: '10px'}}>프로토콜 :</label>
                    <select name="protocol" value={protocol} onChange={(e) => setProtocol(e.target.value)}>
                        <option value="sftp" defaultValue={`sftp`}>SFTP</option>
                        <option value="ftp">FTP</option>
                    </select>
                    <InputBox name="host" onChange={(e) => handleChange(e)} value={host}/>
                    <InputBox name="port" onChange={(e) => handleChange(e)} value={port}/>
                    <InputBox name="user" onChange={(e) => handleChange(e)} value={user}/>
                    <InputBox name="password" onChange={(e) => handleChange(e)} value={password}/>
                </form>
                <button onClick={linkHandler}>연결</button>
            </div>
        </>
    );
};

export default SiteAdmin;
