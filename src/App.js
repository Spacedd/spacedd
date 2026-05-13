import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Nav from './Nav/Nav';
import Home from './Home/Home';
import ProjectPage from './ProjectPage/ProjectPage';
import Pokegame from './Pokedex/Pokegame';
import RollDice from './Dice/RollDice';
import CoinContainer from './Coin/CoinContainer';
import StateGame from './Stategame/StateGame';
import BoxContainer from './Box/BoxContainer';
import Hangman from './Hangman/Hangman';
import PaintSchemeTracker from './PaintSchemeTracker/PaintSchemeTracker';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/pokedex"
              element={
                <ProjectPage title="Pokémon Battle" icon="🃏">
                  <Pokegame />
                </ProjectPage>
              }
            />
            <Route
              path="/dice"
              element={
                <ProjectPage title="Dice Roller" icon="🎲">
                  <RollDice />
                </ProjectPage>
              }
            />
            <Route
              path="/coin"
              element={
                <ProjectPage title="Coin Flipper" icon="🪙">
                  <CoinContainer />
                </ProjectPage>
              }
            />
            <Route
              path="/number-quest"
              element={
                <ProjectPage title="Number Quest" icon="🔢">
                  <StateGame />
                </ProjectPage>
              }
            />
            <Route
              path="/colour-boxes"
              element={
                <ProjectPage title="Colour Boxes" icon="🎨">
                  <BoxContainer />
                </ProjectPage>
              }
            />
            <Route
              path="/hangman"
              element={
                <ProjectPage title="Hangman" icon="🪢">
                  <Hangman />
                </ProjectPage>
              }
            />
            <Route
              path="/paint-scheme-tracker"
              element={
                <ProjectPage title="Paint Scheme Tracker" icon="🖌️" fullBleed>
                  <PaintSchemeTracker />
                </ProjectPage>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
