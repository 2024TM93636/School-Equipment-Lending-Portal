import React, { useEffect, useState } from "react";
import { getAvailableEquipment, createBorrowRequest } from "../services/api";
import { FaTools, FaClipboardList } from "react-icons/fa";
import "../custom-dashboard.css";



const Dashboard = ({ user, userRole }) => {
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
    } catch {
      setMessage("⚠️ Failed to load equipment");
    }
  };

  const handleBorrow = async (id) => {
    try {
      const response = await createBorrowRequest({
        user: { id: user.id },
        equipment: { id },
      });
      setMessage(` Request sent for "${response.data.equipment.name}"`);
      fetchEquipment();
    } catch (err) {
      setMessage(err.response?.data?.error || " Borrow failed");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

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
  }, [searchTerm, categoryFilter, availabilityFilter, equipmentList]);

  useEffect(() => fetchEquipment(), []);

  const categories = [...new Set(equipmentList.map((e) => e.category))];

  return (
    <div className="container py-5">
      <h2 className="text-center text-gradient mb-3">🎒 Equipment Catalog</h2>
      <p className="text-center text-muted mb-4">
        Browse and request items for your projects
      </p>
      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            className="form-control rounded-pill"
            placeholder="🔍 Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select rounded-pill"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select rounded-pill"
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
        {filteredList.length === 0 ? (
          <p className="text-center text-muted">No items match filters.</p>
        ) : (
          filteredList.map((eq) => (
            <div key={eq.id} className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm text-center">
                <div className="card-body">
                  <h5 className="fw-bold text-primary">{eq.name}</h5>
                  <p className="text-muted small mb-2">
                    <FaTools className="me-1" /> {eq.category}
                  </p>
                  <p className="text-muted small">
                    <FaClipboardList className="me-1" /> {eq.conditionStatus}
                  </p>
                  <span
                    className={`badge ${
                      eq.availableQuantity > 0 ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {eq.availableQuantity > 0
                      ? `${eq.availableQuantity} Available`
                      : "Not Available"}
                  </span>
                  {userRole !== "ADMIN" && (
                    <button
                      className={`btn mt-3 w-75 ${
                        eq.availableQuantity > 0
                          ? "btn-primary"
                          : "btn-secondary"
                      } rounded-pill`}
                      onClick={() => handleBorrow(eq.id)}
                      disabled={eq.availableQuantity === 0}
                    >
                      {eq.availableQuantity > 0
                        ? "📦 Request"
                        : "Unavailable"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
