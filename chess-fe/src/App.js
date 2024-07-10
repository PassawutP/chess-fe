import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Login</Link>
          </li>
          <li>
            <Link to="/Lobby">Lobby</Link>
          </li>
          <li>
            <Link to="/Game">Game</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/Lobby" element={<Lobby />}></Route>
        <Route path="/Game" element={<Game />}></Route>
      </Routes>
    </Router>
  );
}

export default App;