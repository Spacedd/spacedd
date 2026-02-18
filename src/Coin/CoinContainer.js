import React, { Component } from 'react'
import { choice } from '../helpers';
import Coin from './Coin';

class CoinContainer extends Component{
    static defaultProps = {
        coins: [
        {side: 'heads', imgSrc: "https://upload.wikimedia.org/wikipedia/commons/c/cd/S_Half_Dollar_Obverse_2016.jpg"},
        {side: 'tails', imgSrc: "https://image.pngaaa.com/482/204482-middle.png"}
        ]
    };
    constructor(props){
        super(props);
        this.state = {
            curCoin: null,
            nFlips: 0,
            nHeads: 0,
            nTails: 0
        };
        this.handleClick = this.handleClick.bind(this);
    }
    flipCoin(){
        const newCoin = choice(this.props.coins);
        this.setState(st => {
            return { 
                curCoin: newCoin,
                nFlips: st.nFlips +1,
                nHeads: st.nHeads + (newCoin.side === "heads" ? 1 : 0),
                nTails: st.nTails + (newCoin.side === "tails" ? 1 : 0)
            }
        })
    }

    handleClick(e){
        this.flipCoin();
    }

    render(){
        return (
            <div className="CoinContainer">
                <h2>
                    Let's flip a coin!
                </h2>
                {this.state.curCoin && <Coin info={this.state.curCoin} />}
                <button onClick={this.handleClick}>Flip!</button>
                <p>
                    Out of {" "}
                    {this.state.nFlips} flips, there have been {" "}
                    {this.state.nHeads}{" "} heads and {" "}
                    {this.state.nTails}{" "} tails.
                </p>
            </div>
        )
    }
}

export default CoinContainer;