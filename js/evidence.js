async function initEvidence() {
    console.log("Evidence V4.3 Initializing with API...");
    
    let evidence = [];
    let cases = [];
    let lawyers = [];

    const caseFilter = document.getElementById('evidence-case-filter');
    const grid = document.getElementById('evidence-grid');
    const stats = document.getElementById('evidence-stats');

    const loadData = async () => {
        try {
            const [evRes, casesRes, lawyersRes] = await Promise.all([
                apiFetch('/evidence'),
                apiFetch('/cases'),
                apiFetch('/lawyers')
            ]);
            evidence = evRes.data || [];
            cases = casesRes.data || [];
            lawyers = lawyersRes.data || [];

            // Populate Case Filter
            caseFilter.innerHTML = '<option value="">-- Select a Case --</option>';
            cases.forEach(c => { 
                caseFilter.innerHTML += `<option value="${c._id}">${c.case_id} - ${c.title}</option>`; 
            });

            renderTable();
        } catch (err) {
            console.error("Failed to load evidence data", err);
        }
    };

    const getTypeStyle = (type) => {
        const map = {
            'Document':  { icon: 'description',    color: '#ffffff', glow: 'rgba(255,255,255,0.12)' },
            'Physical':  { icon: 'gavel',           color: '#cccccc', glow: 'rgba(255,255,255,0.08)' },
            'Digital':   { icon: 'computer',        color: '#999999', glow: 'rgba(255,255,255,0.05)' },
            'Testimony': { icon: 'record_voice_over',color: '#666666', glow: 'rgba(255,255,255,0.03)' }
        };
        return map[type] || { icon: 'search', color: '#94a3b8', glow: 'rgba(148,163,184,0.2)' };
    };

    const renderTable = () => {
        const selectedCaseId = caseFilter.value;
        grid.innerHTML = '';

        if (!selectedCaseId) {
            stats.textContent = 'Select a case to view its evidence.';
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">${getEmptyStateHTML('Select a case from the dropdown above')}</div>`;
            return;
        }

        const caseEvidence = evidence.filter(e => {
            const eCaseId = e.case_id?._id || e.case_id;
            return eCaseId === selectedCaseId;
        }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        const caseObj = cases.find(c => c._id === selectedCaseId);
        stats.innerHTML = `<span style="color:#ffffff;font-weight:700;">${caseEvidence.length}</span> piece${caseEvidence.length !== 1 ? 's' : ''} of evidence for <span style="color:#e2e8f0;">${caseObj ? caseObj.case_id : selectedCaseId}</span>`;

        if (caseEvidence.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">${getEmptyStateHTML('No evidence submitted for this case yet')}</div>`;
            return;
        }

        caseEvidence.forEach(e => {
            const { icon, color, glow } = getTypeStyle(e.type);

            const card = document.createElement('div');
            card.className = 'evidence-card';
            card.innerHTML = `
                <div class="evidence-card-inner" style="background: var(--bg-card); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 0 0 1px ${glow}; display: flex; flex-direction: column; gap: 14px; transition: all 0.3s ease; height: 100%;">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <span class="material-icons-outlined" style="font-size:22px;color:${color};">${icon}</span>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.72rem;color:var(--text-muted);font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:3px;">${e.evidence_id}</div>
                            <div style="background:${glow};color:${color};display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.72rem;font-weight:600;border: 1px solid rgba(255,255,255,0.1);">${e.type}</div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.02);border-radius:10px;padding:12px;border:1px solid var(--border-subtle);flex-grow:1;">
                        <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Description</div>
                        <div style="font-size:0.9rem;color:var(--text-primary);line-height:1.5;">${e.description}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top: 1px solid var(--border-subtle);">
                        <div>
                            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Submitted By</div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);font-weight:500;">${e.submitted_by}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${formatDate(e.createdAt)}</div>
                        </div>
                        <button onclick="deleteEvidence('${e._id}')" style="background:rgba(255,255,255,0.03);border: 1px solid var(--border-subtle); color:#fff;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;flex-shrink:0;" onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='var(--border-strong)'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='var(--border-subtle)'" title="Delete Evidence">
                            <span class="material-icons-outlined" style="font-size:18px;">delete</span>
                        </button>
                    </div>
                </div>
            `;

            const inner = card.querySelector('.evidence-card-inner');
            card.addEventListener('mouseenter', () => { 
                inner.style.transform = 'translateY(-4px)'; 
                inner.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.15)`; 
                inner.style.background = 'rgba(255,255,255,0.05)'; 
            });
            card.addEventListener('mouseleave', () => { 
                inner.style.transform = 'translateY(0)'; 
                inner.style.boxShadow = `0 4px 20px rgba(0,0,0,0.2), inset 0 0 0 1px ${glow}`; 
                inner.style.background = 'var(--bg-card)'; 
            });
            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.from('#evidence-grid .evidence-card', { opacity: 0, scale: 0.9, y: 20, duration: 0.5, stagger: 0.06, ease: "back.out(1.2)" });
        }
    };

    caseFilter.addEventListener('change', renderTable);

    document.getElementById('btn-submit-evidence').addEventListener('click', () => {
        const selectedCaseId = caseFilter.value;
        const caseOptions = cases.map(c => `<option value="${c._id}" ${c._id===selectedCaseId?'selected':''}>${c.case_id} - ${c.title}</option>`).join('');
        
        createModal({
            title: 'Submit New Evidence',
            content: `<form id="evidence-form">
                <div class="form-group"><label class="form-label">Link to Case</label><select class="form-control" id="new-e-case" required><option value="">Select Case...</option>${caseOptions}</select></div>
                <div class="form-group"><label class="form-label">Evidence Type</label><select class="form-control" id="new-e-type" required><option value="Document">Document</option><option value="Physical">Physical Item</option><option value="Digital">Digital Media</option><option value="Testimony">Witness Testimony</option></select></div>
                <div class="form-group"><label class="form-label">Description / Identifier</label><input type="text" class="form-control" id="new-e-desc" required placeholder="e.g. DNA Sample, CCTV Footage"></div>
                <div class="form-group"><label class="form-label">Submitted By</label><input type="text" class="form-control" id="new-e-by" required placeholder="Name of submitter or lawyer"></div>
                <div class="form-group"><label class="form-label">Status</label><select class="form-control" id="new-e-status" required><option value="Submitted" selected>Submitted</option><option value="Verified">Verified</option><option value="Rejected">Rejected</option></select></div>
            </form>`,
            saveText: 'Submit Evidence',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#evidence-form');
                if(!validateForm(form)) return false;

                const payload = {
                    evidence_id: 'EVD-' + Math.floor(Math.random()*10000),
                    case_id: document.getElementById('new-e-case').value,
                    type: document.getElementById('new-e-type').value,
                    description: document.getElementById('new-e-desc').value,
                    submitted_by: document.getElementById('new-e-by').value,
                    status: document.getElementById('new-e-status').value
                };

                try {
                    await apiFetch('/evidence', 'POST', payload);
                    showToast('Evidence logged successfully.');
                    await loadData();
                    caseFilter.value = payload.case_id;
                    renderTable();
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    });

    window.deleteEvidence = (id) => {
        confirmDialog(`Remove this evidence record?`, async () => {
            try {
                await apiFetch(`/evidence/${id}`, 'DELETE');
                showToast('Evidence deleted.');
                await loadData();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    };

    await loadData();
}

