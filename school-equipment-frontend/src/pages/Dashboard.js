import React, { useEffect, useState } from "react";
import { getAvailableEquipment, createBorrowRequest } from "../services/api";
import {
  FaClipboardList,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const Dashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [message, setMessage] = useState("");

  const fetchEquipment = async () => {
    try {
      const response = await getAvailableEquipment();
      setEquipmentList(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrow = async (equipmentId) => {
    try {
      const response = await createBorrowRequest({
        user: { id: user.id }, // use logged-in user
        equipment: { id: equipmentId },
      });
      setMessage(
        `✅ Your request for "${response.data.equipment.name}" has been submitted.`
      );
      fetchEquipment();
      setTimeout(() => setMessage(""), 3000); // clear after 3s
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Failed to borrow");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="container mt-4">
      <p className="text-center text-muted mb-5">
        Browse the available equipment and request what you need.
      </p>

      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="row">
        {equipmentList.length === 0 && (
          <div className="col-12 text-center">
            <p className="text-muted">No equipment available at the moment.</p>
          </div>
        )}

        {equipmentList.map((eq) => (
          <div key={eq.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title text-primary">{eq.name}</h5>
                  <p className="card-text mb-2">
                    <FaTools className="me-1" /> <strong>Category:</strong>{" "}
                    {eq.category}
                    <br />
                    <FaClipboardList className="me-1" />{" "}
                    <strong>Condition:</strong> {eq.conditionStatus}
                    <br />
                    {eq.availableQuantity > 0 ? (
                      <span className="text-success">
                        <FaCheckCircle className="me-1" /> Available:{" "}
                        {eq.availableQuantity}
                      </span>
                    ) : (
                      <span className="text-danger">
                        <FaTimesCircle className="me-1" /> Not Available
                      </span>
                    )}
                  </p>
                </div>

                <button
                  className="btn btn-primary mt-2"
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
    </div>
  );
};

export default Dashboard;
