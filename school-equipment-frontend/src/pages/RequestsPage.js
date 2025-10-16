import React, { useEffect, useState } from "react";
import {
  getAllRequests,
  getUserRequests,
  approveRequest,
  rejectRequest,
  markReturned,
} from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const RequestsPage = ({ userRole = "ADMIN", userId = 1 }) => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch all requests
  const fetchRequests = async () => {
    setLoading(true);
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
      setMessage("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  // approve / reject / return handlers
  const handleApprove = async (id) => {
    try {
      await approveRequest(id, { remarks: "Approved by admin" });
      showMessage("Request approved successfully ✅");
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to approve ❌");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id, { remarks: "Rejected by admin" });
      showMessage("Request rejected ❌");
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to reject");
    }
  };

  const handleReturn = async (id) => {
    try {
      await markReturned(id);
      showMessage("Equipment marked as returned 🔄");
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to mark returned");
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // helper: badge color for each status
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="badge bg-warning text-dark">{status}</span>;
      case "APPROVED":
        return <span className="badge bg-success">{status}</span>;
      case "REJECTED":
        return <span className="badge bg-danger">{status}</span>;
      case "RETURNED":
        return <span className="badge bg-secondary">{status}</span>;
      default:
        return status;
    }
  };

  return (
    <>
      {/* ✅ Page Container */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Borrow Requests</h3>
          {loading && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>

        {/* ✅ Toast / Message */}
        {message && (
          <div className="alert alert-info text-center fw-semibold">
            {message}
          </div>
        )}

        {/* ✅ Table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle shadow-sm">
            <thead className="table-dark">
              <tr>
                <th scope="col">User</th>
                <th scope="col">Equipment</th>
                <th scope="col">Status</th>
                <th scope="col">Request Date</th>
                <th scope="col" style={{ width: "220px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.user.name}</td>
                    <td>{req.equipment.name}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>{new Date(req.requestDate).toLocaleString()}</td>
                    <td>
                      {userRole === "ADMIN" && req.status === "PENDING" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleApprove(req.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(req.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {userRole === "STUDENT" && req.status === "APPROVED" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReturn(req.id)}
                        >
                          Mark Returned
                        </button>
                      )}

                      {req.status === "RETURNED" && (
                        <span className="text-muted">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">
                    No borrow requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RequestsPage;
