async function initCourtrooms() {
    let courtrooms = [];
    let judges = [];
    let hearings = [];

    const loadData = async () => {
        try {
            const [courtroomsRes, judgesRes, hearingsRes] = await Promise.all([
                apiFetch('/courtrooms'),
                apiFetch('/judges'),
                apiFetch('/hearings')
            ]);
            courtrooms = courtroomsRes.data;
            judges = judgesRes.data;
            hearings = hearingsRes.data;
        } catch (err) {
            console.error('Error loading courtrooms data:', err);
        }
    };

    await loadData();

    const getStatusStyle = (status) => {
        if (status === 'In Use')      return { color: 'var(--text-primary)', glow: 'rgba(255,255,255,0.1)',  label: 'In Use' };
        if (status === 'Maintenance') return { color: 'var(--text-secondary)', glow: 'rgba(255,255,255,0.05)', label: 'Maintenance' };
        return                               { color: 'var(--text-muted)', glow: 'rgba(255,255,255,0.02)', label: 'Available' };
    };

    const renderGrid = () => {
        const grid = document.getElementById('courtrooms-grid');
        grid.innerHTML = '';

        if (courtrooms.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">${getEmptyStateHTML('No courtrooms found')}</div>`;
            return;
        }

        courtrooms.forEach(cr => {
            const assignedJudge = judges.find(j => {
                const jCrId = typeof j.courtroom_id === 'object' ? j.courtroom_id._id : j.courtroom_id;
                return jCrId === cr._id;
            });
            const todayStr = new Date().toISOString().split('T')[0];
            const todaysHearings = hearings.filter(h => {
                const hCrId = typeof h.courtroom_id === 'object' ? h.courtroom_id._id : h.courtroom_id;
                const hDate = new Date(h.date).toISOString().split('T')[0];
                return hCrId === cr._id && hDate === todayStr;
            }).length;
            const { color, glow, label } = getStatusStyle(cr.status);

            const card = document.createElement('div');
            card.className = 'courtroom-card';
            card.innerHTML = `
                <div class="courtroom-card-inner" style="background:var(--bg-card);backdrop-filter:blur(12px);border:1px solid var(--border-subtle);border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.2),inset 0 0 0 1px ${glow};display:flex;flex-direction:column;gap:16px;transition:all 0.3s ease;height:100%;position:relative;overflow:hidden;">
                    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--text-primary),var(--text-muted));"></div>

                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Room</div>
                            <div style="font-family:var(--font);font-size:3rem;font-weight:800;color:var(--text-primary);line-height:1;">${cr.room_no}</div>
                        </div>
                        <div style="cursor:pointer;" onclick="toggleStatus('${cr._id}')" title="Click to cycle status">
                            <div style="display:inline-flex;align-items:center;gap:6px;background:var(--accent-light);color:var(--text-primary);padding:6px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;border:1px solid var(--border-subtle);box-shadow:0 0 10px ${glow};transition:all 0.2s;">
                                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-primary);box-shadow:0 0 6px var(--text-primary);flex-shrink:0;"></span>
                                ${label}
                            </div>
                        </div>
                    </div>

                    <div style="background:rgba(255,255,255,0.02);border-radius:10px;padding:12px;border:1px solid var(--border-subtle);">
                        <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Presiding Judge</div>
                        <div style="font-size:0.9rem;font-weight:600;color:${assignedJudge ? 'var(--text-primary)' : 'var(--text-muted)'};">${assignedJudge ? assignedJudge.name : 'Unassigned'}</div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border-subtle);">
                        <div style="display:flex;gap:12px;">
                            <div style="text-align:center;">
                                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Floor</div>
                                <div style="font-size:1rem;font-weight:700;color:var(--text-primary);">${cr.floor}</div>
                            </div>
                            <div style="width:1px;background:var(--border-subtle);"></div>
                            <div style="text-align:center;">
                                <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Capacity</div>
                                <div style="font-size:1rem;font-weight:700;color:var(--text-primary);">${cr.capacity}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Today</div>
                            <div style="font-size:1rem;font-weight:700;color:${todaysHearings > 0 ? 'var(--text-primary)' : 'var(--text-muted)'};">${todaysHearings} <span style="font-size:0.75rem;font-weight:400;">hearings</span></div>
                        </div>
                    </div>
                </div>
            `;
            const inner = card.querySelector('.courtroom-card-inner');
            card.addEventListener('mouseenter', () => { inner.style.transform = 'translateY(-4px)'; inner.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4),inset 0 0 0 1px var(--accent)`; inner.style.background = 'var(--accent-light)'; });
            card.addEventListener('mouseleave', () => { inner.style.transform = 'translateY(0)'; inner.style.boxShadow = `0 4px 20px rgba(0,0,0,0.2),inset 0 0 0 1px ${glow}`; inner.style.background = 'var(--bg-card)'; });
            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from('#courtrooms-grid .courtroom-card', { opacity: 0, scale: 0.9, y: 20, duration: 0.5, stagger: 0.07, ease: "back.out(1.2)" });
        }
    };

    document.getElementById('btn-add-courtroom').addEventListener('click', () => {
        createModal({
            title: 'Add New Courtroom',
            content: `<form id="cr-form">
                <div class="form-group"><label class="form-label">Room Number</label><input type="text" class="form-control" id="new-cr-room" required></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="form-group"><label class="form-label">Floor</label><input type="number" class="form-control" id="new-cr-floor" required></div>
                    <div class="form-group"><label class="form-label">Capacity (Seats)</label><input type="number" class="form-control" id="new-cr-cap" required></div>
                </div>
                <div class="form-group"><label class="form-label">Initial Status</label><select class="form-control" id="new-cr-status" required><option value="Available">Available</option><option value="In Use">In Use</option><option value="Maintenance">Maintenance</option></select></div>
            </form>`,
            saveText: 'Add Courtroom',
            onSave: async (overlay) => {
                if(!validateForm(overlay.querySelector('#cr-form'))) return false;
                const newCR = { 
                    room_no: document.getElementById('new-cr-room').value, 
                    floor: parseInt(document.getElementById('new-cr-floor').value), 
                    capacity: parseInt(document.getElementById('new-cr-cap').value), 
                    status: document.getElementById('new-cr-status').value 
                };
                
                try {
                    await apiFetch('/courtrooms', 'POST', newCR);
                    await loadData();
                    renderGrid();
                    showToast('Courtroom created successfully.');
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    });

    window.toggleStatus = async (id) => {
        const cr = courtrooms.find(item => item._id === id);
        if(!cr) return;
        let next = 'Available';
        if(cr.status === 'Available') next = 'In Use';
        else if(cr.status === 'In Use') next = 'Maintenance';
        
        try {
            await apiFetch(`/courtrooms/${id}`, 'PUT', { status: next });
            await loadData();
            renderGrid();
            showToast(`Room ${cr.room_no} → ${next}`);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    renderGrid();
}

