import React, { Component } from 'react'
import { choice } from '../helpers';
import './Box.css'

class Box extends Component {
    constructor(props){
        super(props);
        this.state = {colour: choice(this.props.colours)};
        this.handleClick = this.handleClick.bind(this);
    }
    
    pickColour(){
        let newColour;
        do {
            newColour = choice(this.props.colours);
        } while (newColour === this.state.colour);

        this.setState({colour: newColour});
    }
    handleClick(){
        this.pickColour();
    }

    render(){
        return(
            <div 
            className='Box' 
            style={{ backgroundColor: this.state.colour }} 
            onClick={this.handleClick}>
            </div>
        )
    }

}

export default Box;