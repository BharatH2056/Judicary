async function initJudges() {
    let judges = [];
    let courtrooms = [];
    let hearings = [];

    const loadData = async () => {
        try {
            const [judgesRes, courtroomsRes, hearingsRes] = await Promise.all([
                apiFetch('/judges'),
                apiFetch('/courtrooms'),
                apiFetch('/hearings')
            ]);
            judges = judgesRes.data;
            courtrooms = courtroomsRes.data;
            hearings = hearingsRes.data;
        } catch (err) {
            console.error('Error loading judges data:', err);
        }
    };

    await loadData();

    const getSpecStyle = (spec) => {
        if (spec === 'Criminal') return { color: 'var(--text-primary)', glow: 'rgba(255,255,255,0.1)' };
        if (spec === 'Civil')    return { color: 'var(--text-secondary)', glow: 'rgba(255,255,255,0.05)' };
        if (spec === 'Family')   return { color: 'var(--text-muted)', glow: 'rgba(255,255,255,0.03)' };
        if (spec === 'Corporate') return { color: 'var(--text-secondary)', glow: 'rgba(255,255,255,0.08)' };
        return { color: 'var(--text-muted)', glow: 'rgba(255,255,255,0.02)' };
    };

    const renderTable = () => {
        const grid = document.getElementById('judges-grid');
        grid.innerHTML = '';

        if (judges.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">${getEmptyStateHTML('No judges on the roster yet')}</div>`;
            return;
        }

        judges.forEach(j => {
            const cr = j.courtroom_id; // Populated by backend
            const uniqueCases = new Set(hearings.filter(h => {
                // Handle both object and ID comparison
                const hJudgeId = typeof h.judge_id === 'object' ? h.judge_id._id : h.judge_id;
                return hJudgeId === j._id;
            }).map(h => typeof h.case_id === 'object' ? h.case_id._id : h.case_id)).size;
            
            const initials = j.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const { color, glow } = getSpecStyle(j.specialization);

            const card = document.createElement('div');
            card.className = 'judge-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="judge-card-inner" style="background:var(--bg-card);backdrop-filter:blur(12px);border:1px solid var(--border-subtle);border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.2),inset 0 0 0 1px ${glow};display:flex;flex-direction:column;gap:16px;transition:all 0.3s ease;height:100%;">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <div style="width:54px;height:54px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid var(--border-medium);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:1.2rem;font-weight:700;color:var(--text-primary);flex-shrink:0;">${initials}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.72rem;color:var(--text-muted);font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:3px;">${j.judge_id || j._id.substring(0,8)}</div>
                            <h3 style="font-family:var(--font);font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${j.name}</h3>
                        </div>
                        <div style="background:var(--accent-light);color:var(--text-primary);padding:4px 10px;border-radius:20px;font-size:0.72rem;font-weight:600;border:1px solid var(--border-subtle);white-space:nowrap;flex-shrink:0;">${j.specialization}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div style="background:rgba(255,255,255,0.02);border-radius:10px;padding:10px 12px;border:1px solid var(--border-subtle);">
                            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Experience</div>
                            <div style="font-size:1rem;font-weight:700;color:var(--text-primary);">${j.experience_yrs || 0} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">yrs</span></div>
                        </div>
                        <div style="background:rgba(255,255,255,0.02);border-radius:10px;padding:10px 12px;border:1px solid var(--border-subtle);">
                            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Active Cases</div>
                            <div style="font-size:1rem;font-weight:700;color:var(--text-primary);">${uniqueCases}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.02);border-radius:10px;padding:10px 12px;border:1px solid var(--border-subtle);">
                        <span class="material-icons-outlined" style="font-size:16px;color:var(--text-muted);">meeting_room</span>
                        <div>
                            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Courtroom</div>
                            <div style="font-size:0.9rem;font-weight:600;color:var(--text-primary);">${cr ? `Room ${cr.room_no} — Floor ${cr.floor}` : '<span style="color:var(--text-muted)">Unassigned</span>'}</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid var(--border-subtle);">
                        <button onclick="event.stopPropagation();editJudge('${j._id}')" style="background:var(--bg-card);border:1px solid var(--border-subtle);color:var(--text-primary);width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='var(--accent-light)';this.style.borderColor='var(--accent)'" onmouseout="this.style.background='var(--bg-card)';this.style.borderColor='var(--border-subtle)'" title="Edit"><span class="material-icons-outlined" style="font-size:18px;">edit</span></button>
                        <button onclick="event.stopPropagation();deleteJudge('${j._id}')" style="background:var(--bg-card);border:1px solid var(--border-subtle);color:var(--text-primary);width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='var(--text-primary)'" onmouseout="this.style.background='var(--bg-card)';this.style.borderColor='var(--border-subtle)'" title="Delete"><span class="material-icons-outlined" style="font-size:18px;">delete</span></button>
                    </div>
                </div>
            `;

            const inner = card.querySelector('.judge-card-inner');
            card.addEventListener('mouseenter', () => { inner.style.transform = 'translateY(-4px)'; inner.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4),inset 0 0 0 1px ${color}`; inner.style.background = 'rgba(255,255,255,0.06)'; });
            card.addEventListener('mouseleave', () => { inner.style.transform = 'translateY(0)'; inner.style.boxShadow = `0 4px 20px rgba(0,0,0,0.2),inset 0 0 0 1px ${glow}`; inner.style.background = 'rgba(255,255,255,0.03)'; });
            card.onclick = () => viewJudge(j._id);
            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from('#judges-grid .judge-card', { opacity: 0, scale: 0.9, y: 20, duration: 0.5, stagger: 0.06, ease: "back.out(1.2)" });
        }
    };

    // Populate the shared courtroom dropdown from a fresh API call
    async function populateCourtroomDropdown(currentCourtroomId = null) {
        try {
            const res = await apiFetch('/courtrooms');
            const select = document.getElementById('judge-courtroom-select');
            if (!select) return;

            select.innerHTML = '<option value="">No Courtroom Assigned</option>';

            res.data.forEach(room => {
                const roomJudgeId = room.judge_id
                    ? (typeof room.judge_id === 'object' ? room.judge_id._id : room.judge_id.toString())
                    : null;
                const currentId = currentCourtroomId ? currentCourtroomId.toString() : null;

                // Assigned to another judge — show but disable
                const isAssigned = roomJudgeId && roomJudgeId !== currentId;

                select.innerHTML += `<option value="${room._id}" ${isAssigned ? 'disabled' : ''}>
                    ${room.room_id || room.room_no} — Room ${room.room_no} (Floor ${room.floor}) ${isAssigned ? '(Already Assigned)' : '(Available)'}
                </option>`;
            });
        } catch (err) {
            console.error('Failed to load courtrooms', err);
        }
    }

    document.getElementById('btn-add-judge').addEventListener('click', async () => {
        // Pre-fetch courtrooms BEFORE the modal opens — no race condition
        let crOptionsHtml = '<option value="">No Courtroom Assigned</option>';
        try {
            const res = await apiFetch('/courtrooms');
            res.data.forEach(room => {
                const roomJudgeId = room.judge_id
                    ? (typeof room.judge_id === 'object' ? room.judge_id._id : room.judge_id.toString())
                    : null;
                const assignedText = roomJudgeId ? ' (Assigned)' : ' (Available)';
                crOptionsHtml += `<option value="${room._id}">
                    ${room.room_id} \u2014 Room ${room.room_no} (Floor ${room.floor})${assignedText}
                </option>`;
            });
        } catch (err) {
            console.error('Failed to load courtrooms for dropdown', err);
            crOptionsHtml += '<option disabled>Failed to load courtrooms</option>';
        }

        createModal({
            title: 'Add New Judge',
            content: `<form id="judge-form">
                <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" id="new-j-name" required placeholder="Hon. First Last"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="form-group"><label class="form-label">Specialization</label><select class="form-control" id="new-j-spec" required><option value="Criminal">Criminal</option><option value="Civil">Civil</option><option value="Family">Family</option><option value="Corporate">Corporate</option></select></div>
                    <div class="form-group"><label class="form-label">Experience (Years)</label><input type="number" class="form-control" id="new-j-exp" required min="1"></div>
                </div>
                <div class="form-group"><label class="form-label">Assign Courtroom</label><select class="form-control" id="judge-courtroom-select">${crOptionsHtml}</select></div>
            </form>`,
            saveText: 'Add Judge',
            onSave: async (overlay) => {
                if(!validateForm(overlay.querySelector('#judge-form'))) return false;
                const newJudge = {
                    name: document.getElementById('new-j-name').value,
                    specialization: document.getElementById('new-j-spec').value,
                    experience_yrs: parseInt(document.getElementById('new-j-exp').value),
                    courtroom_id: document.getElementById('judge-courtroom-select').value || null
                };
                try {
                    await apiFetch('/judges', 'POST', newJudge);
                    await loadData();
                    renderTable();
                    showToast('Judge added successfully.');
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    });

    window.deleteJudge = (id) => { 
        confirmDialog(`Delete judge?`, async () => { 
            try {
                await apiFetch(`/judges/${id}`, 'DELETE');
                playGavelSound(); 
                await loadData();
                renderTable(); 
                showToast('Judge deleted.'); 
            } catch (err) {
                showToast(err.message, 'error');
            }
        }); 
    };

    window.editJudge = async (id) => {
        const j = judges.find(item => item._id === id);
        if (!j) return;

        const currentCourtroomId = j.courtroom_id
            ? (typeof j.courtroom_id === 'object' ? j.courtroom_id._id : j.courtroom_id)
            : null;

        // Pre-fetch courtrooms BEFORE the modal opens — no race condition
        let crOptionsHtml = '<option value="">No Courtroom Assigned</option>';
        try {
            const res = await apiFetch('/courtrooms');
            res.data.forEach(room => {
                const roomJudgeId = room.judge_id
                    ? (typeof room.judge_id === 'object' ? room.judge_id._id : room.judge_id.toString())
                    : null;
                const currentId = currentCourtroomId ? currentCourtroomId.toString() : null;
                const isCurrentRoom = room._id.toString() === currentId;
                const assignedText = roomJudgeId && !isCurrentRoom ? ' (Assigned)' : ' (Available)';
                const isSelected = isCurrentRoom;
                crOptionsHtml += `<option value="${room._id}" ${isSelected ? 'selected' : ''}>
                    ${room.room_id} \u2014 Room ${room.room_no} (Floor ${room.floor})${assignedText}
                </option>`;
            });
        } catch (err) {
            console.error('Failed to load courtrooms for dropdown', err);
            crOptionsHtml += '<option disabled>Failed to load courtrooms</option>';
        }

        createModal({
            title: `Edit Judge: ${j.name}`,
            content: `<form id="edit-judge-form">
                <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" id="edit-j-name" required value="${j.name}"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="form-group"><label class="form-label">Specialization</label><select class="form-control" id="edit-j-spec" required><option value="Criminal" ${j.specialization==='Criminal'?'selected':''}>Criminal</option><option value="Civil" ${j.specialization==='Civil'?'selected':''}>Civil</option><option value="Family" ${j.specialization==='Family'?'selected':''}>Family</option><option value="Corporate" ${j.specialization==='Corporate'?'selected':''}>Corporate</option></select></div>
                    <div class="form-group"><label class="form-label">Experience (Years)</label><input type="number" class="form-control" id="edit-j-exp" required min="1" value="${j.experience_yrs || 0}"></div>
                </div>
                <div class="form-group"><label class="form-label">Assign Courtroom</label><select class="form-control" id="judge-courtroom-select">${crOptionsHtml}</select></div>
            </form>`,
            saveText: 'Save Changes',
            onSave: async (overlay) => {
                if(!validateForm(overlay.querySelector('#edit-judge-form'))) return false;
                const updatedData = {
                    name: document.getElementById('edit-j-name').value,
                    specialization: document.getElementById('edit-j-spec').value,
                    experience_yrs: parseInt(document.getElementById('edit-j-exp').value),
                    courtroom_id: document.getElementById('judge-courtroom-select').value || null
                };
                try {
                    await apiFetch(`/judges/${id}`, 'PUT', updatedData);
                    await loadData();
                    renderTable();
                    showToast(`Judge updated successfully.`);
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    };

    window.viewJudge = async (id) => {
        const j = judges.find(item => item._id === id);
        if (!j) return;
        
        const cr = j.courtroom_id;
        const jHearings = hearings.filter(h => {
            const hJudgeId = typeof h.judge_id === 'object' ? h.judge_id._id : h.judge_id;
            return hJudgeId === id;
        }).sort((a,b) => new Date(b.date)-new Date(a.date));
        
        const { color } = getSpecStyle(j.specialization);
        const initials = j.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        const html = `
            <div style="text-align:center;margin-bottom:24px;">
                <div style="width:72px;height:72px;border-radius:18px;background:var(--accent-light);border:2px solid var(--border-medium);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:1.8rem;font-weight:700;color:var(--text-primary);margin:0 auto 12px;">${initials}</div>
                <h3 style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">${j.name}</h3>
                <div style="color:var(--text-muted);margin-top:4px;font-size:0.875rem;">${j.experience_yrs || 0} Years Experience • ${j.specialization} Law</div>
            </div>
            <div class="detail-section"><h4>Courtroom Assignment</h4>
                <div style="padding:14px;background:var(--bg-card);border-radius:10px;border:1px solid var(--border-subtle);">
                    <div style="font-weight:700;color:var(--text-primary);">${cr ? `Room ${cr.room_no}` : 'Not Assigned'}</div>
                    <div style="font-size:0.875rem;color:var(--text-secondary);margin-top:4px;">${cr ? `Floor ${cr.floor} • Capacity: ${cr.capacity}` : 'N/A'}</div>
                </div>
            </div>
            <div class="detail-section"><h4>Recent Hearings (${jHearings.length})</h4>
                <ul style="list-style:none;padding:0;">
                    ${jHearings.map(h => { 
                        const c = h.case_id; // Populated or ID
                        const caseTitle = typeof c === 'object' ? c.title : (c || 'Unknown Case');
                        return `<li style="padding:10px 0;border-bottom:1px solid var(--border-subtle);"><div style="font-weight:600;font-size:0.875rem;color:var(--text-primary);margin-bottom:2px;">${formatDate(h.date)} at ${h.time}</div><div style="font-size:0.8rem;color:var(--text-secondary);">Case: ${caseTitle}</div></li>`; 
                    }).join('') || '<li style="font-size:0.875rem;color:var(--text-muted)">No hearings on record.</li>'}
                </ul>
            </div>`;
        createSlidePanel(`Judge Profile: ${j.judge_id || id}`, html);
    };

    renderTable();
}

