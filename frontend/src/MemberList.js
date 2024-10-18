import React, { useState, useEffect } from "react";
import axios from "axios";

const MemberList = ({ role }) => {
  const [members, setMembers] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [changeRequest, setChangeRequest] = useState({
    memberId: "",
    payment_amount: "",
    payment_date: "",
    payment_agent: "",
  });

  // State to control the visibility of the form for each member
  const [showForm, setShowForm] = useState({}); // Object to track visibility per member
  const [showPending, setShowPending] = useState({}); // Object to track visibility of pending changes per member

  // State for adding/editing members
  const [newMember, setNewMember] = useState({
    name: "",
    previous_payment: "",
    payment_amount: "",
    payment_date: "",
    payment_agent: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);

  // Fetch members and pending changes from the backend
  const fetchMembers = async () => {
    const response = await axios.get("http://localhost:5000/api/members");
    setMembers(response.data);
  };

  const fetchPendingChanges = async () => {
    const response = await axios.get(
      "http://localhost:5000/api/pending-changes"
    );
    setPendingChanges(response.data);
  };

  useEffect(() => {
    fetchMembers();
    if (role === "Admin") {
      fetchPendingChanges();
    }
  }, [role]);

  // Viewer: Handle marking changes
  const handleMarkChange = (e) => {
    e.preventDefault();
    if (role === "Viewer") {
      axios
        .post("http://localhost:5000/api/mark-change", changeRequest)
        .then(() => {
          alert("Change request submitted");
          setChangeRequest({
            memberId: "",
            payment_amount: "",
            payment_date: "",
            payment_agent: "",
          });
          setShowForm({ ...showForm, [changeRequest.memberId]: false }); // Hide the form after submission
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to submit change request");
        });
    }
  };

  // Admin: Approve or Reject a change
  const handleApproveChange = (changeId, memberId) => {
    axios
      .post(`http://localhost:5000/api/approve-change/${changeId}`)
      .then(() => {
        alert("Change approved");
        fetchMembers(); // Refresh members after approving change
        fetchPendingChanges(); // Refresh pending changes
        setShowPending({ ...showPending, [memberId]: false }); // Hide pending changes after approving
      })
      .catch((err) => console.error(err));
  };

  const handleRejectChange = (changeId, memberId) => {
    axios
      .post(`http://localhost:5000/api/reject-change/${changeId}`)
      .then(() => {
        alert("Change rejected");
        fetchMembers(); // Refresh members after rejecting change
        fetchPendingChanges(); // Refresh pending changes
        setShowPending({ ...showPending, [memberId]: false }); // Hide pending changes after rejecting
      })
      .catch((err) => console.error(err));
  };

  // Admin: Handle edit, delete, and add members
  const handleDeleteMember = (memberId) => {
    axios
      .delete(`http://localhost:5000/api/members/${memberId}`)
      .then(() => {
        alert("Member deleted");
        fetchMembers(); // Refresh members list
      })
      .catch((err) => console.error(err));
  };

  const handleEditMember = (member) => {
    setNewMember({
      name: member.name,
      previous_payment: member.previous_payment,
      payment_amount: member.payment_amount,
      payment_date: member.payment_date,
      payment_agent: member.payment_agent,
    });
    setIsEditing(true);
    setEditingMemberId(member.id);
  };

  const handleSubmitMember = (e) => {
    e.preventDefault();
    if (isEditing) {
      // Update existing member
      axios
        .put(`http://localhost:5000/api/members/${editingMemberId}`, newMember)
        .then(() => {
          alert("Member updated");
          setIsEditing(false);
          setEditingMemberId(null);
          setNewMember({
            name: "",
            previous_payment: "",
            payment_amount: "",
            payment_date: "",
            payment_agent: "",
          });
          fetchMembers(); // Refresh members list
        })
        .catch((err) => console.error(err));
    } else {
      // Add new member
      axios
        .post("http://localhost:5000/api/members", newMember)
        .then(() => {
          alert("Member added");
          setNewMember({
            name: "",
            previous_payment: "",
            payment_amount: "",
            payment_date: "",
            payment_agent: "",
          });
          fetchMembers(); // Refresh members list
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div>
      <h2>Members List</h2>

      {role === "Admin" && (
        <form onSubmit={handleSubmitMember}>
          <h3>{isEditing ? "Edit Member" : "Add Member"}</h3>

          <label>Name: </label>
          <input
            type="text"
            value={newMember.name}
            onChange={(e) =>
              setNewMember({ ...newMember, name: e.target.value })
            }
            required
          />

          <label>Previous Payment: </label>
          <input
            type="number"
            value={newMember.previous_payment}
            onChange={(e) =>
              setNewMember({ ...newMember, previous_payment: e.target.value })
            }
            required
          />

          <label>Payment Amount: </label>
          <input
            type="number"
            value={newMember.payment_amount}
            onChange={(e) =>
              setNewMember({ ...newMember, payment_amount: e.target.value })
            }
            required
          />

          <label>Payment Date: </label>
          <input
            type="date"
            value={newMember.payment_date}
            onChange={(e) =>
              setNewMember({ ...newMember, payment_date: e.target.value })
            }
            required
          />

          <label>Payment Agent: </label>
          <input
            type="text"
            value={newMember.payment_agent}
            onChange={(e) =>
              setNewMember({ ...newMember, payment_agent: e.target.value })
            }
            required
          />

          <button type="submit">
            {isEditing ? "Update Member" : "Add Member"}
          </button>
        </form>
      )}

      <ul>
        {members.map((member) => (
          <li key={member.id}>
            {member.name} - {member.payment_amount} - {member.payment_date} -{" "}
            {member.payment_agent}
            {role === "Viewer" && (
              <>
                <button
                  onClick={() =>
                    setShowForm({
                      ...showForm,
                      [member.id]: !showForm[member.id],
                    })
                  }
                >
                  {showForm[member.id] ? "Cancel" : "Mark for Change"}
                </button>
                {showForm[member.id] && (
                  <form onSubmit={handleMarkChange}>
                    <h4>Mark for Change:</h4>
                    <label>Payment Amount: </label>
                    <input
                      type="number"
                      value={changeRequest.payment_amount}
                      onChange={(e) =>
                        setChangeRequest({
                          ...changeRequest,
                          payment_amount: e.target.value,
                          memberId: member.id,
                        })
                      }
                    />
                    <label>Payment Date: </label>
                    <input
                      type="date"
                      value={changeRequest.payment_date}
                      onChange={(e) =>
                        setChangeRequest({
                          ...changeRequest,
                          payment_date: e.target.value,
                        })
                      }
                    />
                    <label>Payment Agent: </label>
                    <input
                      type="text"
                      value={changeRequest.payment_agent}
                      onChange={(e) =>
                        setChangeRequest({
                          ...changeRequest,
                          payment_agent: e.target.value,
                        })
                      }
                    />
                    <button type="submit">Submit Change Request</button>
                  </form>
                )}
              </>
            )}
            {role === "Admin" && (
              <>
                <button onClick={() => handleDeleteMember(member.id)}>
                  Delete
                </button>
                <button onClick={() => handleEditMember(member)}>Edit</button>

                {/* Show View Changes button only if there are pending changes for this member */}
                {pendingChanges.some(
                  (change) => change.member_id === member.id
                ) && (
                  <>
                    <button
                      onClick={() =>
                        setShowPending({
                          ...showPending,
                          [member.id]: !showPending[member.id],
                        })
                      }
                    >
                      {showPending[member.id] ? "Hide Changes" : "View Changes"}
                    </button>
                    {showPending[member.id] && (
                      <ul>
                        {pendingChanges
                          .filter((change) => change.member_id === member.id) // Filter pending changes for this member
                          .map((change) => (
                            <li key={change.id}>
                              {change.name}: Change to {change.payment_amount}{" "}
                              on {change.payment_date} by {change.payment_agent}
                              <button
                                onClick={() =>
                                  handleApproveChange(change.id, member.id)
                                }
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectChange(change.id, member.id)
                                }
                              >
                                Reject
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList;
