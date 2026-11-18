import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './AuthContext';
import Nav from './Nav/Nav';
import Home from './Home/Home';
import AuthPage from './AuthPage/AuthPage';
import ProjectPage from './ProjectPage/ProjectPage';
import Pokegame from './Pokedex/Pokegame';
import RollDice from './Dice/RollDice';
import CoinContainer from './Coin/CoinContainer';
import StateGame from './Stategame/StateGame';
import BoxContainer from './Box/BoxContainer';
import Hangman from './Hangman/Hangman';
import PaintSchemeTracker from './PaintSchemeTracker/PaintSchemeTracker';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <main className="auth-loading">Loading…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function AppRoutes() {
  return (
    <div className="App">
      <Nav />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route
          path="/pokedex"
          element={<ProtectedRoute><ProjectPage title="Pokémon Battle" icon="🃏"><Pokegame /></ProjectPage></ProtectedRoute>}
        />
        <Route
          path="/dice"
          element={<ProtectedRoute><ProjectPage title="Dice Roller" icon="🎲"><RollDice /></ProjectPage></ProtectedRoute>}
        />
        <Route
          path="/coin"
          element={<ProtectedRoute><ProjectPage title="Coin Flipper" icon="🪙"><CoinContainer /></ProjectPage></ProtectedRoute>}
        />
        <Route
          path="/number-quest"
          element={<ProtectedRoute><ProjectPage title="Number Quest" icon="🔢"><StateGame /></ProjectPage></ProtectedRoute>}
        />
        <Route
          path="/colour-boxes"
          element={<ProtectedRoute><ProjectPage title="Colour Boxes" icon="🎨"><BoxContainer /></ProjectPage></ProtectedRoute>}
        />
        <Route
          path="/hangman"
          element={<ProtectedRoute><ProjectPage title="Hangman" icon="🪢"><Hangman /></ProjectPage></ProtectedRoute>}
        />
        <Route
          path="/paint-scheme-tracker"
          element={<ProtectedRoute><ProjectPage title="Paint Scheme Tracker" icon="🖌️" fullBleed><PaintSchemeTracker /></ProjectPage></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
