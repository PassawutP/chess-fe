import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleSubmit = async () => {
    await axios.post(
      'http://localhost:8080/api/users/saveUser', { name: username }
    )
    .then( response => {
      localStorage.setItem("username", response.data.name);
      navigate('/lobby');
    })
    .catch( error => console.log(error) );
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
    </>
  );
}
