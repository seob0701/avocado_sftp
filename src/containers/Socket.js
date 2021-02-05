import React, {useState} from 'react';


const Socket = () => {
    const [connection, setConnection] = useState(false);

    const [protocol, setProtocol] = useState("sftp");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    const [uuid, setUuid] = useState("")
    const [url, setUrl] = useState("")

    //원격서버 연결하기
    const connectServer = () => {
        if (protocol === "" || host === "" || port === "" || user === "" || password === "") {
            alert("입력하지 않은 값이 있습니다.")
            return
        }
        if (connection === true) {
            alert("이미 서버가 연결되어있습니다.")
            return
        }
        const serverUrl = `ws://${host}:8080/ws/${protocol}`
        const ws = new WebSocket(serverUrl)

        if (ws.readyState !== 1) {
            console.log("연결중...")
            // 잘못된 프로토콜 및 호스트 넘버 입력시 에러 핸들링!
        }

        ws.onopen = (evt) => {
            ws.onerror = (evt) => {
                console.log(evt.data)
            }
            ws.send(JSON.stringify({
                "requestType": "Connect",
                "host": host,
                "user": user,
                "password": password,
                "port": port
            }))
            ws.onmessage = (evt) => {
                console.log('원격 서버와 연결되었습니다.')
                console.log(JSON.parse(evt.data))
                setUuid(JSON.parse(evt.data).uuid)
                setConnection(true)
            }
            ws.onclose = (evt) => {
                if (evt.code !== 1000) {
                    console.log(`에러코드 ${evt.code} 로 서버 연결이 종료됩니다.`)
                }
                console.log('서버 연결이 종료되었습니다.')
                setConnection(false)
            }
        }
        setUrl(serverUrl)
    }

    const disconnectServer = () => {
        if (connection === false) {
            alert("연결된 서버가 없습니다.")
            return
        }
        const ws = new WebSocket(url)
        if (ws.readyState !== 3) {
            console.log('연결 해제 중...')
        }
        ws.onopen = (evt) => {
            ws.send(JSON.stringify({
                "requestType": "Disconnect",
                "uuid": uuid
            }))
            ws.onmessage = (evt) => {
                console.log('연결이 해제되었습니다.')
                console.log(JSON.parse(evt.data))
            }
            ws.onclose = (evt) => {
                console.log(`연결해제 에러코드 : ${evt.code}`)
                setConnection(false)
            }
            ws.onerror = (evt) => {
                console.log(`onerror excution`)
                setConnection(false)
            }
            setUrl("")
            setUuid("")
            setConnection(false)
        }
    }
    return (
        <div style={{padding: "24px"}}>
            {/* 웹 소켓 서버 연결 */}
            <h3>웹 소켓 서버 연결</h3>
            <select name="protocol" onChange={(e) => setProtocol(e.target.value)} placeholder="프로토콜">
                <option value="sftp">SFTP</option>
                <option value="ftp">FTP</option>
            </select>
            <input type="text" name="host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="호스트"/>
            <input type="text" name="port" value={port} onChange={(e) => setPort(e.target.value)}
                   placeholder="원격 서버포트"/>
            <input type="text" name="user" value={user} onChange={(e) => setUser(e.target.value)} placeholder="사용자"/>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="비밀번호"/>
            <button onClick={connectServer}>서버 연결</button>
            <button onClick={disconnectServer}>서버 연결해제</button>
            {/*  */}
            {/*  */}
            {/*  */}
            {/*<input type="file"/>*/}

        </div>
    );
};

export default Socket;
