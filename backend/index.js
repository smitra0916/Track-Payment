const express = require("express");
const pool = require("./db");
const app = express();

app.use(express.json());

const cors = require('cors'); // Import cors
app.use(cors()); // Use cors

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.status(200).json({ username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Protected route for members (accessible only after login)
app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM members');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add a new member
app.post("/api/members", async (req, res) => {
  const {
    name,
    previous_payment,
    payment_amount,
    payment_date,
    payment_agent,
  } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO members (name, previous_payment, payment_amount, payment_date, payment_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, previous_payment, payment_amount, payment_date, payment_agent]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Route for Admins to get pending changes
app.get('/api/pending-changes', async (req, res) => {
  try {
    const pendingChanges = await pool.query(
      `SELECT pc.*, m.name 
       FROM pending_changes pc
       JOIN members m ON pc.member_id = m.id
       WHERE pc.status = 'pending'`
    );
    
    res.status(200).json(pendingChanges.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch pending changes' });
  }
});


// Mark change route (Viewer submits a change request)
app.post('/api/mark-change', async (req, res) => {
  const { memberId, payment_amount, payment_date, payment_agent } = req.body;
  try {
    await pool.query(
      'INSERT INTO pending_changes (member_id, payment_amount, payment_date, payment_agent) VALUES ($1, $2, $3, $4)',
      [memberId, payment_amount, payment_date, payment_agent]
    );
    res.status(201).json({ message: 'Change request submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit change request' });
  }
});

// Route for Admins to approve a change
app.post('/api/approve-change/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the pending change details
    const change = await pool.query(`SELECT * FROM pending_changes WHERE id = $1`, [id]);

    if (change.rows.length === 0) {
      return res.status(404).json({ error: 'Change not found' });
    }

    const { member_id, payment_amount, payment_date, payment_agent } = change.rows[0];

    // Update the members table with the new values
    await pool.query(
      `UPDATE members 
       SET payment_amount = $1, payment_date = $2, payment_agent = $3 
       WHERE id = $4`,
      [payment_amount, payment_date, payment_agent, member_id]
    );

    // Mark the change as approved
    await pool.query(`UPDATE pending_changes SET status = 'approved' WHERE id = $1`, [id]);

    res.status(200).json({ message: 'Change approved and applied to member.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to approve change' });
  }
});


// Reject change (Admin rejects the change)
app.post('/api/reject-change/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Reject the change (implement the rejection logic here)
    res.status(200).json({ message: 'Change rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject change' });
  }
});

// CRUD operations for members
// Add, edit, delete members


// Get all members
app.get("/api/members", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Update a member's payment
app.put("/api/members/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    previous_payment,
    payment_amount,
    payment_date,
    payment_agent,
  } = req.body;

  try {
    const result = await pool.query(
      "UPDATE members SET name = $1, previous_payment = $2, payment_amount = $3, payment_date = $4, payment_agent = $5 WHERE id = $6 RETURNING *",
      [name, previous_payment, payment_amount, payment_date, payment_agent, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete a member
app.delete("/api/members/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM members WHERE id = $1", [id]);
    res.status(204).json({ message: "Member deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
