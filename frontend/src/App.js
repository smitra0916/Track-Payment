import React, { useState } from 'react';
import Login from './Login';
import MemberList from './MemberList';

function App() {
  const [user, setUser] = useState(null); // Store logged-in user

  // Logout handler: clears user state
  const handleLogout = () => {
    setUser(null);
  };

  // If user is not logged in, show the login screen
  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="App">
      <h1>Welcome, {user.username} ({user.role})</h1>
      {/* Add a logout button */}
      <button onClick={handleLogout}>Logout</button>
      
      {/* Pass user role to MemberList to control access */}
      <MemberList role={user.role} />
    </div>
  );
}

export default App;
