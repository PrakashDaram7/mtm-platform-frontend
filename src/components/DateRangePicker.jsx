import React, { useState, useRef, useEffect } from 'react';

const DateRangePicker = ({ dateFrom, dateTo, onChange }) => {
    const [open, setOpen] = useState(false);
    const [localFrom, setLocalFrom] = useState(dateFrom || '');
    const [localTo, setLocalTo] = useState(dateTo || '');
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync props
    useEffect(() => { setLocalFrom(dateFrom || ''); setLocalTo(dateTo || ''); }, [dateFrom, dateTo]);

    const handleApply = () => {
        onChange(localFrom, localTo);
        setOpen(false);
    };

    const handleClear = () => {
        setLocalFrom(''); setLocalTo('');
        onChange('', '');
        setOpen(false);
    };

    const handlePreset = (days) => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);
        const f = from.toISOString().split('T')[0];
        const t = to.toISOString().split('T')[0];
        setLocalFrom(f); setLocalTo(t);
        onChange(f, t);
        setOpen(false);
    };

    const formatDisplay = () => {
        if (!dateFrom && !dateTo) return '📅 Date Range';
        const fmt = (d) => {
            const dt = new Date(d + 'T00:00:00');
            return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        };
        if (dateFrom && dateTo) return `${fmt(dateFrom)} → ${fmt(dateTo)}`;
        if (dateFrom) return `From ${fmt(dateFrom)}`;
        return `Until ${fmt(dateTo)}`;
    };

    return (
        <div className="date-range-picker" ref={ref}>
            <button
                type="button"
                className={`date-range-btn ${(dateFrom || dateTo) ? 'active' : ''}`}
                onClick={() => setOpen(!open)}
            >
                {formatDisplay()}
            </button>

            {open && (
                <div className="date-range-dropdown">
                    <div className="date-range-header">Select Date Range</div>

                    <div className="date-range-presets">
                        <button type="button" onClick={() => handlePreset(7)}>Last 7 days</button>
                        <button type="button" onClick={() => handlePreset(30)}>Last 30 days</button>
                        <button type="button" onClick={() => handlePreset(90)}>Last 90 days</button>
                    </div>

                    <div className="date-range-fields">
                        <div className="date-range-field">
                            <label>From</label>
                            <input type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)} />
                        </div>
                        <span className="date-range-arrow">→</span>
                        <div className="date-range-field">
                            <label>To</label>
                            <input type="date" value={localTo} onChange={e => setLocalTo(e.target.value)} />
                        </div>
                    </div>

                    <div className="date-range-actions">
                        <button type="button" className="dr-clear" onClick={handleClear}>Clear</button>
                        <button type="button" className="dr-apply" onClick={handleApply}>Apply</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
