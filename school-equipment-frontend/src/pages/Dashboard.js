import React, { useEffect, useState } from "react";
import { getAvailableEquipment, createBorrowRequest } from "../services/api";
import {
  FaClipboardList,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const Dashboard = ({ user }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const fetchEquipment = async () => {
    try {
      const response = await getAvailableEquipment();
      setEquipmentList(response.data);
      setFilteredList(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrow = async (equipmentId) => {
    try {
      const response = await createBorrowRequest({
        user: { id: user.id },
        equipment: { id: equipmentId },
      });
      setMessage(`✅ Request submitted for "${response.data.equipment.name}"`);
      fetchEquipment();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Failed to borrow");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  useEffect(() => {
    let updatedList = [...equipmentList];

    if (searchTerm) {
      updatedList = updatedList.filter((eq) =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      updatedList = updatedList.filter((eq) => eq.category === categoryFilter);
    }

    if (availabilityFilter) {
      updatedList = updatedList.filter((eq) =>
        availabilityFilter === "available"
          ? eq.availableQuantity > 0
          : eq.availableQuantity === 0
      );
    }

    setFilteredList(updatedList);
  }, [searchTerm, categoryFilter, availabilityFilter, equipmentList]);

  const categories = [...new Set(equipmentList.map((eq) => eq.category))];

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="container mt-4">
      <p className="text-center text-muted mb-4">
        Browse and request equipment easily.
      </p>

      {message && <div className="alert alert-info text-center">{message}</div>}

      {/* Search & Filter */}
      <div className="row mb-4 g-2">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by equipment name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Not Available</option>
          </select>
        </div>
      </div>

      <div className="row">
        {filteredList.length === 0 && (
          <div className="col-12 text-center">
            <p className="text-muted">No equipment matches your filters.</p>
          </div>
        )}

        {filteredList.map((eq) => (
          <div key={eq.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0 hover-shadow">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title text-primary">{eq.name}</h5>
                  <div className="mb-2">
                    <span className="badge bg-secondary me-1">
                      <FaTools className="me-1" />
                      {eq.category}
                    </span>
                    <span
                      className={`badge ${
                        eq.availableQuantity > 0 ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {eq.availableQuantity > 0 ? "Available" : "Not Available"}
                    </span>
                  </div>
                  <p className="card-text text-muted small mb-0">
                    <FaClipboardList className="me-1" />
                    Condition: {eq.conditionStatus}
                  </p>
                </div>

                <button
                  className={`btn mt-3 ${
                    eq.availableQuantity === 0 ? "btn-secondary" : "btn-primary"
                  }`}
                  disabled={eq.availableQuantity === 0}
                  onClick={() => handleBorrow(eq.id)}
                >
                  {eq.availableQuantity === 0
                    ? "Unavailable"
                    : "Request Borrow"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
