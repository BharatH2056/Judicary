async function initLawyers() {
    let lawyers = [];

    const loadData = async () => {
        try {
            const res = await apiFetch('/lawyers');
            lawyers = res.data || [];
        } catch (err) {
            console.error('Error loading lawyers:', err);
        }
    };

    const renderTable = () => {
        const grid = document.querySelector('#lawyers-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        if (lawyers.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #94a3b8;">${getEmptyStateHTML('No lawyers found')}</div>`;
            return;
        }
        
        lawyers.forEach(l => {
            // In a real system, we might fetch assigned cases count from backend
            // For now, we'll assume it's part of the lawyer object or just show 0
            const assignedCasesCount = l.assigned_cases ? l.assigned_cases.length : 0;
            
            const card = document.createElement('div');
            card.className = 'lawyer-card clickable';
            card.innerHTML = `
                <div class="lawyer-card-inner" style="background: var(--bg-card); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 16px; transition: all 0.3s ease; height: 100%; cursor: pointer; position: relative;">
                    <div style="display: flex; gap: 16px; align-items: center; margin-right: 70px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #333, #111); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: white; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                            ${l.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: #fff; margin: 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${l.name}</h3>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; font-weight: 600;">ID: ${l.lawyer_id}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #cbd5e1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="material-icons-outlined" style="font-size: 16px; color: #94a3b8;">badge</span>
                            Bar No: <strong style="color: #fff;">${l.bar_number}</strong>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="material-icons-outlined" style="font-size: 16px; color: #94a3b8;">email</span>
                            ${l.contact}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="background: rgba(255, 255, 255, 0.05); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border-medium);">
                            ${l.specialization}
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons-outlined" style="font-size: 16px; color: var(--text-muted);">folder_open</span>
                            <span style="color: #fff; font-weight: 600;">${assignedCasesCount}</span> cases
                        </div>
                    </div>
                    
                    <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
                        <button class="btn-action" onclick="event.stopPropagation(); editLawyer('${l._id}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="Edit">
                            <span class="material-icons-outlined" style="font-size: 16px;">edit</span>
                        </button>
                        <button class="btn-action" onclick="event.stopPropagation(); deleteLawyer('${l._id}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.borderColor='rgba(255,255,255,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="Delete">
                            <span class="material-icons-outlined" style="font-size: 16px;">delete</span>
                        </button>
                    </div>
                </div>
            `;
            
            const innerDiv = card.querySelector('.lawyer-card-inner');
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
            
            card.onclick = () => viewLawyer(l._id);
            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from('#lawyers-grid .lawyer-card', {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.2)"
            });
        }
    };

    await loadData();
    renderTable();

    document.getElementById('btn-add-lawyer').addEventListener('click', () => {
        createModal({
            title: 'Add New Lawyer',
            content: `
                <form id="lawyer-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="new-l-name" required>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">Bar Number</label>
                            <input type="text" class="form-control" id="new-l-bar" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Specialization</label>
                            <select class="form-control" id="new-l-spec" required>
                                <option value="Criminal">Criminal</option>
                                <option value="Civil">Civil</option>
                                <option value="Family">Family</option>
                                <option value="Corporate">Corporate</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contact Email</label>
                        <input type="email" class="form-control" id="new-l-contact" required>
                    </div>
                </form>
            `,
            saveText: 'Add Lawyer',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#lawyer-form');
                if(!validateForm(form)) return false;
                
                const newL = {
                    name: document.getElementById('new-l-name').value,
                    bar_number: document.getElementById('new-l-bar').value,
                    specialization: document.getElementById('new-l-spec').value,
                    contact: document.getElementById('new-l-contact').value
                };
                
                try {
                    await apiFetch('/lawyers', 'POST', newL);
                    await loadData();
                    renderTable();
                    showToast('Lawyer added successfully.');
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    });

    window.deleteLawyer = (id) => {
        confirmDialog(`Are you sure you want to delete this lawyer?`, async () => {
            try {
                await apiFetch(`/lawyers/${id}`, 'DELETE');
                await loadData();
                renderTable();
                showToast('Lawyer deleted.');
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    };
    
    window.editLawyer = (id) => {
        const l = lawyers.find(item => item._id === id);
        if (!l) return;
        
        createModal({
            title: 'Edit Lawyer',
            content: `
                <form id="edit-lawyer-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="edit-l-name" value="${l.name}" required>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">Bar Number</label>
                            <input type="text" class="form-control" id="edit-l-bar" value="${l.bar_number}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Specialization</label>
                            <select class="form-control" id="edit-l-spec" required>
                                <option value="Criminal" ${l.specialization === 'Criminal' ? 'selected' : ''}>Criminal</option>
                                <option value="Civil" ${l.specialization === 'Civil' ? 'selected' : ''}>Civil</option>
                                <option value="Family" ${l.specialization === 'Family' ? 'selected' : ''}>Family</option>
                                <option value="Corporate" ${l.specialization === 'Corporate' ? 'selected' : ''}>Corporate</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contact Email</label>
                        <input type="email" class="form-control" id="edit-l-contact" value="${l.contact}" required>
                    </div>
                </form>
            `,
            saveText: 'Save Changes',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#edit-lawyer-form');
                if(!validateForm(form)) return false;
                
                try {
                    await apiFetch(`/lawyers/${id}`, 'PUT', {
                        name: document.getElementById('edit-l-name').value,
                        bar_number: document.getElementById('edit-l-bar').value,
                        specialization: document.getElementById('edit-l-spec').value,
                        contact: document.getElementById('edit-l-contact').value
                    });
                    
                    await loadData();
                    renderTable();
                    showToast('Lawyer updated successfully.');
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    };
    
    window.viewLawyer = async (id) => {
        try {
            showLoader();
            const res = await apiFetch(`/lawyers/${id}`);
            const casesRes = await apiFetch(`/lawyers/${id}/cases`);
            hideLoader();
            const l = res.data;
            const cases = casesRes.data || [];
            
            let casesHtml = '';
            if (cases.length === 0) {
                casesHtml = `<p style="color: var(--text-muted); font-size: 0.875rem; font-style: italic;">No cases assigned yet.</p>`;
            } else {
                casesHtml = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${cases.map(c => {
                            const caseData = c.case_id;
                            if (!caseData) return '';
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
                                    <div>
                                        <div style="font-weight: 600;">${caseData.title || caseData.case_id || 'Unknown Case'}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted);">${caseData.status || 'Unknown'} - ${caseData.type || 'Unknown'}</div>
                                    </div>
                                    <span class="badge ${caseData.status === 'Closed' ? 'bg-danger' : 'bg-primary'}">${caseData.status || 'Unknown'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            
            const html = `
                <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center;">
                    <div class="avatar" style="width: 60px; height: 60px; font-size: 1.5rem; background: linear-gradient(135deg, #333, #111); display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: bold; border: 1px solid rgba(255,255,255,0.1);">
                        ${l.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                    </div>
                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 700;">${l.name}</h3>
                        <div style="color: var(--text-muted); font-size: 0.875rem;">Bar No: ${l.bar_number} | ${l.contact}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Specialization</h4>
                    <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; color: #fff; font-weight: 600;">
                        ${l.specialization}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Assigned Cases</h4>
                    ${casesHtml}
                </div>
            `;
            
            createSlidePanel(`Lawyer Profile: ${l.name}`, html);
        } catch (err) {
            hideLoader();
            console.error(err);
        }
    };
}
