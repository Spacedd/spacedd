import React, { Component } from 'react'
import './Die.css';

class Die extends Component {
    render() {
        return (
            <i className={`Die fa-solid fa-dice-${this.props.face} ${this.props.rolling && 'wobbling'}`} />
        );
    }
}

export default Die;