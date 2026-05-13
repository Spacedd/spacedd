import { Link } from 'react-router-dom';
import logo from '../images/spookyArty.svg';
import { useTheme } from '../ThemeContext';
import './Nav.css';

function Nav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="site-nav">
      <Link to="/" className="nav-brand">
        <img src={logo} alt="Spacedd" className="nav-logo" />
        Spacedd
      </Link>
      <div className="theme-toggle-wrap">
        <span className="toggle-icon">☀️</span>
        <label className="theme-toggle">
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <span className="toggle-slider" />
        </label>
        <span className="toggle-icon">🌙</span>
      </div>
    </nav>
  );
}

export default Nav;
