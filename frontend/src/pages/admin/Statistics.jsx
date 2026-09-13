import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Calendar, BarChart3, ArrowUpDown, Search, Package } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { useMotionSafe } from '../../lib/motion';

const Statistics = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState('today');
  const [block, setBlock] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [sortField, setSortField] = useState('totalQuantity'); // 'name' | 'totalQuantity' | 'totalRevenue'
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const { reduced, transition } = useMotionSafe();

  useEffect(() => {
    // Automatically load today's statistics on mount
    fetchStats(todayStr, todayStr, '');
  }, []);

  const fetchStats = async (start = startDate, end = endDate, blk = block) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      let url = `/admin/statistics?startDate=${start}&endDate=${end}`;
      if (blk) url += `&block=${blk}`;
      const res = await axios.get(url);
      setItems(res.data.data || []);
      setFetched(true);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let start = today;
    let end = today;

    if (preset === 'today') {
      start = today;
      end = today;
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = y.toISOString().split('T')[0];
      end = start;
    } else if (preset === 'thisWeek') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 6);
      start = d7.toISOString().split('T')[0];
      end = today;
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0];
      end = today;
    } else if (preset === 'all') {
      start = '2024-01-01';
      end = today;
    }

    setStartDate(start);
    setEndDate(end);
    fetchStats(start, end, block);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default to descending for numbers
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setActivePreset('custom');
    fetchStats(startDate, endDate, block);
  };

  // Filter and Sort
  const filtered = items.filter(item => {
    if (!searchQuery) return true;
    return (item._id || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortField === 'name') {
      comp = (a._id || '').localeCompare(b._id || '');
    } else if (sortField === 'totalQuantity') {
      comp = Number(a.totalQuantity || 0) - Number(b.totalQuantity || 0);
    } else if (sortField === 'totalRevenue') {
      comp = Number(a.totalRevenue || 0) - Number(b.totalRevenue || 0);
    }
    return sortAsc ? comp : -comp;
  });

  const grandTotalUnits = items.reduce((sum, i) => sum + (Number(i.totalQuantity) || 0), 0);
  const grandTotalRevenue = items.reduce((sum, i) => sum + (Number(i.totalRevenue) || 0), 0);

  return (
    <div>
      <PageHeader 
        title="Item Sales Statistics" 
        subtitle="Analyze quantity ordered and revenue generated for each menu item" 
        badge={`${items.length} Items Ordered`}
        showBack={true}
        backTo="/admin/home"
      />

      {/* Preset Quick-Picks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
          Quick Range:
        </span>
        {[
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'thisWeek', label: 'Last 7 Days' },
          { key: 'thisMonth', label: 'This Month' },
          { key: 'all', label: 'All Time' },
        ].map((p) => (
          <MotionButton
            key={p.key}
            type="button"
            className={`btn btn-sm ${activePreset === p.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => applyPreset(p.key)}
          >
            {p.label}
          </MotionButton>
        ))}
      </div>

      {/* Custom Filters */}
      <form className="filter-bar" onSubmit={handleCustomSubmit}>
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={startDate} 
            onChange={(e) => { setStartDate(e.target.value); setActivePreset('custom'); }} 
            id="stats-start-date" 
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={endDate} 
            onChange={(e) => { setEndDate(e.target.value); setActivePreset('custom'); }} 
            id="stats-end-date" 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Block</label>
          <select 
            className="form-input" 
            value={block} 
            onChange={(e) => { setBlock(e.target.value); fetchStats(startDate, endDate, e.target.value); }} 
            id="stats-block"
          >
            <option value="">All Blocks</option>
            <option value="F Block (Old)">F Block (Old)</option>
            <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
          </select>
        </div>
        <MotionButton type="submit" className="btn btn-primary" id="get-stats">
          <Calendar size={18} /> Apply Filters
        </MotionButton>
      </form>

      {/* Instant Search Bar */}
      {items.length > 0 && (
        <div className="search-bar" style={{ marginBottom: '1.25rem' }}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Filter item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="stats-search"
          />
        </div>
      )}

      {loading && <LoadingState />}

      {!fetched && !loading && (
        <EmptyState
          icon={BarChart3}
          title="No statistics yet"
          description="Choose a date range and optional block, then select Apply Filters to see per-item totals."
        />
      )}

      {fetched && !loading && (
        <motion.div
          className="table-wrapper"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          <table className="table table-responsive-cards">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Item Name"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Menu Item</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'name' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('totalQuantity')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Quantity"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Total Quantity Ordered</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'totalQuantity' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('totalRevenue')} 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Revenue"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Total Revenue Generated</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'totalRevenue' ? 1 : 0.4 }} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item._id}>
                  <td data-label="Menu Item" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item._id}
                  </td>
                  <td data-label="Quantity" style={{ fontWeight: 600 }}>
                    {item.totalQuantity} units
                  </td>
                  <td data-label="Revenue" style={{ color: 'var(--success)', fontWeight: 600 }}>
                    ₹{item.totalRevenue}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No orders placed matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                  <td style={{ color: 'var(--text-primary)' }}>Grand Total ({items.length} Unique Items)</td>
                  <td style={{ color: 'var(--primary-400)' }}>{grandTotalUnits} units</td>
                  <td style={{ color: 'var(--success)' }}>₹{grandTotalRevenue}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;
