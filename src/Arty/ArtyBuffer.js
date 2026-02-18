import React, { Component } from 'react'
import Arty from './Arty' 

class Buffer extends Component {
    render(){
        return(
            <div className="Arty-buffer">
                <Arty size={"small"}/>
                <Arty size={"small"}/>
                <Arty size={"small"}/>
                <Arty size={"small"}/>
                <Arty size={"small"}/>
                <Arty size={"small"}/>
                <Arty size={"small"}/>
            </div>
        )
    }
}

export default Buffer;