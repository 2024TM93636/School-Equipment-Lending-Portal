import { useEffect, useState, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const perPage = 10; // pagination limit updated

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

  const defaultEquipment = {
    name: "",
    category: "",
    quantity: 1,
    availableQuantity: 1,
    conditionStatus: "Good",
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllEquipment();
      setEquipmentList(response.data);
    } catch (err) {
      showMessage("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const openModal = (isEdit = false, equipment = null) => {
    setModal({
      show: true,
      isEdit,
      equipment: equipment ? { ...equipment } : { ...defaultEquipment },
    });
    setErrors({});
  };

  const closeModal = () => {
    setModal({
      show: false,
      isEdit: false,
      equipment: { ...defaultEquipment },
    });
  };

  const handleModalChange = (e) => {
    setModal((prev) => ({
      ...prev,
      equipment: { ...prev.equipment, [e.target.name]: e.target.value },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const eq = modal.equipment;
    if (!eq.name.trim()) newErrors.name = "Name is required";
    if (!eq.category.trim()) newErrors.category = "Category is required";
    if (eq.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (eq.availableQuantity < 0)
      newErrors.availableQuantity = "Available cannot be negative";
    if (eq.availableQuantity > eq.quantity)
      newErrors.availableQuantity = "Available cannot exceed total quantity";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...modal.equipment,
        quantity: parseInt(modal.equipment.quantity, 10),
        availableQuantity: parseInt(modal.equipment.availableQuantity, 10),
      };
      if (modal.isEdit) {
        await updateEquipment(modal.equipment.id, payload);
        showMessage("Equipment updated successfully");
      } else {
        await addEquipment(payload);
        showMessage(`Added ${modal.equipment.name}`);
      }
      closeModal();
      fetchEquipment();
    } catch (err) {
      showMessage(err.response?.data?.error || "Operation failed");
    } finally {
      setSaving(false);
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

  const totalPages = Math.ceil(filteredEquipment.length / perPage);
  const paginatedEquipment = filteredEquipment.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Dashboard summary
  const totalItems = equipmentList.length;
  const totalAvailable = equipmentList.reduce(
    (sum, eq) => sum + (eq.availableQuantity || 0),
    0
  );
  const lowStock = equipmentList.filter(
    (eq) => eq.availableQuantity < 2
  ).length;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-gradient">
        Admin Equipment Dashboard
      </h2>

      {message && <div className="alert alert-info text-center">{message}</div>}

      {/* Dashboard Summary */}
      <div className="row text-center mb-4">
        <div className="col-md-4">
          <div className="card summary-card shadow-sm p-3">
            <h5>Total Equipment</h5>
            <h3>{totalItems}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card summary-card shadow-sm p-3">
            <h5>Total Available</h5>
            <h3>{totalAvailable}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card summary-card shadow-sm p-3">
            <h5>Low Stock (&lt;2)</h5>
            <h3 className="text-danger">{lowStock}</h3>
          </div>
        </div>
      </div>

      {/* Search and Add */}
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <div className="position-relative w-50">
          <i
            className="bi bi-search position-absolute"
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
            }}
          ></i>
          <input
            type="text"
            className="form-control rounded-pill ps-5"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn btn-success rounded-pill"
          onClick={() => openModal(false)}
        >
          + Add Equipment
        </button>
      </div>

      {/* Equipment Table */}
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
                <th>Name</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Quantity</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEquipment.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    No equipment found.
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((eq) => (
                  <tr
                    key={eq.id}
                    className={
                      eq.availableQuantity < 2 ? "table-warning" : undefined
                    }
                  >
                    <td>{eq.name}</td>
                    <td>{eq.category}</td>
                    <td>{eq.conditionStatus}</td>
                    <td>{eq.quantity}</td>
                    <td>{eq.availableQuantity}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm rounded-pill"
                          onClick={() => openModal(true, eq)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm rounded-pill"
                          onClick={() =>
                            setConfirmDelete({ show: true, id: eq.id })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${page === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal.show && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
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
                        className={`form-control ${
                          errors[field] ? "is-invalid" : ""
                        }`}
                        type={field.includes("Quantity") ? "number" : "text"}
                        name={field}
                        value={modal.equipment[field]}
                        onChange={handleModalChange}
                        min="0"
                      />
                      {errors[field] && (
                        <div className="invalid-feedback">{errors[field]}</div>
                      )}
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
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : modal.isEdit
                    ? "Save Changes"
                    : "Add Equipment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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
                <p>Are you sure you want to delete this equipment?</p>
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
