import React, { useEffect, useState } from "react";
import {
  getAllRequests,
  getUserRequests,
  approveRequest,
  rejectRequest,
  markReturned,
} from "../services/api";
import { FaCheck, FaTimes, FaUndo, FaSearch } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const RequestsPage = ({ userRole = "ADMIN", userId = 1 }) => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ✅ Safe fetch method (does NOT return a promise to useEffect)
  const fetchRequests = async (isMounted) => {
    setLoading(true);
    try {
      let response;
      if (userRole === "ADMIN") {
        response = await getAllRequests();
      } else {
        response = await getUserRequests(userId);
      }

      // ✅ Only update state if still mounted
      if (isMounted) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      showMessage("Failed to load requests.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // ✅ Approve / Reject / Return handlers
  const handleApprove = async (id) => {
    try {
      await approveRequest(id, { remarks: "Approved by admin" });
      showMessage("Request approved successfully");
      fetchRequests(true);
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id, { remarks: "Rejected by admin" });
      showMessage("Request rejected");
      fetchRequests(true);
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to reject");
    }
  };

  const handleReturn = async (id) => {
    try {
      await markReturned(id);
      showMessage("Equipment marked as returned");
      fetchRequests(true);
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to mark returned");
    }
  };

  // ✅ useEffect with valid cleanup function
  useEffect(() => {
    let isMounted = true;
    fetchRequests(isMounted);
    return () => {
      isMounted = false;
    };
  }, [userRole, userId]);

  // Filter requests
  const filteredRequests = requests.filter(
    (req) =>
      (req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.equipment.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "ALL" || req.status === statusFilter)
  );

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
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-primary">
        Borrow Requests Dashboard
      </h2>

      {message && <div className="alert alert-info text-center">{message}</div>}

      {/* Search & Filter */}
      <div className="row mb-3 g-2">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-primary text-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by user or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover table-bordered align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Equipment</th>
                <th>Status</th>
                <th>Requested On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.user.name}</td>
                    <td>{req.equipment.name}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>{new Date(req.requestDate).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {userRole === "ADMIN" && req.status === "PENDING" && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(req.id)}
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(req.id)}
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {userRole !== "ADMIN" && req.status === "APPROVED" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReturn(req.id)}
                            title="Mark Returned"
                          >
                            <FaUndo /> <span>Mark Returned</span>
                          </button>
                        )}
                        {req.status === "RETURNED" && (
                          <span className="text-muted">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
