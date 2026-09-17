import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, EyeOff, Power, X, CheckCircle, AlertCircle, Image as ImageIcon, Upload, Link as LinkIcon, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import AnimatedModal from '../../components/ui/AnimatedModal';
import AlertBanner from '../../components/ui/AlertBanner';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ itemName: '', price: '', category: '', isAvailable: true, isVeg: true, imageUrl: '' });
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [message, setMessage] = useState({ type: '', text: '' });
  const [menuVisible, setMenuVisible] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMenu();
    fetchMenuVisibility();
  }, []);

  const fetchMenuVisibility = async () => {
    try {
      const res = await axios.get('/admin/menu/visibility');
      setMenuVisible(res.data.isVisible);
    } catch (err) {
      console.error('Failed to load menu visibility setting:', err);
    }
  };

  const handleToggleMenuVisibility = async () => {
    const nextVal = !menuVisible;
    try {
      await axios.put('/admin/menu/visibility', { isVisible: nextVal });
      setMenuVisible(nextVal);
      setMessage({
        type: 'success',
        text: `Customer Ordering is now ${nextVal ? 'ACTIVE (Accepting Orders)' : 'PAUSED (Not Taking Orders)'}`
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update ordering status' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/admin/menu');
      setMenuItems(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load menu' });
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category || 'General')))
    .sort((a, b) => {
      const isStarterA = a.toLowerCase().includes('starter') || a.toLowerCase().includes('starer');
      const isStarterB = b.toLowerCase().includes('starter') || b.toLowerCase().includes('starer');
      if (isStarterA && !isStarterB) return -1;
      if (!isStarterA && isStarterB) return 1;
      return a.localeCompare(b);
    });

  const categoryNames = ['All', ...categories];

  const filteredMenuItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => (item.category || 'General') === selectedCategory);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      itemName: '',
      price: '',
      category: selectedCategory === 'All' ? '' : selectedCategory,
      isAvailable: true,
      isVeg: true,
      imageUrl: ''
    });
    setImageMode('url');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      itemName: item.item_name,
      price: item.price.toString(),
      category: item.category || '',
      isAvailable: item.is_available,
      isVeg: item.is_veg !== false,
      imageUrl: item.image_url || ''
    });
    setImageMode(item.image_url?.startsWith('data:') ? 'upload' : 'url');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Compress & resize image to max 800x800 for optimal fast loading
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl.trim() || null
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
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.put(`/admin/menu/${item.id}`, { ...item, isAvailable: !item.is_available });
      fetchMenu();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Manage Menu"
        subtitle="Add, edit, or remove menu items with images"
        showBack={true}
        backTo="/admin/home"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MotionButton
              className={`btn ${menuVisible ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggleMenuVisibility}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              title="Master toggle for customer order taking"
            >
              <Power size={16} />
              Orders: {menuVisible ? 'ACTIVE' : 'PAUSED'}
            </MotionButton>
            <MotionButton className="btn btn-primary" onClick={openAddModal} id="add-menu-item">
              <Plus size={18} /> Add Item
            </MotionButton>
          </div>
        }
      />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      {/* Side-by-side Category Buttons Navigation */}
      {menuItems.length > 0 && (
        <div className="category-buttons-container" style={{ marginBottom: '1.25rem' }} role="tablist" aria-label="Manage menu categories">
          {categoryNames.map(cat => {
            const count = cat === 'All'
              ? menuItems.length
              : menuItems.filter(item => (item.category || 'General') === cat).length;
            return (
              <MotionButton
                key={cat}
                type="button"
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                whileTap={{ scale: 0.95 }}
                id={`manage-cat-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <span>{cat}</span>
                <span className="category-btn-count">{count}</span>
              </MotionButton>
            );
          })}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table table-responsive-cards">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Image</th>
              <th>Item Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenuItems.map(item => (
              <tr key={item.id}>
                <td data-label="Image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.item_name}
                      className="menu-table-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="menu-table-thumb-placeholder"
                    style={{ display: item.image_url ? 'none' : 'flex' }}
                  >
                    <UtensilsCrossed size={18} />
                  </div>
                </td>
                <td data-label="Item" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`veg-indicator ${item.is_veg !== false ? 'veg' : 'non-veg'}`} title={item.is_veg !== false ? 'Veg' : 'Non-Veg'} />
                    {item.item_name}
                  </div>
                </td>
                <td data-label="Price" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>₹{item.price}</td>
                <td data-label="Category">{item.category || 'General'}</td>
                <td data-label="Status">
                  <span className={`badge ${item.is_available ? 'badge-active' : 'badge-blocked'}`}>
                    {item.is_available ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td data-label="Actions">
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <MotionButton className="btn btn-ghost btn-sm" onClick={() => toggleAvailability(item)} title={item.is_available ? 'Hide' : 'Show'}>
                      {item.is_available ? <EyeOff size={16} /> : <Eye size={16} />}
                    </MotionButton>
                    <MotionButton className="btn btn-ghost btn-sm" onClick={() => openEditModal(item)} title="Edit">
                      <Edit2 size={16} />
                    </MotionButton>
                    <MotionButton className="btn btn-ghost btn-sm" onClick={() => deleteItem(item.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </MotionButton>
                  </div>
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No menu items. Click "Add Item" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatedModal open={showModal} onClose={() => setShowModal(false)}>
        <div className="modal-header">
          <h3>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)} aria-label="Close dialog">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input type="text" className="form-input" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required id="menu-item-name" />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input type="number" className="form-input" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" step="0.5" id="menu-item-price" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input type="text" className="form-input" placeholder="e.g., Snacks, Beverages, Meals" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} id="menu-item-category" />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-input" value={formData.isVeg ? 'veg' : 'non-veg'} onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })} required>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>

            {/* Image Input Section */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={16} /> Item Image
              </label>

              <div className="image-input-tabs">
                <button
                  type="button"
                  className={`image-tab-btn ${imageMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageMode('url')}
                >
                  <LinkIcon size={13} style={{ display: 'inline', marginRight: '0.3rem' }} /> Image Link (URL)
                </button>
                <button
                  type="button"
                  className={`image-tab-btn ${imageMode === 'upload' ? 'active' : ''}`}
                  onClick={() => {
                    setImageMode('upload');
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                >
                  <Upload size={13} style={{ display: 'inline', marginRight: '0.3rem' }} /> Upload from Files
                </button>
              </div>

              {imageMode === 'url' ? (
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste image link (e.g. https://...)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  id="menu-item-image-url"
                />
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div className="file-dropzone" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={24} style={{ color: 'var(--primary-400)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to choose image from your computer</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WebP (auto-optimized)</span>
                  </div>
                </div>
              )}

              {formData.imageUrl && (
                <div className="image-preview-container">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="image-preview-img"
                    onError={(e) => {
                      e.target.src = '';
                      toast.error('Failed to load image preview. Please check the URL.');
                    }}
                  />
                  <button
                    type="button"
                    className="image-preview-clear"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} />
                <span className="form-label" style={{ margin: 0 }}>Available for ordering</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <MotionButton type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</MotionButton>
            <MotionButton type="submit" className="btn btn-primary" id="save-menu-item">
              {editItem ? 'Update Item' : 'Add Item'}
            </MotionButton>
          </div>
        </form>
      </AnimatedModal>
    </div>
  );
};

export default ManageMenu;
