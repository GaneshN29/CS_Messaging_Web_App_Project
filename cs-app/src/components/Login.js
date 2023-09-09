import React, { useState } from 'react';
import axios from 'axios';
import '../style/login.css';
import { Link, useNavigate } from 'react-router-dom';

const server_url = process.env.REACT_APP_SERVER_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 

  const navigate = useNavigate();

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    if (isSignUp && password !== verifyPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      if (isSignUp) {
        const response = await axios.post(server_url + '/register', {
          username,
          password,
        });
        alert('Signup successful. You can now log in.');
        setIsSignUp(!isSignUp);
      } else {
        const response = await axios.post(server_url + '/login', {
          username,
          password,
        });
        if (response.data.entity === 'customer') {
          navigate(`/Customer/${username}/${response.data.id}`);
        } else if (response.data.entity === 'agent') {
          navigate(`/Agent/${username}/${response.data.id}`);
        }
      }
    } catch (error) {
      if (isSignUp) {
        alert('An error occurred during signup.');
      } else {
        alert('An error occurred during login.');
      }
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="background"></div>
      <div className="box">
        <h2>{isSignUp ? 'Sign up for an account' : 'Sign in to us'}</h2>
        <form onSubmit={handleFormSubmit}>
          <p>
            <label>Username or email address</label>
            <br />
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </p>
          <p>
            <label>Password</label>
            <br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </p>
          {isSignUp && (
            <p>
              <label>Verify Password</label>
              <br />
              <input
                type="password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
              />
            </p>
          )}
          <p>
            <button id="sub_btn" type="submit">
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
        <div className="toggle-signup-signin">
          <p>
            {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
            <span
              className="toggle-link"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
