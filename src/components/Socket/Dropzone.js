import React from 'react';
import {useDropzone} from "react-dropzone";


// active 조건에 따른 스타일을 주고싶은경우 사용
// const getClassName = (className,isActive)=>{
//     if(!isActive) return className
//     return `${className} ${className}-active`
// }
//
// ...
// <div className={getClassName("dropzone", isDragActive)} {...getRootProps()}>
// ...


const Dropzone = ({onDrop,accept}) => {
    const {
        getInputProps,getRootProps,isDragActive
    } = useDropzone({onDrop,accept})
    return (
        <div style={{border:"1px solid #ababab",textAlign:"center",padding:"30px"}}{...getRootProps()}>
            <input className="dropzone-input" {...getInputProps()}/>
            <div className="text-center">
                {isDragActive ? (<p className="dropzone-content">
                    이곳에 파일을 드래그 하세요.
                </p>):(
                    <p className="dropzone-content">
                        이곳에 파일을 드래그 하거나, 클릭하세요.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Dropzone;
