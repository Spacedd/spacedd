import React, { Component } from 'react';
import Box from './Box';
import './BoxContainer.css'

class BoxContainer extends Component {
    static defaultProps = {
        numBoxes: 18,
        allColours: ['purple', 'magenta', 'violet']
    };
    render(){
        const boxes = Array.from({length: this.props.numBoxes}).map(() => (
            <Box colours={this.props.allColours}/>
        ));
        return <div className='BoxContainer'>{boxes}</div>;
    }
}

export default BoxContainer;