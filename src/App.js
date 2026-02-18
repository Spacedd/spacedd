import './App.css';
import React, { Component } from 'react';
import Arty from './Arty/Arty';
import Buffer from './Arty/ArtyBuffer';
import Pokegame from './Pokedex/Pokegame';
import Button from './Stategame/StateGame';
import Rolldice from './Dice/RollDice';
import CoinContainer from './Coin/CoinContainer';
import BoxContainer from './Box/BoxContainer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Arty size={"big"}/>
        <BoxContainer />
        <Pokegame />
        <Buffer />
        <Button />
        <Buffer />
        <Rolldice />
        <Buffer />  
        <CoinContainer />
      </div>
      
    );
  }
}

export default App;
