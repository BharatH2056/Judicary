async function initParties() {
    let parties = [];
    let cases = [];
    
    const loadData = async () => {
        try {
            const [partiesRes, casesRes] = await Promise.all([
                apiFetch('/parties'),
                apiFetch('/cases')
            ]);
            parties = partiesRes.data || [];
            cases = casesRes.data || [];
        } catch (err) {
            console.error('Failed to load parties data:', err);
        }
    };

    const renderTable = async () => {
        const grid = document.querySelector('#parties-grid');
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><div class="spinner"></div></div>';
        
        await loadData();
        grid.innerHTML = '';
        
        if (parties.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #94a3b8;">${getEmptyStateHTML('No parties found')}</div>`;
            return;
        }
        
        parties.forEach(p => {
            // casesCount logic might need a backend aggregate or separate fetch
            // For now, let's assume the backend provides it or we just show 'View Profile'
            const casesCount = p.case_count || 0; 
            
            const card = document.createElement('div');
            card.className = 'party-card clickable';
            
            let roleColor = '#ffffff'; 
            let roleGlow = 'rgba(255, 255, 255, 0.06)';
            
            if(p.role === 'Defendant') { roleColor = '#cccccc'; roleGlow = 'rgba(255, 255, 255, 0.04)'; }
            if(p.role === 'Plaintiff') { roleColor = '#ffffff'; roleGlow = 'rgba(255, 255, 255, 0.08)'; }
            if(p.role === 'Witness') { roleColor = '#999999'; roleGlow = 'rgba(255, 255, 255, 0.03)'; }
            
            card.innerHTML = `
                <div class="party-card-inner" style="background: var(--bg-card); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 16px; transition: all 0.3s ease; height: 100%; cursor: pointer; position: relative;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-right: 70px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">ID: ${p.party_id}</div>
                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: #fff; margin: 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h3>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.05); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border-medium); display: inline-block; align-self: flex-start; margin-top: -8px;">
                        ${p.role}
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #cbd5e1; margin-top: 4px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="material-icons-outlined" style="font-size: 16px; color: #94a3b8;">contact_phone</span>
                            ${p.contact || 'No contact info'}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
                            <span class="material-icons-outlined" style="font-size: 16px; color: var(--text-muted);">assignment</span>
                            Click to view full profile
                        </div>
                    </div>
                    
                    <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                        <button class="btn-action" onclick="event.stopPropagation(); editParty('${p._id}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="Edit">
                            <span class="material-icons-outlined" style="font-size: 16px;">edit</span>
                        </button>
                        <button class="btn-action" onclick="event.stopPropagation(); deleteParty('${p._id}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.borderColor='rgba(255,255,255,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="Delete">
                            <span class="material-icons-outlined" style="font-size: 16px;">delete</span>
                        </button>
                    </div>
                </div>
            `;
            
            const innerDiv = card.querySelector('.party-card-inner');
            card.addEventListener('mouseenter', () => {
                innerDiv.style.transform = 'translateY(-4px)';
                innerDiv.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.15)`;
                innerDiv.style.background = 'rgba(255, 255, 255, 0.05)';
            });
            card.addEventListener('mouseleave', () => {
                innerDiv.style.transform = 'translateY(0)';
                innerDiv.style.boxShadow = `0 4px 20px rgba(0,0,0,0.2)`;
                innerDiv.style.background = 'var(--bg-card)';
            });
            
            card.onclick = () => viewParty(p._id);
            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from('#parties-grid .party-card', {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.2)"
            });
        }
    };

    document.getElementById('btn-add-party').addEventListener('click', () => {
        createModal({
            title: 'Add New Party',
            content: `
                <form id="party-form">
                    <div class="form-group">
                        <label class="form-label">Full Name / Organization</label>
                        <input type="text" class="form-control" id="new-p-name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <select class="form-control" id="new-p-role" required>
                            <option value="Plaintiff">Plaintiff</option>
                            <option value="Defendant">Defendant</option>
                            <option value="Witness">Witness</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contact (Email/Phone)</label>
                        <input type="text" class="form-control" id="new-p-contact" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address</label>
                        <textarea class="form-control" id="new-p-address"></textarea>
                    </div>
                </form>
            `,
            saveText: 'Add Party',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#party-form');
                if(!validateForm(form)) return false;
                
                const newP = {
                    name: document.getElementById('new-p-name').value,
                    role: document.getElementById('new-p-role').value,
                    contact: document.getElementById('new-p-contact').value,
                    address: document.getElementById('new-p-address').value
                };
                
                try {
                    await apiFetch('/parties', 'POST', newP);
                    renderTable();
                    showToast('Party added successfully.');
                    return true;
                } catch (err) {
                    return false;
                }
            }
        });
    });

    document.getElementById('btn-assign-party').addEventListener('click', async () => {
        const partyOptions = parties.map(p => `<option value="${p._id}">${p.name} (${p.role})</option>`).join('');
        const caseOptions = cases.map(c => `<option value="${c._id}">${c.case_id} - ${c.title}</option>`).join('');
        
        createModal({
            title: 'Assign Party to Case',
            content: `
                <form id="assign-form">
                    <div class="form-group">
                        <label class="form-label">Select Party</label>
                        <select class="form-control" id="assign-p-id" required>
                            <option value="">Choose party...</option>
                            ${partyOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Select Case</label>
                        <select class="form-control" id="assign-c-id" required>
                            <option value="">Choose case...</option>
                            ${caseOptions}
                        </select>
                    </div>
                </form>
            `,
            saveText: 'Link Records',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#assign-form');
                if(!validateForm(form)) return false;
                
                const pId = document.getElementById('assign-p-id').value;
                const cId = document.getElementById('assign-c-id').value;
                
                try {
                    await apiFetch('/case-parties', 'POST', { case_id: cId, party_id: pId });
                    showToast('Party successfully assigned to case.');
                    return true;
                } catch (err) {
                    return false;
                }
            }
        });
    });

    window.deleteParty = (id) => {
        confirmDialog(`Delete this party?`, async () => {
            try {
                await apiFetch(`/parties/${id}`, 'DELETE');
                renderTable();
                showToast('Party deleted.');
            } catch (err) {
                // apiFetch handles toast
            }
        });
    };
    
    window.editParty = async (id) => { 
        try {
            const res = await apiFetch(`/parties/${id}`);
            const p = res.data;
            createModal({
                title: 'Edit Party',
                content: `
                    <form id="edit-party-form">
                        <div class="form-group">
                            <label class="form-label">Full Name / Organization</label>
                            <input type="text" class="form-control" id="edit-p-name" value="${p.name}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <select class="form-control" id="edit-p-role" required>
                                <option value="Plaintiff" ${p.role === 'Plaintiff' ? 'selected' : ''}>Plaintiff</option>
                                <option value="Defendant" ${p.role === 'Defendant' ? 'selected' : ''}>Defendant</option>
                                <option value="Witness" ${p.role === 'Witness' ? 'selected' : ''}>Witness</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact (Email/Phone)</label>
                            <input type="text" class="form-control" id="edit-p-contact" value="${p.contact}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <textarea class="form-control" id="edit-p-address">${p.address || ''}</textarea>
                        </div>
                    </form>
                `,
                saveText: 'Update Party',
                onSave: async (overlay) => {
                    const form = overlay.querySelector('#edit-party-form');
                    if(!validateForm(form)) return false;
                    
                    const updatedP = {
                        name: document.getElementById('edit-p-name').value,
                        role: document.getElementById('edit-p-role').value,
                        contact: document.getElementById('edit-p-contact').value,
                        address: document.getElementById('edit-p-address').value
                    };
                    
                    try {
                        await apiFetch(`/parties/${id}`, 'PUT', updatedP);
                        renderTable();
                        showToast('Party updated successfully.');
                        return true;
                    } catch (err) {
                        return false;
                    }
                }
            });
        } catch (err) {}
    };
    
    window.viewParty = async (id) => {
        try {
            const res = await apiFetch(`/parties/${id}`);
            const p = res.data;
            const casesRes = await apiFetch(`/parties/${id}/cases`);
            p.cases = casesRes.data.map(cp => cp.case_id).filter(c => c);
            
            const html = `
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">${p.name}</h3>
                    <div>${renderBadge(p.role)}</div>
                </div>
                
                <div class="detail-section">
                    <h4>Contact Info</h4>
                    <div class="detail-row"><span class="detail-label">Email/Phone:</span> <span class="detail-value">${p.contact}</span></div>
                    <div class="detail-row"><span class="detail-label">Address:</span> <span class="detail-value">${p.address || 'N/A'}</span></div>
                </div>
                
                <div class="detail-section">
                    <h4>Involved Cases (${p.cases ? p.cases.length : 0})</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${p.cases ? p.cases.map(c => `
                            <li style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <strong style="color: #fff">${c.title}</strong>
                                    ${renderBadge(c.status)}
                                </div>
                                <div style="font-size: 0.875rem; color: #94a3b8;">ID: ${c.case_id} | Filed: ${formatDate(c.filedDate)}</div>
                            </li>
                        `).join('') : '<li style="font-size:0.875rem; color:#64748b">Not involved in any cases currently.</li>'}
                    </ul>
                </div>
            `;
            
            createSlidePanel(`Party Profile: ${p.party_id}`, html);
        } catch (err) {}
    };

    renderTable();
}

