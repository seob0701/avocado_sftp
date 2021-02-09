import React, {useState, useCallback, useRef} from 'react';
import Dropzone from "../components/Socket/Dropzone";
// 시간 남으면 folder tree 구조로 ui 변경하기


const Socket = () => {
    // 서버 리스트
    // 각각의 오브젝트에 id, name, protocol, host, user, password, path, connection, ws, files, uuid, url 저장
    const [serverList, setServerList] = useState([]);
    const serverId = useRef(0)


    // Drag and Drop 콘솔출
    const onDrop = useCallback(
        (server) => {
            console.log(server)
            const ws = new WebSocket(server.url)
            const {uuid,files,path} = server
            files.forEach(item => {
                // upload start
                ws.onopen = () => {
                    sendCommand(ws, uuid, `upload_start ${path.join("")} ${item.fileName}`)
                    ws.onmessage = (evt) => {
                        console.log((JSON).parse(evt.data))
                        const reader = new FileReader()

                        reader.readAsArrayBuffer(item)
                        reader.onload = () => {
                            // send binary
                            ws.send(reader.result)
                            ws.onmessage = () => {
                                //upload end
                                sendCommand(ws, uuid, `upload_end ${path.join("")} ${item.fileName}`)
                                ws.onmessage = (evt) => {
                                    console.log((JSON).parse(evt.data))
                                }
                                // getFiles(ws)
                            }
                        }

                    }
                }
            })
        },
        [],
    );

    //초기 경로로 부터 파일정보 가져오기
    const getFiles = ((ws, server) => {
        console.log('파일을 가져오는 중입니다...')
        ws.onmessage = (evt) => {
            const rawData = JSON.parse(evt.data)?.result
            const data = rawData?.substring(1, rawData.length - 1)
            const fileList = data?.split(",").map(line => line.trim().replace(/\s{2,}/gi, ' '))
            let temp = []
            fileList?.forEach(item => {
                const value = item.split(" ")
                if (value[8] !== ".." && value[8] !== ".") {
                    temp.push({
                        fileName: value[8],
                        fileSize: value[4],
                        fileType: value[0][0] === "d" ? "directory" : "file",
                        lastModified: `${value[5]} ${value[6]} ${value[7]}`,
                        permission: value[0],
                        owner: value[2],
                        group: value[3],
                        links: value[1]
                    })
                }
            })
            Object.assign(server, {files: temp})
        }
    })
    // Command 전송 함수

    const sendCommand = (ws, uuid, message) => {
        ws.send(JSON.stringify({
            "requestType": "Command",
            "uuid": uuid,
            "message": message
        }))
    }

    //원격서버 연결하기
    const connectServer = useCallback((server) => {
        console.log(server)
        if (server.protocol === "" || server.host === "" || server.port === "" || server.user === "" || server.password === "") {
            alert("입력하지 않은 값이 있습니다.")
            return
        }
        if (server.connection) {
            alert("현재 서버가 연결되어 있습니다.")
            return
        }

        const serverUrl = `ws://${server.host}:8080/ws/${server.protocol}`
        const ws = new WebSocket(serverUrl)
        Object.assign(server, {url: serverUrl})
        // console.log(server)

        console.log("서벼 연결중...")
        ws.onopen = (evt) => {
            Object.assign(server, {connection: true})
            console.log("서버가 연결되었습니다.")
            // 서버 연결을 위한 사용자 입력값 전송
            ws.send(JSON.stringify({
                "requestType": "Connect",
                "host": server.host,
                "user": server.user,
                "password": server.password,
                "port": server.port
            }))
            // 넘겨받은 데이터
            ws.onmessage = (evt) => {
                console.log(JSON.parse(evt.data))
                const uuid = JSON.parse(evt.data).uuid
                Object.assign(server, {uuid: uuid})
                sendCommand(ws, uuid, `ls ${server.path.join("")}`)
                getFiles(ws, server)
            }
        }
        ws.onclose = (evt) => {
            if (evt.code !== 1000) {
                console.log(`에러코드 ${evt.code} 로 서버 연결이 종료됩니다.`)
            }
            console.log('서버 연결이 종료되었습니다.')
            Object.assign(server, {connection: false})
        }
        ws.onerror = (evt) => {
            console.log(evt.data)
        }
    }, [])

    // 원격 서버 연결 해제하기
    const disconnectServer = useCallback((server) => {
        if (!server.connection) {
            alert("연결된 서버가 없습니다.")
            return
        }
        const ws = new WebSocket(server.url)
        const uuid = server.uuid
        console.log("서버 연결 해제중...")
        console.log(server)
        ws.onopen = () => {
            ws.send(JSON.stringify({
                "requestType": "Disconnect",
                "uuid": uuid
            }))
            ws.onmessage = (evt) => {
                console.log('서버 연결이 해제되었습니다.')
                Object.assign(server, {connection: false})
                console.log(JSON.parse(evt.data))
            }
        }
        ws.onerror = (evt) => {
            console.log("에러발생!")
        }
        ws.onclose = (evt) => {
            if (evt.code !== 1000) {
                console.log(`에러코드 ${evt.code} 로 서버 연결이 종료됩니다.`)
            }
        }
    }, [])

    // 트리 이동
    const moveTree =(server, key) => {
        let nextPath = server.path
        const uuid = server.uuid
        const url = server.url
        const ws = new WebSocket(url)
        if (key === 'up') {
            if (nextPath.length > 1) {
                nextPath.pop()
                ws.onopen = () => {
                    sendCommand(ws, uuid, `ls ${nextPath.join("")}`)
                    getFiles(ws, server)
                }
                Object.assign(server, {path: nextPath})
            } else {
                alert("최상위 경로 입니다.")
            }
        } else {
            const item = key
            if (item.fileType === 'directory') {
                nextPath.length === 1 ? nextPath.push(`${item.fileName}`) : nextPath.push(`/${item.fileName}`)
                ws.onopen = () => {
                    sendCommand(ws, uuid, `ls ${nextPath.join("")}`)
                    getFiles(ws, server)
                }
                Object.assign(server, {path: nextPath})
            }
        }
    }

    // 새 서버 만들
    const createServer = () => {
        const nextId = serverId.current++
        setServerList([...serverList, {
            id: nextId, name: `서버 ${nextId}`,
            protocol: 'sftp', host: "", port: "", user: "", password: "",
            path: ['/'], files: [], connection: false, uuid: "", url: ""
        }])
    }

    const selectServer = (item) => {
        console.log(item)
    }

    // 서버 삭제하기
    const deleteServer = (server) => {
        let temp = serverList.filter(item => item.id !== server.id)
        setServerList(temp)
    }

    const addServerList = (e, server) => {
        const {value, name} = e.target

        name === "protocol" && Object.assign(server, {protocol: value})
        name === "host" && Object.assign(server, {host: value})
        name === "port" && Object.assign(server, {port: value})
        name === "user" && Object.assign(server, {user: value})
        name === "password" && Object.assign(server, {password: value})

        console.log(serverList)
    }

    // 다운로드
    const onDownload = (server, filename) => {
        console.log(server,filename)
        const ws = new WebSocket(server.url)
        const {uuid,path} = server
        ws.onopen = () => {
            sendCommand(ws, uuid, `download ${path.join("")} ${filename}`)
            ws.onmessage = (evt) => {
                if (evt.data instanceof Blob) {
                    console.log('blob')
                    saveFile(evt.data, filename)
                } else if (evt.data instanceof ArrayBuffer) {
                    console.log('array buffer')
                } else {
                    const message = JSON.parse(evt.data)
                    if (Object.keys(message).length === 1) {
                        const uid = message["uuid"]
                        console.log(uid)
                    }
                    console.log(message)
                }
            }
        }
    }

    const saveFile = (blob, filename) => {
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display:none'
        const uurl = window.URL.createObjectURL(blob)
        a.href = uurl
        a.download = filename
        a.click();
        window.URL.revokeObjectURL(uurl)
    }


    return (
        <div style={{padding: "24px"}}>
            <h3>서버 생성하기</h3>
            <button onClick={createServer}>새 서버</button>
            <ul>
                {serverList.map(item => {
                    return (
                        <li key={item.id}>
                            <label>
                                {item.name}
                                <input type="checkbox" value={item.id} onClick={() => selectServer(item)}/>
                            </label>
                        </li>
                    )
                })}
            </ul>
            {serverList.map(server => {
                return (
                    <div key={server.id}>
                        <h3>{server.id}번 웹 소켓 서버</h3>
                        <select name="protocol" onChange={(e) => addServerList(e, server)} placeholder="프로토콜">
                            <option value="sftp">SFTP</option>
                            <option value="ftp">FTP</option>
                        </select>
                        <input type="text" name="host" onChange={(e) => addServerList(e, server)}
                               placeholder="호스트"/>
                        <input type="text" name="port" onChange={(e) => addServerList(e, server)}
                               placeholder="원격 서버포트"/>
                        <input type="text" name="user" onChange={(e) => addServerList(e, server)}
                               placeholder="사용자"/>
                        <input type="text" name="password" onChange={(e) => addServerList(e, server)}
                               placeholder="비밀번호"/>
                        <button onClick={() => connectServer(server)}>서버 연결</button>
                        <button onClick={() => disconnectServer(server)}>서버 연결해제</button>
                        <button onClick={() => deleteServer(server)}>서버 삭제</button>
                        {server.connection &&
                        <div>
                            <Dropzone onDrop={() => onDrop(server)}/>
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
                                    <tr>
                                        <th onClick={() => moveTree(server, "up")}
                                            style={{textAlign: "left", color: 'red'}}>Back
                                        </th>
                                    </tr>
                                    {
                                        server.files.map((item, i) => {
                                            return (
                                                <tr key={i}>
                                                    <th onClick={() => moveTree(server, item)}
                                                        style={{textAlign: "left"}}>{item.fileName}</th>
                                                    <th>{item.fileSize}</th>
                                                    <th>{item.links}</th>
                                                    <th>{item.fileType}</th>
                                                    <th>{item.lastModified}</th>
                                                    <th>{item.permission}</th>
                                                    <th>{`${item.owner}/${item.group}`}</th>
                                                    <th>
                                                        <button
                                                            onClick={() => onDownload(server, item.fileName)}>download
                                                        </button>
                                                    </th>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        }
                    </div>
                )
            })}
        </div>
    );
};

export default Socket;
