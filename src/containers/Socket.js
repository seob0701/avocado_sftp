import React, {useState, useCallback} from 'react';
import Dropzone from "../components/Socket/Dropzone";
// today to do => dropzone 으로 파일 업로드 구현 & 시간 남으면 folder tree 구조로 ui 변경하기


const Socket = () => {
    // 웹 소켓 Url
    const [url, setUrl] = useState("")

    const [connection, setConnection] = useState(false);
    // 사용자가 입력하는 5가지 값
    const [protocol, setProtocol] = useState("sftp");
    const [host, setHost] = useState("211.253.10.9");
    const [port, setPort] = useState("10021");
    const [user, setUser] = useState("root");
    const [password, setPassword] = useState("Netand141)");
    const [path, setPath] = useState(['/', 'home']);

    // 웹 소켓 연결성공시 전달받는 uuid 값
    const [uuid, setUuid] = useState("")

    // 코멘드 명령 전송시 넘어오는 파일정보
    const [files, setFiles] = useState([]);


    // Drag and Drop 콘솔출
    const onDrop = useCallback(
        (file) => {
            console.log(file)
            const ws = new WebSocket(url)
            file.forEach(item => {
                // upload start
                ws.onopen = () => {
                    sendCommand(ws, uuid, `upload_start ${path.join("")} ${item.name}`)
                    ws.onmessage = (evt) => {
                        console.log((JSON).parse(evt.data))
                        const reader = new FileReader()

                        reader.readAsArrayBuffer(item)
                        reader.onload = ()=>{
                            // send binary
                            ws.send(reader.result)
                            ws.onmessage = ()=>{
                                //upload end
                                sendCommand(ws, uuid, `upload_end ${path.join("")} ${item.name}`)
                                ws.onmessage = (evt) => {
                                    console.log((JSON).parse(evt.data))
                                    getFiles(ws)
                                }
                            }
                        }

                    }
                }
            })
        },
        [url, uuid, path],
    );

    //초기 경로로 부터 파일정보 가져오기
    const getFiles = (ws) => {
        console.log('파일을 가져오는 중입니다...')
        ws.onmessage = (evt) => {
            const rawData = JSON.parse(evt.data)?.result
            const data = rawData?.substring(1, rawData.length - 1)
            const fileList = data?.split(",").map(line => line.trim().replace(/\s{2,}/gi, ' ').split(" "))
            console.log(fileList)
            let temp = []
            fileList?.forEach(item => {
                if (item[8] !== ".." && item[8] !== ".") {
                    temp.push({
                        fileName: item[8],
                        fileSize: item[4],
                        fileType: item[0][0] === "d" ? "directory" : "file",
                        lastModified: `${item[5]} ${item[6]} ${item[7]}`,
                        permission: item[0],
                        owner: item[2],
                        group: item[3],
                        links: item[1]
                    })
                }
            })
            setFiles(temp)
        }
    }

    // Command 전송 함수
    const sendCommand = (ws, uuid, message) => {
        ws.send(JSON.stringify({
            "requestType": "Command",
            "uuid": uuid,
            "message": message
        }))
    }

    //원격서버 연결하기
    const connectServer = useCallback(() => {
        if (protocol === "" || host === "" || port === "" || user === "" || password === "") {
            alert("입력하지 않은 값이 있습니다.")
            return
        }
        const serverUrl = `ws://${host}:8080/ws/${protocol}`
        setUrl(serverUrl)
        const ws = new WebSocket(serverUrl)
        console.log("서벼 연결중...")
        ws.onopen = (evt) => {
            setConnection(true)
            console.log("서버가 연결되었습니다.")
            // 서버 연결을 위한 사용자 입력값 전송
            ws.send(JSON.stringify({
                "requestType": "Connect",
                "host": host,
                "user": user,
                "password": password,
                "port": port
            }))
            // 넘겨받은 데이터
            ws.onmessage = (evt) => {
                console.log(JSON.parse(evt.data))
                setUuid(JSON.parse(evt.data).uuid)
                const uuid = JSON.parse(evt.data).uuid
                sendCommand(ws, uuid, `ls ${path.join("")}`)
                getFiles(ws)
            }
        }
        ws.onclose = (evt) => {
            if (evt.code !== 1000) {
                console.log(`에러코드 ${evt.code} 로 서버 연결이 종료됩니다.`)
            }
            console.log('서버 연결이 종료되었습니다.')
            setConnection(false)
        }
        ws.onerror = (evt) => {
            console.log(evt.data)
        }

    }, [protocol, host, user, password, port, path])

    // 원격 서버 연결 해제하기
    const disconnectServer = useCallback(() => {
        const ws = new WebSocket(url)
        console.log("서버 연결 해제중...")
        ws.onopen = (evt) => {
            setConnection(true)
            ws.send(JSON.stringify({
                "requestType": "Disconnect",
                "uuid": uuid
            }))
            ws.onmessage = (evt) => {
                console.log('서버 연결이 해제되었습니다.')
                console.log(JSON.parse(evt.data))
            }
            setUrl("")
            setUuid("")
            setConnection(false)
        }
        ws.onerror = (evt) => {
            console.log("에러발생!")
        }
        ws.onclose = (evt) => {
            if (evt.code !== 1000) {
                console.log(`에러코드 ${evt.code} 로 서버 연결이 종료됩니다.`)
            }
        }
    }, [url, uuid])

    // 트리 이동
    const moveTree = useCallback((item) => {
        let nextPath = path
        if (typeof item === 'string') {
            if (path.length > 1) {
                nextPath.pop()
                const ws = new WebSocket(url)
                ws.onopen = () => {
                    sendCommand(ws, uuid, `ls ${nextPath.join("")}`)
                    getFiles(ws)
                }
                setPath(nextPath)
            } else {
                alert("최상위 경로 입니다.")
            }
        } else {
            if (item.fileType === 'directory') {

                nextPath.push(`/${item.fileName}`)
                const ws = new WebSocket(url)
                ws.onopen = () => {
                    sendCommand(ws, uuid, `ls ${nextPath.join("")}`)
                    getFiles(ws)
                }
                setPath(nextPath)
            }
        }

    }, [path, uuid, url])

    return (
        <div style={{padding: "24px"}}>
            <h3>웹 소켓 서버 연결</h3>
            <select name="protocol" onChange={(e) => setProtocol(e.target.value)} placeholder="프로토콜">
                <option value="sftp">SFTP</option>
                <option value="ftp">FTP</option>
            </select>
            <input type="text" name="host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="호스트"/>
            <input type="text" name="port" value={port} onChange={(e) => setPort(e.target.value)}
                   placeholder="원격 서버포트"/>
            <input type="text" name="user" value={user} onChange={(e) => setUser(e.target.value)} placeholder="사용자"/>
            <input type="text" name="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="비밀번호"/>
            <button onClick={connectServer}>서버 연결</button>
            <button onClick={disconnectServer}>서버 연결해제</button>
            {/*  */}
            {/* 파일 업로드 */}
            {connection &&
            <div>
                <Dropzone onDrop={onDrop}/>
                <div>
                    <h3>디렉토리 테이블</h3>
                    <table>
                        <thead style={{marginBottom: "20px"}}>
                        <tr>
                            <th>파일명</th>
                            <th>크기</th>
                            <th>링크 수</th>
                            <th>파일 유형</th>
                            <th>최종 수정</th>
                            <th>권한</th>
                            <th>소유자/그룹</th>
                        </tr>
                        </thead>
                        <tbody>
                        {path.length > 1 &&
                        <tr>
                            <th onClick={() => moveTree('moveUp')} style={{textAlign: "left", color: 'red'}}>Back</th>
                        </tr>
                        }

                        {files.map((item, i) => {
                            return (
                                <tr key={i} onClick={() => moveTree(item)}>
                                    <th style={{textAlign: "left"}}>{item.fileName}</th>
                                    <th>{item.fileSize}</th>
                                    <th>{item.links}</th>
                                    <th>{item.fileType}</th>
                                    <th>{item.lastModified}</th>
                                    <th>{item.permission}</th>
                                    <th>{`${item.owner}/${item.group}`}</th>
                                    <th>
                                        <button>download</button>
                                    </th>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    );
};

export default Socket;
