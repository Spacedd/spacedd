import './App.css';
import React, { Component } from 'react';
import Arty from './Arty';
import Buffer from './ArtyBuffer';
import Pokegame from './Pokegame';
import Button from './StateGame';
import Rolldice from './RollDice';
import CoinContainer from './CoinContainer';
import BoxContainer from './BoxContainer';

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
