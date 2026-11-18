import { Link, useLocation } from 'react-router-dom';
import logo from '../images/spookyArty.svg';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import './Nav.css';

function Nav() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="site-nav">
      <Link to="/" className="nav-brand">
        <img src={logo} alt="Spacedd" className="nav-logo" />
        Spacedd
      </Link>
      <div className="nav-actions">
        {user && location.pathname !== '/login' && (
          <>
            <span className="nav-user">{user.name || user.email}</span>
            <button type="button" className="nav-logout" onClick={logout}>
              Log out
            </button>
          </>
        )}
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
      </div>
    </nav>
  );
}

export default Nav;
