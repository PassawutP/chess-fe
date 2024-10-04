import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Container, TextField, Typography, CircularProgress, Snackbar } from "@mui/material";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/users/saveUser', { name: username });
      localStorage.setItem("username", response.data.name);
      navigate('/lobby');
    } catch (err) {
      setError("Invalid username or failed to save user.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container style={{ 
        display: "flex", 
        flexDirection: "column", 
        width: "30em", 
        borderRadius: "1em", 
        padding: "2em", 
        backgroundColor: "#f5f5f5", 
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        marginTop: "5em"
    }}>
      <Typography variant="h5" align="center" style={{ marginBottom: "1em" }}>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          fullWidth
          required
          style={{ marginBottom: "1em" }}
        />
        <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </form>
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        message={error}
      />
    </Container>
  );
}
