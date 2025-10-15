import React, { useEffect, useState } from "react";
import { getAllEquipment, addEquipment, updateEquipment, deleteEquipment } from "../services/api";

const AdminDashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", quantity: 1, availableQuantity: 1, conditionStatus: "Good" });
  const [message, setMessage] = useState("");

  const fetchEquipment = async () => {
    try {
      const response = await getAllEquipment();
      setEquipmentList(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await addEquipment({ ...form, quantity: parseInt(form.quantity), availableQuantity: parseInt(form.availableQuantity) });
      setMessage(`Added ${response.data.name}`);
      setForm({ name: "", category: "", quantity: 1, availableQuantity: 1, conditionStatus: "Good" });
      fetchEquipment();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEquipment(id);
      setMessage("Deleted successfully");
      fetchEquipment();
    } catch (err) {
      setMessage("Failed to delete");
    }
  };

  const handleEdit = async (equipment) => {
    const newName = prompt("Enter new name", equipment.name) || equipment.name;
    const newCategory = prompt("Enter new category", equipment.category) || equipment.category;
    try {
      await updateEquipment(equipment.id, { ...equipment, name: newName, category: newCategory });
      setMessage("Updated successfully");
      fetchEquipment();
    } catch (err) {
      setMessage("Failed to update");
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Admin Equipment Management</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleAdd} className="mb-4">
        <div className="row">
          <div className="col">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="form-control" required />
          </div>
          <div className="col">
            <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="form-control" required />
          </div>
          <div className="col">
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="form-control" min="1" />
          </div>
          <div className="col">
            <input name="availableQuantity" type="number" value={form.availableQuantity} onChange={handleChange} className="form-control" min="0" />
          </div>
          <div className="col">
            <select name="conditionStatus" value={form.conditionStatus} onChange={handleChange} className="form-control">
              <option>Good</option>
              <option>Damaged</option>
              <option>Needs Repair</option>
            </select>
          </div>
          <div className="col">
            <button type="submit" className="btn btn-success">Add Equipment</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead>
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
          {equipmentList.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.name}</td>
              <td>{eq.category}</td>
              <td>{eq.conditionStatus}</td>
              <td>{eq.quantity}</td>
              <td>{eq.availableQuantity}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(eq)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(eq.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
