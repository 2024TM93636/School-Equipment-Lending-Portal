import React, { useEffect, useState } from "react";
import { getAvailableEquipment, createBorrowRequest } from "../services/api";

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
      // Assuming userId = 1 for demo, replace with logged-in user ID
      const response = await createBorrowRequest({
        user: { id: 1 },
        equipment: { id: equipmentId },
      });
      setMessage(`Request created for ${response.data.equipment.name}`);
      fetchEquipment(); // refresh equipment list
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to borrow");
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Equipment Dashboard</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Available Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.name}</td>
              <td>{eq.category}</td>
              <td>{eq.conditionStatus}</td>
              <td>{eq.availableQuantity}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleBorrow(eq.id)}
                  disabled={eq.availableQuantity === 0}
                >
                  Borrow
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
