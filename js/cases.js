async function initCases() {
    console.log("Cases V4.3 Initializing with API...");
    
    let cases = [];

    const fetchCases = async () => {
        const res = await apiFetch('/cases?limit=1000');
        cases = res.data || [];
        renderTable();
    };

    const renderTable = () => {
        const container = document.getElementById('cases-container');
        
        let filtered = cases; // Data is already filtered by the backend
        
        document.getElementById('case-count').textContent = `Showing ${filtered.length} cases`;
        
        container.innerHTML = '';
        
        if(filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">${getEmptyStateHTML('No cases found matching criteria')}</div>`;
            return;
        }
        
        // Sort cases by case_id number ascending (C-1001, C-1002, C-1003...)
        filtered.sort((a, b) => {
            const numA = parseInt(a.case_id.replace('C-', ''))
            const numB = parseInt(b.case_id.replace('C-', ''))
            return numA - numB
        })
        
        filtered.forEach(c => {
            const statusLower = c.status.toLowerCase();
            const statusClass = `badge-${statusLower}`;
            const statusColorVar = `var(--status-${statusLower})`;
            const statusBgVar = `var(--status-${statusLower}-bg)`;

            const card = document.createElement('div');
            card.className = 'case-card';
            card.innerHTML = `
                <div class="case-card-inner">
                    <div class="case-card-top">
                        <div style="flex: 1; min-width: 0;">
                            <div class="case-id">${c.case_id}</div>
                            <h3 class="case-card-title">${c.title}</h3>
                            <div class="case-card-info">
                                <span class="material-icons-outlined" style="font-size: 14px; color: var(--text-muted);">category</span> 
                                Type: <span style="color: var(--text-primary);">${c.type}</span>
                            </div>
                        </div>
                        <div class="badge ${statusClass}" style="padding: 6px 12px; border-radius: 8px;">
                            ${c.status}
                        </div>
                    </div>
                    
                    <div class="case-card-footer">
                        <div class="case-card-date">
                            <span class="material-icons-outlined" style="font-size: 14px; color: var(--text-muted);">calendar_today</span>
                            ${formatDate(c.filing_date)}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="event.stopPropagation(); editCase('${c._id}')" class="action-btn" title="Edit">
                                <span class="material-icons-outlined" style="font-size: 16px;">edit</span>
                            </button>
                            <button onclick="event.stopPropagation(); deleteCase('${c._id}')" class="action-btn" title="Delete">
                                <span class="material-icons-outlined" style="font-size: 16px;">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            card.onclick = () => viewCase(c._id);
            container.appendChild(card);
        });

        // GSAP Animation
        if (typeof gsap !== 'undefined') {
            gsap.from('#cases-container .case-card', {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.2)"
            });
        }
    };

    // Initial load
    try {
        await fetchCases();
    } catch (err) {
        console.error("Failed to fetch cases:", err);
    }
    
    // A simple debounce implementation
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async function loadCases() {
        let query = new URLSearchParams();

        const searchValue = document.getElementById('case-search').value.trim();
        const filterType  = document.getElementById('filter-type').value;
        const filterStatus = document.getElementById('filter-status').value;

        if (searchValue) query.append('search', searchValue);
        if (filterType   && filterType  !== 'all') query.append('type',   filterType);
        if (filterStatus && filterStatus !== 'all') query.append('status', filterStatus);
        query.append('limit', '100');

        const res = await apiFetch(`/cases?${query.toString()}`);
        cases = res.data || [];
        renderTable();
    }

    // Filter listeners
    const searchInput = document.getElementById('case-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (e) => {
            await loadCases();
        }, 400));
    }
    
    document.getElementById('filter-type').addEventListener('change', loadCases);
    document.getElementById('filter-status').addEventListener('change', loadCases);
    
    // New Case
    document.getElementById('btn-new-case').addEventListener('click', () => {
        createModal({
            title: 'Create New Case',
            content: `
                <form id="case-form">
                    <div class="form-group">
                        <label class="form-label">Case Title</label>
                        <input type="text" class="form-control" id="new-case-title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Case Type</label>
                        <select class="form-control" id="new-case-type" required>
                            <option value="">Select Type...</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Civil">Civil</option>
                            <option value="Family">Family</option>
                            <option value="Corporate">Corporate</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Filing Date</label>
                        <input type="date" class="form-control" id="new-case-date" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-control" id="new-case-status" required>
                            <option value="Open">Open</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" id="new-case-notes"></textarea>
                    </div>
                </form>
            `,
            saveText: 'Create Case',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#case-form');
                if(!validateForm(form)) return false;
                
                const newCaseData = {
                    title: document.getElementById('new-case-title').value,
                    type: document.getElementById('new-case-type').value,
                    filing_date: document.getElementById('new-case-date').value,
                    status: document.getElementById('new-case-status').value,
                    notes: document.getElementById('new-case-notes').value
                };
                
                try {
                    const res = await apiFetch('/cases', 'POST', newCaseData);
                    showToast(`Case ${res.data.case_id} created successfully!`);
                    await fetchCases();
                    return true;
                } catch (err) {
                    return false;
                }
            }
        });
    });

    // Make functions global for inline event handlers
    window.editCase = async (id) => {
        try {
            const res = await apiFetch(`/cases/${id}`);
            const c = res.data;
            
            createModal({
                title: `Edit Case ${c.case_id}`,
                content: `
                    <form id="edit-case-form">
                        <div class="form-group">
                            <label class="form-label">Case Title</label>
                            <input type="text" class="form-control" id="edit-case-title" required value="${c.title}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-control" id="edit-case-status" required>
                                <option value="Open" ${c.status === 'Open' ? 'selected' : ''}>Open</option>
                                <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Hearing" ${c.status === 'Hearing' ? 'selected' : ''}>Hearing</option>
                                <option value="Closed" ${c.status === 'Closed' ? 'selected' : ''}>Closed</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-control" id="edit-case-notes">${c.notes || ''}</textarea>
                        </div>
                    </form>
                `,
                saveText: 'Update Case',
                onSave: async (overlay) => {
                    const form = overlay.querySelector('#edit-case-form');
                    if(!validateForm(form)) return false;
                    
                    const updateData = {
                        title: document.getElementById('edit-case-title').value,
                        status: document.getElementById('edit-case-status').value,
                        notes: document.getElementById('edit-case-notes').value
                    };
                    
                    try {
                        await apiFetch(`/cases/${id}`, 'PUT', updateData);
                        showToast(`Case updated.`);
                        await fetchCases();
                        
                        // If slide panel is open for this case, update it
                        const panelTitle = document.querySelector('.slide-panel-header h3');
                        if(panelTitle && panelTitle.textContent.includes(c.case_id)) {
                            viewCase(id);
                        }
                        return true;
                    } catch (err) {
                        return false;
                    }
                }
            });
        } catch (err) {
            console.error(err);
        }
    };

    window.deleteCase = async (id) => {
        try {
            const res = await apiFetch(`/cases/${id}`);
            const c = res.data;
            
            showConfirm(`Are you sure you want to delete Case <b>${c.title}</b> (${c.case_id})?`, async () => {
                try {
                    playGavelSound();
                    await apiFetch(`/cases/${id}`, 'DELETE');
                    showToast(`Case deleted.`);
                    await fetchCases();
                    
                    const panelTitle = document.querySelector('.slide-panel-header h3');
                    if(panelTitle && panelTitle.textContent.includes(c.case_id)) {
                        document.querySelector('.slide-panel .modal-close').click();
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        } catch (err) {
            console.error(err);
        }
    };

    window.viewCase = async (id) => {
        try {
            showLoader();
            const res = await apiFetch(`/cases/${id}/full`);
            hideLoader();
            const data = res.data;
            const c = data.case;
            
            const html = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="display: flex; gap: 8px;">${renderBadge(c.type)} ${renderBadge(c.status)}</div>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <span class="material-icons-outlined" style="font-size: 16px;">print</span> Print
                    </button>
                </div>
                
                <div class="detail-section" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <h4 style="margin-top: 0; margin-bottom: 16px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted);">Case Profile</h4>
                    <div class="detail-row" style="margin-bottom: 12px;"><span class="detail-label" style="color: var(--text-secondary); font-size: 0.8rem;">Title</span> <div class="detail-value" style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem; margin-top: 4px;">${c.title}</div></div>
                    <div class="detail-row" style="margin-bottom: 16px;"><span class="detail-label" style="color: var(--text-secondary); font-size: 0.8rem;">Filed On</span> <div class="detail-value" style="color: var(--text-primary); margin-top: 4px;">${formatDate(c.filing_date)} <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 8px;">(${timeAgo(c.filing_date)})</span></div></div>
                    <div style="margin-top: 16px;">
                        <span class="detail-label" style="color: var(--text-secondary); font-size: 0.8rem;">Internal Notes</span> 
                        <div style="margin-top: 8px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                            ${c.notes || 'No confidential notes provided for this case record.'}
                        </div>
                    </div>
                </div>
                
                <div class="detail-section" style="margin-bottom: 24px;">
                    <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 12px;">Final Verdict</h4>
                    ${data.verdict 
                        ? `<div style="padding: 16px; border: 1px solid var(--border-medium); border-radius: 12px; background: rgba(255,255,255,0.04);">
                             <div style="font-weight:700; color: var(--text-primary); margin-bottom:8px; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                                <span class="material-icons-outlined" style="font-size: 20px;">gavel</span>
                                ${data.verdict.decision}
                             </div>
                             <div style="font-size:0.85rem; color: var(--text-secondary);">Penalty: <span style="color: var(--text-primary);">${data.verdict.penalty || 'No penalty assigned'}</span></div>
                             <div style="font-size:0.75rem; color:var(--text-muted); margin-top:12px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">Dated: ${formatDate(data.verdict.verdict_date)}</div>
                           </div>`
                        : `<div style="padding: 20px; border: 1px dashed var(--border-medium); border-radius: 12px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                             Verdict pending scheduled hearings and evidence review.
                           </div>`
                    }
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="detail-section">
                        <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 12px;">Involved Parties</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${data.parties.map(pLink => {
                                const p = pLink.party_id;
                                return p ? `
                                    <div style="padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${p.name}</span>
                                        <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">${pLink.role || 'Party'}</span>
                                    </div>
                                ` : '';
                            }).join('') || '<div style="font-size:0.8rem; color:var(--text-muted)">None assigned.</div>'}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 12px;">Counsel</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${data.lawyers.map(lLink => {
                                const l = lLink.lawyer_id;
                                return l ? `
                                    <div style="padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px;">
                                        <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${l.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${l.specialization}</div>
                                    </div>
                                ` : '';
                            }).join('') || '<div style="font-size:0.8rem; color:var(--text-muted)">None assigned.</div>'}
                        </div>
                    </div>
                </div>

                <div class="detail-section" style="margin-top: 24px;">
                    <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 12px;">Timeline & Evidence</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${data.hearings.map(h => `
                            <div style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid var(--text-primary); border-radius: 0 8px 8px 0; font-size: 0.85rem;">
                                <div style="font-weight: 600; color: var(--text-primary);">Hearing: ${formatDate(h.date)} at ${h.time}</div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 4px;">Location: ${h.courtroom_id ? `Room ${h.courtroom_id.room_no}` : 'To be assigned'}</div>
                            </div>
                        `).join('')}
                        
                        ${data.evidence.map(e => `
                            <div style="padding: 12px; background: rgba(255,255,255,0.01); border: 1px dashed var(--border-subtle); border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
                                <span class="material-icons-outlined" style="font-size: 18px; color: var(--text-muted);">description</span>
                                <div style="color: var(--text-secondary);">
                                    <span style="font-weight: 600; color: var(--text-primary);">[${e.type}]</span> ${e.description}
                                </div>
                            </div>
                        `).join('')}
                        
                        ${data.hearings.length === 0 && data.evidence.length === 0 ? '<div style="font-size:0.8rem; color:var(--text-muted); text-align: center; padding: 20px;">No timeline events or evidence recorded.</div>' : ''}
                    </div>
                </div>
            `;
            
            createSlidePanel(`Case: ${c.case_id}`, html);
        } catch (err) {
            hideLoader();
            console.error(err);
        }
    };
}
