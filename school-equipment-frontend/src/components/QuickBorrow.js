import React, { useEffect, useState } from "react";
import { getAvailableEquipment, createBorrowRequest } from "../services/api";
import { FaBolt, FaTimes } from "react-icons/fa";
import "../styles/custom-dashboard.css";

const QuickBorrow = ({ user, onBorrowSuccess }) => {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const response = await getAvailableEquipment();
        setAvailableItems(response.data);
      } catch (error) {
        console.error(error);
        setMessage("⚠️ Failed to load available items");
      }
    };
    fetchAvailable();
  }, []);

  const handleBorrow = async () => {
    if (!user?.id) {
      setMessage("Please log in to request equipment");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!selectedItem) {
      setMessage("Please select an equipment first");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await createBorrowRequest({
        user: { id: user.id },
        equipment: { id: selectedItem },
      });
      setMessage(`Request submitted for "${response.data.equipment.name}"`);
      setSelectedItem("");
      if (onBorrowSuccess) onBorrowSuccess();
    } catch (err) {
      setMessage(err.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div
      className={`quick-borrow shadow-lg p-3 rounded-4 ${
        isOpen ? "open" : "closed"
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-bold text-gradient mb-0">
          <FaBolt className="me-2 text-warning" />
          Quick Borrow
        </h6>
        <button
          className="btn btn-sm btn-outline-secondary rounded-circle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaTimes size={12} />
        </button>
      </div>

      {isOpen && (
        <>
          {message && (
            <div className="alert alert-info py-2 small text-center mb-2">
              {message}
            </div>
          )}

          <select
            className="form-select rounded-pill mb-3 shadow-sm"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">Select Equipment</option>
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.availableQuantity})
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary w-100 rounded-pill fw-semibold"
            onClick={handleBorrow}
            disabled={loading || !availableItems.length}
          >
            {loading ? "Submitting..." : "Borrow Now"}
          </button>
        </>
      )}
    </div>
  );
};

export default QuickBorrow;
