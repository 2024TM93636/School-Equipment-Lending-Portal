import { useEffect, useState } from "react";
import { getAllEquipment, createBorrowRequest } from "../services/api";
import QuickBorrow from "../components/QuickBorrow";
import { FaTools, FaClipboardList, FaSearch, FaBoxOpen } from "react-icons/fa";
import "../styles/custom-dashboard.css";

const Dashboard = ({ user, userRole }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("available");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all available equipment
  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await getAllEquipment();
      setEquipmentList(response.data);
      setFilteredList(response.data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  // Borrow handler
  const handleBorrow = async (id) => {
    if (!user?.id) {
      setMessage("Please login to request equipment");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await createBorrowRequest({
        user: { id: user.id },
        equipment: { id },
      });
      setMessage(`Request submitted for "${response.data.equipment.name}"`);
      fetchEquipment();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to submit request");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Apply filters
  useEffect(() => {
    let list = [...equipmentList];

    if (searchTerm)
      list = list.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (categoryFilter)
      list = list.filter((e) => e.category === categoryFilter);

    if (availabilityFilter)
      list = list.filter((e) =>
        availabilityFilter === "available"
          ? e.availableQuantity > 0
          : e.availableQuantity === 0
      );

    setFilteredList(list);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, availabilityFilter, equipmentList]);

  const handleQuickBorrowSuccess = () => {
    fetchEquipment();
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const categories = [...new Set(equipmentList.map((e) => e.category))];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container py-5">
      <h2 className="text-center text-gradient mb-3">Equipment Catalog</h2>
      <p className="text-center text-muted mb-4">
        Browse and request available items easily.
      </p>

      {message && (
        <div className="alert alert-info text-center fw-semibold">
          {message}
        </div>
      )}

      <div className="row g-4">
        {/*Main Catalog */}
        <div className={userRole !== "ADMIN" ? "col-lg-10" : "col-12"}>
          {/* Summary */}
          <div className="row text-center mb-4">
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-primary bg-opacity-10 rounded-4 shadow-sm">
                <h5 className="fw-bold text-primary mb-0">
                  {equipmentList.length}
                </h5>
                <p className="small mb-0 text-secondary">Total Items</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-success bg-opacity-10 rounded-4 shadow-sm">
                <h5 className="fw-bold text-success mb-0">
                  {equipmentList.filter((e) => e.availableQuantity > 0).length}
                </h5>
                <p className="small mb-0 text-secondary">Available</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-danger bg-opacity-10 rounded-4 shadow-sm">
                <h5 className="fw-bold text-danger mb-0">
                  {
                    equipmentList.filter((e) => e.availableQuantity === 0)
                      .length
                  }
                </h5>
                <p className="small mb-0 text-secondary">Out of Stock</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="row g-3 mb-4 justify-content-center">
            <div className="col-md-4">
              <div className="input-group shadow-sm rounded-pill overflow-hidden">
                <span className="input-group-text bg-primary text-white border-0">
                  <FaSearch />
                </span>
                <input
                  className="form-control border-0"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-pill shadow-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-pill shadow-sm"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="">All Availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Not Available</option>
              </select>
            </div>
          </div>

          {/* Equipment Cards */}
          <div className="row">
            {loading ? (
              <div className="col-12 text-center my-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="text-muted mt-3">Loading equipment...</p>
              </div>
            ) : paginatedList.length === 0 ? (
              <div className="col-12 text-center mt-5">
                <FaBoxOpen size={50} className="text-muted mb-3" />
                <p className="text-muted">No equipment matches your filters.</p>
              </div>
            ) : (
              paginatedList.map((eq) => (
                <div key={eq.id} className="col-md-4 mb-4">
                  <div className="card h-100 border-0 shadow-sm hover-card text-center">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5 className="fw-bold text-gradient mb-1">
                          {eq.name}
                        </h5>
                        <p className="text-muted small mb-1">
                          <FaTools className="me-1 text-primary" />{" "}
                          {eq.category}
                        </p>
                        <p className="text-muted small mb-3">
                          <FaClipboardList className="me-1 text-secondary" />{" "}
                          {eq.conditionStatus}
                        </p>

                        <div className="d-flex justify-content-center mb-3">
                          <span
                            className={`badge px-3 py-2 rounded-pill ${
                              eq.availableQuantity > 0
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                            style={{ fontSize: "0.85rem" }}
                          >
                            {eq.availableQuantity > 0
                              ? `${eq.availableQuantity} Available`
                              : "Out of Stock"}
                          </span>
                        </div>
                      </div>

                      {userRole !== "ADMIN" && (
                        <button
                          className={`btn fw-semibold w-75 mx-auto mt-auto rounded-pill ${
                            eq.availableQuantity > 0
                              ? "btn-outline-primary"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() => handleBorrow(eq.id)}
                          disabled={eq.availableQuantity === 0}
                        >
                          {eq.availableQuantity > 0
                            ? "Request to Borrow"
                            : "Unavailable"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredList.length > itemsPerPage && (
            <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="fw-semibold small">
                Page {currentPage} of{" "}
                {Math.ceil(filteredList.length / itemsPerPage)}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      p + 1,
                      Math.ceil(filteredList.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(filteredList.length / itemsPerPage)
                }
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/*Quick Borrow Panel */}
        {userRole !== "ADMIN" && (
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: "90px", zIndex: 1 }}>
              <QuickBorrow
                user={user}
                onBorrowSuccess={handleQuickBorrowSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
