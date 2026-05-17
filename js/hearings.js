async function initHearings() {
    let hearings = [];
    let cases = [];
    let judges = [];
    let courtrooms = [];

    const loadData = async () => {
        try {
            const [hearingsRes, casesRes, judgesRes, courtroomsRes] = await Promise.all([
                apiFetch('/hearings'),
                apiFetch('/cases'),
                apiFetch('/judges'),
                apiFetch('/courtrooms')
            ]);
            hearings = hearingsRes.data || [];
            cases = casesRes.data || [];
            judges = judgesRes.data || [];
            courtrooms = courtroomsRes.data || [];
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    await loadData();
    
    // Populate Judge filter
    const judgeFilter = document.getElementById('filter-judge');
    if (judgeFilter) {
        judgeFilter.innerHTML = '<option value="">All Judges</option>';
        judges.forEach(j => {
            judgeFilter.innerHTML += `<option value="${j._id}">${j.name}</option>`;
        });
    }

    // Convert 24hr time string to 12hr AM/PM format
    function formatTime(timeStr) {
        if (!timeStr) return 'TBD';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        const [hours, minutes] = timeStr.split(':');
        const hr = parseInt(hours);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const hr12 = hr % 12 || 12;
        return `${hr12}:${minutes} ${ampm}`;
    }

    // --- Timeline View Logic ---
    const renderTimeline = () => {
        const timeline = document.getElementById('hearings-timeline');
        if (!timeline) return;

        const searchInput = document.getElementById('hearing-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filterDate = document.getElementById('filter-date').value;
        const filterJudge = document.getElementById('filter-judge').value;
        
        let filtered = hearings.filter(h => {
            const matchesDate = !filterDate || h.date.split('T')[0] === filterDate;
            const jId = typeof h.judge_id === 'object' && h.judge_id !== null ? h.judge_id._id : h.judge_id;
            const matchesJudge = !filterJudge || jId === filterJudge;
            
            const caseObj = typeof h.case_id === 'object' && h.case_id !== null ? h.case_id : cases.find(c => c._id === h.case_id);
            const matchesSearch = !searchTerm || (caseObj && ((caseObj.title && caseObj.title.toLowerCase().includes(searchTerm)) || (caseObj.case_id && caseObj.case_id.toLowerCase().includes(searchTerm))));
            
            return matchesDate && matchesJudge && matchesSearch;
        });
        
        // Sort by date then time
        filtered.sort((a, b) => {
            if(a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return (a.time || '').localeCompare(b.time || '');
        });
        
        const countEl = document.getElementById('hearing-count');
        if (countEl) countEl.textContent = `Showing ${filtered.length} hearings`;
        
        // Keep the timeline line element
        timeline.innerHTML = `<div style="position: absolute; left: 11px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);"></div>`;
        
        if(filtered.length === 0) {
            timeline.innerHTML += `<div style="text-align: center; padding: 40px; color: var(--text-muted);">${getEmptyStateHTML('No hearings found')}</div>`;
            return;
        }
        
        filtered.forEach(h => {
            const caseObj = typeof h.case_id === 'object' && h.case_id !== null ? h.case_id : cases.find(c => c._id === h.case_id);
            const judgeObj = typeof h.judge_id === 'object' && h.judge_id !== null ? h.judge_id : judges.find(j => j._id === h.judge_id);
            const crObj = typeof h.courtroom_id === 'object' && h.courtroom_id !== null ? h.courtroom_id : courtrooms.find(cr => cr._id === h.courtroom_id);
            
            const dateOnly = h.date.split('T')[0];
            const isPast = new Date(dateOnly + 'T' + (h.time || '00:00')) < new Date();
            
            const item = document.createElement('div');
            item.className = `timeline-item ${isPast ? 'past' : ''}`;
            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-time">
                        <div class="date">${formatDate(dateOnly)}</div>
                        <div class="time">${formatTime(h.time)}</div>
                    </div>
                    <div class="timeline-details">
                        <div class="title">${caseObj ? caseObj.title : 'Unknown Case'} <span style="font-size: 12px; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: 4px; font-weight: normal; margin-left: 8px;">${h.hearing_id}</span></div>
                        <div class="meta">
                            <span><i class="ti ti-user"></i> ${judgeObj ? judgeObj.name : 'Unknown Judge'}</span>
                            <span><i class="ti ti-map-pin"></i> Room ${crObj ? crObj.room_no : 'TBD'}</span>
                        </div>
                    </div>
                    <div class="timeline-actions">
                        <button class="action-btn" onclick="editHearing('${h._id}')" title="Edit"><i class="ti ti-pencil"></i></button>
                        <button class="action-btn delete" onclick="deleteHearing('${h._id}')" title="Cancel"><i class="ti ti-trash"></i></button>
                    </div>
                </div>
            `;
            timeline.appendChild(item);
        });

        // GSAP Timeline Row Animation
        if (typeof gsap !== 'undefined') {
            gsap.from('.timeline-item', {
                opacity: 0,
                x: -30,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    };

    // --- Calendar View Logic ---
    let currentDate = new Date(); // Currently viewed month
    
    const renderCalendar = () => {
        const grid = document.getElementById('calendar-grid');
        const monthYearLabel = document.getElementById('cal-month-year');
        if (!grid || !monthYearLabel) return;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthYearLabel.textContent = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        grid.innerHTML = '';
        
        // Previous month filler days
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        for (let i = 0; i < firstDay; i++) {
            const d = daysInPrevMonth - firstDay + i + 1;
            grid.innerHTML += `<div class="cal-day other-month"><div class="cal-date">${d}</div></div>`;
        }
        
        // Current month days
        const todayStr = new Date().toISOString().split('T')[0];
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayHearings = hearings.filter(h => h.date.split('T')[0] === dateStr);
            
            const isToday = dateStr === todayStr;
            const hasHearings = dayHearings.length > 0;
            
            let html = `<div class="cal-day ${isToday ? 'today' : ''} ${hasHearings ? 'has-hearings' : ''}" ${hasHearings ? `onclick="viewDayHearings('${dateStr}')"` : ''}>
                <div class="cal-date">${i}</div>`;
                
            if (hasHearings) {
                html += `<div class="cal-badge">${dayHearings.length} Hearing${dayHearings.length > 1 ? 's' : ''}</div>`;
            }
            
            html += `</div>`;
            grid.innerHTML += html;
        }
        
        // Next month filler days
        const totalCells = firstDay + daysInMonth;
        const remainder = totalCells % 7;
        if (remainder !== 0) {
            for (let i = 1; i <= 7 - remainder; i++) {
                grid.innerHTML += `<div class="cal-day other-month"><div class="cal-date">${i}</div></div>`;
            }
        }

        // GSAP Calendar Animation removed to fix opacity bugs

    };

    window.viewDayHearings = (dateStr) => {
        const dHearings = hearings.filter(h => h.date.split('T')[0] === dateStr);
        let listHTML = `<ul style="list-style:none; padding:0; margin:0;">`;
        dHearings.forEach(h => {
            const caseObj = typeof h.case_id === 'object' ? h.case_id : cases.find(c => c._id === h.case_id);
            const judgeObj = typeof h.judge_id === 'object' ? h.judge_id : judges.find(j => j._id === h.judge_id);
            const crObj = typeof h.courtroom_id === 'object' ? h.courtroom_id : courtrooms.find(cr => cr._id === h.courtroom_id);
            
            listHTML += `
                <li style="padding: 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: 10px; backdrop-filter: blur(16px);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-weight:700; color:var(--text-primary); font-family:var(--font); font-size:1rem;">${h.time || 'TBD'} &nbsp;<span style="font-size:0.8rem; color:var(--text-secondary); font-weight:500;">Room ${crObj ? crObj.room_no : 'TBD'}</span></div>
                    </div>
                    <div style="font-size:0.9rem; margin-top:6px; color:var(--text-primary); font-weight:600;">${caseObj ? caseObj.title : 'Unknown Case'}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Judge: ${judgeObj ? judgeObj.name : 'Unknown Judge'}</div>
                </li>
            `;
        });
        listHTML += `</ul>`;
        
        createModal({
            title: `Hearings on ${formatDate(dateStr)}`,
            content: listHTML,
            saveText: 'Close',
            cancelText: ''
        });
    };

    // View Toggles
    const timelineBtn = document.getElementById('view-timeline');
    const calBtn = document.getElementById('view-calendar');
    const timelineView = document.getElementById('hearings-timeline-view');
    const calView = document.getElementById('hearings-calendar-view');
    
    if (timelineBtn && calBtn) {
        timelineBtn.addEventListener('click', () => {
            timelineBtn.style.background = 'var(--accent-light)';
            timelineBtn.style.color = 'var(--accent)';
            timelineBtn.style.borderColor = 'var(--border-strong)';
            calBtn.style.background = 'transparent';
            calBtn.style.color = 'var(--text-muted)';
            calBtn.style.borderColor = 'transparent';
            timelineView.style.display = 'block';
            calView.style.display = 'none';
            renderTimeline();
        });
        
        calBtn.addEventListener('click', () => {
            calBtn.style.background = 'var(--accent-light)';
            calBtn.style.color = 'var(--accent)';
            calBtn.style.borderColor = 'var(--border-strong)';
            timelineBtn.style.background = 'transparent';
            timelineBtn.style.color = 'var(--text-muted)';
            timelineBtn.style.borderColor = 'transparent';
            timelineView.style.display = 'none';
            calView.style.display = 'block';
            renderCalendar();
        });
    }

    // Listeners
    const searchInput = document.getElementById('hearing-search');
    const filterDate = document.getElementById('filter-date');
    const filterJudgeSelect = document.getElementById('filter-judge');
    const clearFilters = document.getElementById('btn-clear-filters');

    if (searchInput) searchInput.addEventListener('input', renderTimeline);
    if (filterDate) filterDate.addEventListener('change', renderTimeline);
    if (filterJudgeSelect) filterJudgeSelect.addEventListener('change', renderTimeline);
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            filterDate.value = '';
            filterJudgeSelect.value = '';
            renderTimeline();
        });
    }
    
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');
    if (calPrev) {
        calPrev.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    if (calNext) {
        calNext.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Schedule Hearing
    const scheduleBtn = document.getElementById('btn-schedule-hearing');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
            const caseOptions = cases.map(c => `<option value="${c._id}">${c.case_id} - ${c.title}</option>`).join('');
            const judgeOptions = judges.map(j => `<option value="${j._id}">${j.name} (${j.specialization})</option>`).join('');
            const crOptions = courtrooms.map(cr => `<option value="${cr._id}">Room ${cr.room_no} (Cap: ${cr.capacity})</option>`).join('');
            
            createModal({
                title: 'Schedule Hearing',
                content: `
                    <form id="hearing-form">
                        <div class="form-group">
                            <label class="form-label">Select Case</label>
                            <select class="form-control" id="new-hr-case" required>
                                <option value="">Select Case...</option>
                                ${caseOptions}
                            </select>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="new-hr-date" required min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Time</label>
                                <input type="time" class="form-control" id="new-hr-time" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Judge</label>
                            <select class="form-control" id="new-hr-judge" required>
                                <option value="">Assign Judge...</option>
                                ${judgeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Courtroom</label>
                            <select class="form-control" id="new-hr-cr" required>
                                <option value="">Assign Courtroom...</option>
                                ${crOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <input type="text" class="form-control" id="new-hr-notes">
                        </div>
                    </form>
                `,
                saveText: 'Schedule',
                onSave: async (overlay) => {
                    const form = overlay.querySelector('#hearing-form');
                    if(!validateForm(form)) return false;
                    
                    const dateVal = document.getElementById('new-hr-date').value;
                    const timeVal = document.getElementById('new-hr-time').value;
                    const judgeVal = document.getElementById('new-hr-judge').value;
                    const crVal = document.getElementById('new-hr-cr').value;
                    const caseVal = document.getElementById('new-hr-case').value;
                    const notesVal = document.getElementById('new-hr-notes').value;
                    
                    // Conflict check (Optional: Frontend pre-check)
                    const conflict = hearings.find(h => {
                        const hDate = h.date.split('T')[0];
                        const jId = typeof h.judge_id === 'object' && h.judge_id !== null ? h.judge_id._id : h.judge_id;
                        const crId = typeof h.courtroom_id === 'object' && h.courtroom_id !== null ? h.courtroom_id._id : h.courtroom_id;
                        return hDate === dateVal && h.time === timeVal && (jId === judgeVal || crId === crVal);
                    });

                    if(conflict) {
                        showToast('Scheduling conflict: The selected judge or courtroom is already booked at this time.', 'danger');
                        return false;
                    }
                    
                    try {
                        const newHr = {
                            case_id: caseVal,
                            judge_id: judgeVal,
                            courtroom_id: crVal,
                            date: dateVal,
                            time: timeVal,
                            notes: notesVal
                        };
                        
                        await apiFetch('/hearings', 'POST', newHr);
                        
                        // Update case status (Optional: Backend might do this, but if not:)
                        // await apiFetch(`/cases/${caseVal}`, 'PUT', { status: 'Hearing' });
                        
                        await loadData();
                        renderTimeline();
                        renderCalendar();
                        showToast('Hearing scheduled successfully.');
                        return true;
                    } catch (err) {
                        showToast(err.message, 'error');
                        return false;
                    }
                }
            });
        });
    }

    window.deleteHearing = (id) => {
        confirmDialog(`Are you sure you want to cancel this hearing?`, async () => {
            try {
                playGavelSound();
                await apiFetch(`/hearings/${id}`, 'DELETE');
                await loadData();
                renderTimeline();
                renderCalendar();
                showToast('Hearing cancelled.');
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    };
    
    window.editHearing = (id) => {
        const h = hearings.find(item => item._id === id);
        if (!h) return;
        
        const hCaseId = typeof h.case_id === 'object' && h.case_id !== null ? h.case_id._id : h.case_id;
        const hJudgeId = typeof h.judge_id === 'object' && h.judge_id !== null ? h.judge_id._id : h.judge_id;
        const hCrId = typeof h.courtroom_id === 'object' && h.courtroom_id !== null ? h.courtroom_id._id : h.courtroom_id;
        const hDate = h.date.split('T')[0];

        const caseOptions = cases.map(c => `<option value="${c._id}" ${c._id === hCaseId ? 'selected' : ''}>${c.case_id} - ${c.title}</option>`).join('');
        const judgeOptions = judges.map(j => `<option value="${j._id}" ${j._id === hJudgeId ? 'selected' : ''}>${j.name} (${j.specialization})</option>`).join('');
        const crOptions = courtrooms.map(cr => `<option value="${cr._id}" ${cr._id === hCrId ? 'selected' : ''}>Room ${cr.room_no} (Cap: ${cr.capacity})</option>`).join('');
        
        createModal({
            title: 'Edit Hearing',
            content: `
                <form id="edit-hearing-form">
                    <div class="form-group">
                        <label class="form-label">Select Case</label>
                        <select class="form-control" id="edit-hr-case" required>
                            <option value="">Select Case...</option>
                            ${caseOptions}
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" id="edit-hr-date" required value="${hDate}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Time</label>
                            <input type="time" class="form-control" id="edit-hr-time" required value="${h.time || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Judge</label>
                        <select class="form-control" id="edit-hr-judge" required>
                            <option value="">Assign Judge...</option>
                            ${judgeOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Courtroom</label>
                        <select class="form-control" id="edit-hr-cr" required>
                            <option value="">Assign Courtroom...</option>
                            ${crOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <input type="text" class="form-control" id="edit-hr-notes" value="${h.notes || ''}">
                    </div>
                </form>
            `,
            saveText: 'Save Changes',
            onSave: async (overlay) => {
                const form = overlay.querySelector('#edit-hearing-form');
                if(!validateForm(form)) return false;
                
                const dateVal = document.getElementById('edit-hr-date').value;
                const timeVal = document.getElementById('edit-hr-time').value;
                const judgeVal = document.getElementById('edit-hr-judge').value;
                const crVal = document.getElementById('edit-hr-cr').value;
                const caseVal = document.getElementById('edit-hr-case').value;
                const notesVal = document.getElementById('edit-hr-notes').value;
                
                // Conflict check
                const conflict = hearings.find(hear => {
                    const hDate = hear.date.split('T')[0];
                    const jId = typeof hear.judge_id === 'object' && hear.judge_id !== null ? hear.judge_id._id : hear.judge_id;
                    const crId = typeof hear.courtroom_id === 'object' && hear.courtroom_id !== null ? hear.courtroom_id._id : hear.courtroom_id;
                    return hear._id !== id && hDate === dateVal && hear.time === timeVal && (jId === judgeVal || crId === crVal);
                });

                if(conflict) {
                    showToast('Scheduling conflict: The selected judge or courtroom is already booked at this time.', 'danger');
                    return false;
                }
                
                try {
                    await apiFetch(`/hearings/${id}`, 'PUT', {
                        case_id: caseVal,
                        judge_id: judgeVal,
                        courtroom_id: crVal,
                        date: dateVal,
                        time: timeVal,
                        notes: notesVal
                    });
                    
                    await loadData();
                    renderTimeline();
                    renderCalendar();
                    showToast('Hearing updated successfully.');
                    return true;
                } catch (err) {
                    showToast(err.message, 'error');
                    return false;
                }
            }
        });
    };

    // Init
    renderTimeline();
    renderCalendar();
}
