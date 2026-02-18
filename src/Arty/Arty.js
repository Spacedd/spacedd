import React, { Component } from 'react'
import logo from '../images/spookyArty.svg';
import './Arty.css'

class Arty extends Component {
    constructor(props){
        super(props);
        this.size = this.props.size === "big" ? "Arty-big" : "Arty-small";
    }
    render(){
        return(
            <header className="Arty-header">
                <img src={logo} className={this.size} alt="logo" />
            </header>
        )
    }
}

export default Arty;