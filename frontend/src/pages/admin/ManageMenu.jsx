import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, CheckCircle, AlertCircle } from 'lucide-react';

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ itemName: '', price: '', category: '', isAvailable: true, isVeg: true });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/admin/menu');
      setMenuItems(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load menu' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ itemName: '', price: '', category: '', isAvailable: true, isVeg: true });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      itemName: item.item_name,
      price: item.price.toString(),
      category: item.category || '',
      isAvailable: item.is_available,
      isVeg: item.is_veg !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editItem) {
        await axios.put(`/admin/menu/${editItem.id}`, data);
        setMessage({ type: 'success', text: 'Menu item updated!' });
      } else {
        await axios.post('/admin/menu', data);
        setMessage({ type: 'success', text: 'Menu item added!' });
      }

      setShowModal(false);
      fetchMenu();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await axios.delete(`/admin/menu/${id}`);
      setMessage({ type: 'success', text: 'Item deleted' });
      fetchMenu();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.put(`/admin/menu/${item.id}`, { ...item, isAvailable: !item.is_available });
      fetchMenu();
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Manage Menu</h1>
          <p>Add, edit, or remove menu items</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="add-menu-item">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
          {message.text}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '2px', flexShrink: 0,
                    backgroundColor: item.is_veg !== false ? '#22c55e' : '#ef4444',
                    border: '1px solid #fff',
                    boxShadow: '0 0 0 1px ' + (item.is_veg !== false ? '#22c55e' : '#ef4444')
                  }} title={item.is_veg !== false ? 'Veg' : 'Non-Veg'} />
                  {item.item_name}
                </td>
                <td style={{ color: 'var(--primary-400)', fontWeight: 600 }}>₹{item.price}</td>
                <td>{item.category || 'General'}</td>
                <td>
                  <span className={`badge ${item.is_available ? 'badge-active' : 'badge-blocked'}`}>
                    {item.is_available ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleAvailability(item)} title={item.is_available ? 'Hide' : 'Show'}>
                      {item.is_available ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(item)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteItem(item.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No menu items. Click "Add Item" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    required
                    id="menu-item-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.5"
                    id="menu-item-price"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Snacks, Beverages, Meals"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    id="menu-item-category"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-input"
                    value={formData.isVeg ? 'veg' : 'non-veg'}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                    required
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Available for ordering</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-menu-item">
                  {editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMenu;
