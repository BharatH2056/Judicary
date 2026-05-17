async function initVerdicts() {
    let verdicts = [];
    let cases = [];

    const loadData = async () => {
        try {
            const [verdictsData, casesData] = await Promise.all([
                apiFetch('/verdicts'),
                apiFetch('/cases')
            ]);
            verdicts = verdictsData.data || [];
            cases = casesData.data || [];
        } catch (err) {
            console.error('Failed to load verdicts data:', err);
        }
    };

    const renderTable = async (fetchData = true) => {
        const grid = document.querySelector('#verdicts-grid');
        
        if (fetchData) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><div class="spinner"></div></div>';
            await loadData();
        }
        grid.innerHTML = '';
        
        const searchInput = document.getElementById('verdict-search');
        const decisionFilter = document.getElementById('filter-decision');
        
        let filteredVerdicts = verdicts;
        if (searchInput && decisionFilter) {
            const searchTerm = searchInput.value.toLowerCase();
            const decision = decisionFilter.value;
            
            filteredVerdicts = verdicts.filter(v => {
                const caseObj = typeof v.case_id === 'object' && v.case_id !== null ? v.case_id : cases.find(c => c._id === v.case_id);
                const titleMatch = caseObj ? caseObj.title.toLowerCase().includes(searchTerm) : false;
                const penaltyMatch = v.penalty ? v.penalty.toLowerCase().includes(searchTerm) : false;
                const matchesSearch = titleMatch || penaltyMatch;
                const matchesDecision = !decision || v.decision === decision;
                return matchesSearch && matchesDecision;
            });
            
            document.getElementById('verdict-count').textContent = `Showing ${filteredVerdicts.length} verdict${filteredVerdicts.length !== 1 ? 's' : ''}`;
        }
        
        if(filteredVerdicts.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #94a3b8;">${getEmptyStateHTML('No verdicts found')}</div>`;
            return;
        }
        
        filteredVerdicts.forEach(v => {
            const caseObj = typeof v.case_id === 'object' && v.case_id !== null ? v.case_id : cases.find(c => c._id === v.case_id);
            
            let decisionColor = '#ffffff'; 
            let decisionGlow = 'rgba(255, 255, 255, 0.1)';
            
            if(v.decision === 'Guilty') {
                decisionColor = '#ffffff'; 
                decisionGlow = 'rgba(255, 255, 255, 0.15)';
            }
            if(v.decision === 'Not Guilty' || v.decision === 'Acquitted') {
                decisionColor = '#cbd5e1'; 
                decisionGlow = 'rgba(203, 213, 225, 0.1)';
            }
            if(v.decision === 'Dismissed') {
                 decisionColor = '#94a3b8'; 
                 decisionGlow = 'rgba(148, 163, 184, 0.1)';
            }

            const caseTitle = caseObj ? caseObj.title : 'Unknown Case';
            const caseDisplayId = caseObj ? caseObj.case_id : 'N/A';
            
            const card = document.createElement('div');
            card.className = 'verdict-card';
            card.innerHTML = `
                <div class="verdict-card-inner" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px ${decisionGlow}; display: flex; flex-direction: column; gap: 16px; transition: all 0.3s ease; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 0.75rem; color: #ffffff; margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Verdict ${v.verdict_id}</div>
                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: #fff; margin: 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${caseTitle}</h3>
                            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px; display: flex; align-items: center; gap: 6px;">
                                <span class="material-icons-outlined" style="font-size: 14px;">folder</span> Case: ${caseDisplayId}
                            </div>
                        </div>
                        <div style="background: ${decisionGlow}; color: ${decisionColor}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid ${decisionColor}40; white-space: nowrap; box-shadow: 0 0 10px ${decisionGlow};">
                            ${v.decision}
                        </div>
                    </div>
                    
                    <div style="flex-grow: 1; background: rgba(0,0,0,0.35); border-radius: 8px; padding: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Penalty / Details</div>
                        <div style="font-size: 0.9rem; color: #e2e8f0; line-height: 1.5;">${v.penalty || 'No details provided.'}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 0.85rem; font-weight: 500;">
                            <span class="material-icons-outlined" style="font-size: 16px; color: #ffffff;">calendar_today</span>
                            ${formatDate(v.verdict_date)}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="editVerdict('${v._id}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(167,139,250,0.2)'; this.style.borderColor='#a78bfa'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="Edit">
                                <span class="material-icons-outlined" style="font-size: 18px;">edit</span>
                            </button>
                            <button onclick="deleteVerdict('${v._id}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.2)'; this.style.borderColor='#ef4444'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="Delete">
                                <span class="material-icons-outlined" style="font-size: 18px;">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const innerDiv = card.querySelector('.verdict-card-inner');
            card.addEventListener('mouseenter', () => {
                innerDiv.style.transform = 'translateY(-4px)';
                innerDiv.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), inset 0 0 0 1px ${decisionColor}`;
                innerDiv.style.background = 'rgba(13, 17, 55, 0.8)';
            });
            card.addEventListener('mouseleave', () => {
                innerDiv.style.transform = 'translateY(0)';
                innerDiv.style.boxShadow = `0 4px 20px rgba(0,0,0,0.2), inset 0 0 0 1px ${decisionGlow}`;
                innerDiv.style.background = 'rgba(13, 17, 55, 0.6)';
            });
            
            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from('#verdicts-grid .verdict-card', {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.2)"
            });
        }
    };
    
    // Add event listeners for search and filter
    const searchInput = document.getElementById('verdict-search');
    const decisionFilter = document.getElementById('filter-decision');
    if (searchInput) searchInput.addEventListener('input', () => {
        const grid = document.querySelector('#verdicts-grid');
        grid.innerHTML = '';
        renderTable(false); // Assume a minor refactor where loadData happens outside or conditionally
    });
    if (decisionFilter) decisionFilter.addEventListener('change', () => {
        const grid = document.querySelector('#verdicts-grid');
        grid.innerHTML = '';
        renderTable(false);
    });

    document.getElementById('btn-add-verdict').addEventListener('click', () => {
        const casesWithoutVerdict = cases.filter(c => !verdicts.some(v => {
            const vCaseId = typeof v.case_id === 'object' && v.case_id !== null ? v.case_id._id : v.case_id;
            return vCaseId === c._id;
        }));
        
        if(casesWithoutVerdict.length === 0) {
            showToast('All cases currently have verdicts recorded.', 'info');
            return;
        }

        const caseOptions = casesWithoutVerdict.map(c => `<option value="${c._id}">${c.case_id} - ${c.title}</option>`).join('');
        
        createModal({
            title: 'Record New Verdict',
            content: `
                <form id="verdict-form">
                    <div class="form-group">
                        <label class="form-label">Select Case</label>
                        <select class="form-control" id="new-v-case" required>
                            <option value="">Select Case...</option>
                            ${caseOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Decision</label>
                        <select class="form-control" id="new-v-decision" required>
                            <option value="Guilty">Guilty</option>
                            <option value="Not Guilty">Not Guilty</option>
                            <option value="Acquitted">Acquitted</option>
                            <option value="Dismissed">Dismissed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Penalty / Details</label>
                        <input type="text" class="form-control" id="new-v-penalty" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Verdict Date</label>
                        <input type="date" class="form-control" id="new-v-date" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </form>
            `,
            saveText: 'Save Verdict',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#verdict-form');
                if(!validateForm(form)) return false;
                
                const newV = {
                    case_id: document.getElementById('new-v-case').value,
                    decision: document.getElementById('new-v-decision').value,
                    penalty: document.getElementById('new-v-penalty').value,
                    verdict_date: document.getElementById('new-v-date').value
                };
                
                try {
                    await apiFetch('/verdicts', 'POST', newV);
                    renderTable();
                    showToast('Verdict recorded successfully.');
                    return true;
                } catch (err) {
                    return false;
                }
            }
        });
    });

    window.deleteVerdict = (id) => {
        confirmDialog(`Delete this verdict?`, async () => {
            try {
                await apiFetch(`/verdicts/${id}`, 'DELETE');
                renderTable();
                showToast('Verdict deleted.');
            } catch (err) {}
        });
    };
    
    window.editVerdict = async (id) => {
        try {
            const res = await apiFetch(`/verdicts/${id}`);
            const v = res.data;
            createModal({
                title: 'Edit Verdict',
                content: `
                    <form id="edit-verdict-form">
                        <div class="form-group">
                            <label class="form-label">Decision</label>
                            <select class="form-control" id="edit-v-decision" required>
                                <option value="Guilty" ${v.decision === 'Guilty' ? 'selected' : ''}>Guilty</option>
                                <option value="Not Guilty" ${v.decision === 'Not Guilty' ? 'selected' : ''}>Not Guilty</option>
                                <option value="Acquitted" ${v.decision === 'Acquitted' ? 'selected' : ''}>Acquitted</option>
                                <option value="Dismissed" ${v.decision === 'Dismissed' ? 'selected' : ''}>Dismissed</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Penalty / Details</label>
                            <input type="text" class="form-control" id="edit-v-penalty" value="${v.penalty || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Verdict Date</label>
                            <input type="date" class="form-control" id="edit-v-date" required value="${v.verdict_date.split('T')[0]}">
                        </div>
                    </form>
                `,
                saveText: 'Save Changes',
                onSave: async (overlay) => {
                    const form = overlay.querySelector('#edit-verdict-form');
                    if(!validateForm(form)) return false;
                    
                    const updatedV = {
                        decision: document.getElementById('edit-v-decision').value,
                        penalty: document.getElementById('edit-v-penalty').value,
                        verdict_date: document.getElementById('edit-v-date').value
                    };
                    
                    try {
                        await apiFetch(`/verdicts/${id}`, 'PUT', updatedV);
                        renderTable();
                        showToast('Verdict updated successfully.');
                        return true;
                    } catch (err) {
                        return false;
                    }
                }
            });
        } catch (err) {}
    };

    renderTable();
}

