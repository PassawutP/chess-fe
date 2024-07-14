import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/saveUser',
        { name: username }
      );
      console.log(response);
      navigate('/lobby', { state: { username: username } });
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
      {error && <p className="error-message">{error}</p>}
    </>
  );
}
