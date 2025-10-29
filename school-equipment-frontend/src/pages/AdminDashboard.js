import React, { useEffect, useState } from "react";
import {
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const [modal, setModal] = useState({
    show: false,
    isEdit: false,
    equipment: {
      name: "",
      category: "",
      quantity: 1,
      availableQuantity: 1,
      conditionStatus: "Good",
    },
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await getAllEquipment();
      setEquipmentList(response.data);
    } catch (err) {
      showMessage("Failed to load equipment");
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openModal = (isEdit = false, equipment = null) => {
    setModal({
      show: true,
      isEdit,
      equipment: equipment
        ? { ...equipment }
        : {
            name: "",
            category: "",
            quantity: 1,
            availableQuantity: 1,
            conditionStatus: "Good",
          },
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      isEdit: false,
      equipment: {
        name: "",
        category: "",
        quantity: 1,
        availableQuantity: 1,
        conditionStatus: "Good",
      },
    });
  };

  const handleModalChange = (e) => {
    setModal({
      ...modal,
      equipment: { ...modal.equipment, [e.target.name]: e.target.value },
    });
  };

  const handleSave = async () => {
    try {
      if (modal.isEdit) {
        await updateEquipment(modal.equipment.id, {
          ...modal.equipment,
          quantity: parseInt(modal.equipment.quantity),
          availableQuantity: parseInt(modal.equipment.availableQuantity),
        });
        showMessage("Equipment updated successfully");
      } else {
        await addEquipment({
          ...modal.equipment,
          quantity: parseInt(modal.equipment.quantity),
          availableQuantity: parseInt(modal.equipment.availableQuantity),
        });
        showMessage(`Added ${modal.equipment.name}`);
      }
      closeModal();
      fetchEquipment();
    } catch (err) {
      showMessage(err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEquipment(id);
      showMessage("Equipment deleted successfully");
      fetchEquipment();
    } catch (err) {
      showMessage(
        err.response?.data?.message ||
          "Cannot delete equipment with existing requests"
      );
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  const filteredEquipment = equipmentList.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-primary">
        Admin Equipment Dashboard
      </h2>

      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-success" onClick={() => openModal(false)}>
          + Add Equipment
        </button>
      </div>

      <table className="table table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Quantity</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipment.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted py-3">
                No equipment found.
              </td>
            </tr>
          ) : (
            filteredEquipment.map((eq) => (
              <tr key={eq.id}>
                <td>{eq.name}</td>
                <td>{eq.category}</td>
                <td>{eq.conditionStatus}</td>
                <td>{eq.quantity}</td>
                <td>{eq.availableQuantity}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => openModal(true, eq)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setConfirmDelete({ show: true, id: eq.id })}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      {modal.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modal.isEdit ? "Edit Equipment" : "Add Equipment"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {["name", "category", "quantity", "availableQuantity"].map(
                  (field) => (
                    <div className="mb-2" key={field}>
                      <label className="form-label">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        className="form-control"
                        type={field.includes("Quantity") ? "number" : "text"}
                        name={field}
                        value={modal.equipment[field]}
                        onChange={handleModalChange}
                        min="0"
                      />
                    </div>
                  )
                )}
                <div className="mb-2">
                  <label className="form-label">Condition</label>
                  <select
                    className="form-select"
                    name="conditionStatus"
                    value={modal.equipment.conditionStatus}
                    onChange={handleModalChange}
                  >
                    <option>Good</option>
                    <option>Damaged</option>
                    <option>Needs Repair</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  {modal.isEdit ? "Save Changes" : "Add Equipment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmDelete({ show: false, id: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this equipment? This action
                  cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmDelete({ show: false, id: null })}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(confirmDelete.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
