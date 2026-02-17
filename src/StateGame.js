import React, { Component } from 'react'
import './StateGame.css';

class Button extends Component {
    constructor(props){
        super(props);
        this.state = {num: 1};
        this.changeNumber = this.changeNumber.bind(this);
    }
    changeNumber(e) {
        let rand = Math.floor(Math.random()*10 + 1);
        this.setState({num: rand});
    }
    render() {
        return (
            <div className ="StateGame">
                <h1>Number is {this.state.num}</h1>
                <button onClick={this.changeNumber} hidden={this.state.num === 7 ? true : false}>Random number</button>
                <h1 hidden={this.state.num === 7 ? false : true}>You win!!!</h1>
            </div>
        );
    };
}

export default Button;