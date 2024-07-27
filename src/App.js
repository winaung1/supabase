import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*');
    setMessages(data);
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('Error logging in:', error.message);
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message === 'Email rate limit exceeded') {
        setErrorMessage('You are trying to sign up too quickly. Please wait a moment and try again.');
      } else {
        setErrorMessage(error.message);
      }
      console.error('Error signing up:', error.message);
    } else {
      setErrorMessage('');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const handleAddMessage = async () => {
    const { error } = await supabase.from('messages').insert([{ content: newMessage }]);
    if (error) console.error('Error adding message:', error.message);
    else fetchMessages();
    setNewMessage('');
  };

  return (
    <div className="App">
      <h1>Supabase Auth and Messages</h1>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
          <div>
            <h2>Messages</h2>
            {messages.map((message) => (
              <p key={message.id}>{message.content}</p>
            ))}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="New message"
            />
            <button onClick={handleAddMessage}>Add Message</button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignup}>Sign Up</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
