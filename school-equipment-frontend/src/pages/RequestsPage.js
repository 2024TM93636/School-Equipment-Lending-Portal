import { useEffect, useState } from "react";
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
  const [actionLoading, setActionLoading] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchRequests = async (mounted) => {
    setLoading(true);
    try {
      const response =
        userRole === "ADMIN"
          ? await getAllRequests()
          : await getUserRequests(userId);
      if (mounted) setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      showMessage("Failed to load requests.");
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const handleAction = async (actionFn, id, successMsg) => {
    setActionLoading(id);
    try {
      await actionFn(id);
      showMessage(successMsg);
      fetchRequests(true);
    } catch (err) {
      showMessage(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const base = "badge rounded-pill";
    switch (status) {
      case "PENDING":
        return <span className={`${base} bg-warning text-dark`}>{status}</span>;
      case "APPROVED":
        return <span className={`${base} bg-success`}>{status}</span>;
      case "REJECTED":
        return <span className={`${base} bg-danger`}>{status}</span>;
      case "RETURNED":
        return <span className={`${base} bg-secondary`}>{status}</span>;
      default:
        return <span className={`${base} bg-light text-dark`}>{status}</span>;
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchRequests(mounted);
    return () => {
      mounted = false;
    };
  }, [userRole, userId]);

  // --- Filtering logic ---
  const filteredRequests = requests.filter((req) => {
    const searchMatch =
      req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "ALL" || req.status === statusFilter;
    return searchMatch && statusMatch;
  });

  // --- Pagination logic ---
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 text-gradient">
        Borrow Requests Dashboard
      </h2>

      {message && (
        <div className="alert alert-info text-center rounded-pill">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="row mb-3 g-2 justify-content-center">
        <div className="col-md-6 col-sm-10">
          <div className="input-group shadow-sm">
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

        <div className="col-md-3 col-sm-6">
          <select
            className="form-select shadow-sm"
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

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading requests...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive rounded shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>User</th>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Requested On</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No matching requests found.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.user?.name || "—"}</td>
                      <td>{req.equipment?.name || "—"}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td>{new Date(req.requestDate).toLocaleString()}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {userRole === "ADMIN" && req.status === "PENDING" && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                disabled={actionLoading === req.id}
                                onClick={() =>
                                  handleAction(
                                    (id) =>
                                      approveRequest(id, {
                                        remarks: "Approved by admin",
                                      }),
                                    req.id,
                                    "Request approved successfully"
                                  )
                                }
                                title="Approve request"
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === req.id}
                                onClick={() =>
                                  handleAction(
                                    (id) =>
                                      rejectRequest(id, {
                                        remarks: "Rejected by admin",
                                      }),
                                    req.id,
                                    "Request rejected"
                                  )
                                }
                                title="Reject request"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {userRole !== "ADMIN" &&
                            req.status === "APPROVED" && (
                              <button
                                className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                disabled={actionLoading === req.id}
                                onClick={() =>
                                  handleAction(
                                    markReturned,
                                    req.id,
                                    "Equipment marked as returned"
                                  )
                                }
                                title="Mark as returned"
                              >
                                <FaUndo className="me-1" /> Return
                              </button>
                            )}
                          {req.status === "RETURNED" && (
                            <span className="text-muted small fw-semibold">
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center align-items-center mt-4">
              <ul className="pagination mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default RequestsPage;
