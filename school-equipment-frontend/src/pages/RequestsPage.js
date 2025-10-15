import React, { useEffect, useState } from "react";
import { getAllRequests, getUserRequests, approveRequest, rejectRequest, markReturned } from "../services/api";

// For demo: userRole = "ADMIN" or "STUDENT", userId = 1
const RequestsPage = ({ userRole = "ADMIN", userId = 1 }) => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      let response;
      if (userRole === "ADMIN") {
        response = await getAllRequests();
      } else {
        response = await getUserRequests(userId);
      }
      setRequests(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveRequest(id, { remarks: "Approved by admin" });
      setMessage("Request approved");
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id, { remarks: "Rejected by admin" });
      setMessage("Request rejected");
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reject");
    }
  };

  const handleReturn = async (id) => {
    try {
      await markReturned(id);
      setMessage("Marked as returned");
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to mark returned");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Borrow Requests</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>User</th>
            <th>Equipment</th>
            <th>Status</th>
            <th>Request Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.user.name}</td>
              <td>{req.equipment.name}</td>
              <td>{req.status}</td>
              <td>{new Date(req.requestDate).toLocaleString()}</td>
              <td>
                {userRole === "ADMIN" && req.status === "PENDING" && (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(req.id)}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(req.id)}>Reject</button>
                  </>
                )}
                {userRole === "STUDENT" && req.status === "APPROVED" && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleReturn(req.id)}>Mark Returned</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsPage;
