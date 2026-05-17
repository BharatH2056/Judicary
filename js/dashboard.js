async function initDashboard() {
  // Set date
  const dateEl = document.getElementById('dash-date')
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  try {
    const BASE = 'http://localhost:5001/api'

    const [casesRes, hearingsRes, verdictsRes] = await Promise.all([
      fetch(`${BASE}/cases`),
      fetch(`${BASE}/hearings`),
      fetch(`${BASE}/verdicts`)
    ])

    const cases    = (await casesRes.json()).data    || []
    const hearings = (await hearingsRes.json()).data || []
    const verdicts = (await verdictsRes.json()).data || []

    // Stats
    const today = new Date().toDateString()
    const thisMonth = new Date().getMonth()
    const thisYear  = new Date().getFullYear()

    animateCount('stat-total',    cases.length)
    animateCount('stat-open',     cases.filter(c => c.status === 'Open').length)
    animateCount('stat-hearings', hearings.filter(h => new Date(h.date).toDateString() === today).length)
    animateCount('stat-verdicts', verdicts.filter(v => {
      const d = new Date(v.verdict_date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).length)

    // Recent Cases
    const recentList = document.getElementById('recent-cases-list')
    if (recentList) {
      const recent = [...cases]
        .sort((a,b) => new Date(b.filing_date) - new Date(a.filing_date))
        .slice(0, 5)
      recentList.innerHTML = recent.map(c => `
        <div onclick="navigateTo('cases')" style="display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer;">
          <div style="width:8px; height:8px; border-radius:50%; flex-shrink:0; background:${c.status==='Open'?'#ffffff':c.status==='Pending'?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.2)'};"></div>
          <div style="flex:1;">
            <div style="font-size:14px; font-weight:500; color:#ffffff;">${c.title}</div>
            <div style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:3px;">${c.case_id} • ${c.type}</div>
          </div>
          <div style="text-align:right;">
            <div style="display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.1);">${c.status.toUpperCase()}</div>
            <div style="font-size:11px; color:rgba(255,255,255,0.25); margin-top:4px;">${new Date(c.filing_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
          </div>
        </div>
      `).join('')
    }

    // Upcoming Hearings
    const hearingsList = document.getElementById('upcoming-hearings-list')
    if (hearingsList) {
      const upcoming = [...hearings]
        .sort((a,b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4)
      hearingsList.innerHTML = upcoming.map(h => {
        const d = new Date(h.date)
        const isToday = d.toDateString() === today
        const day = d.getDate()
        const mon = d.toLocaleDateString('en-US',{month:'short'}).toUpperCase()
        const room = h.courtroom_id?.room_no || 'N/A'
        const judge = h.judge_id?.name || 'TBD'
        const caseTitle = h.case_id?.title || 'Unknown Case'
        const time = h.time || ''
        return `
          <div onclick="navigateTo('hearings')" style="cursor:pointer; display:flex; align-items:center; gap:14px; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; margin-bottom:10px;">
            <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; width:48px; height:52px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0;">
              <div style="font-size:18px; font-weight:700; color:#ffffff; line-height:1;">${day}</div>
              <div style="font-size:9px; color:rgba(255,255,255,0.35); text-transform:uppercase;">${mon}</div>
            </div>
            <div style="flex:1;">
              <div style="font-size:13px; font-weight:600; color:#ffffff;">${caseTitle}</div>
              <div style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:3px;">${judge}${time?' • '+time:''} • Room ${room}</div>
            </div>
            ${isToday?'<div style="background:rgba(255,255,255,0.1); color:#ffffff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; font-size:10px; font-weight:700; padding:3px 8px;">TODAY</div>':''}
          </div>
        `
      }).join('')
    }

  } catch(err) {
    console.error('Dashboard error:', err)
  }
}

function animateCount(id, target) {
  const el = document.getElementById(id)
  if (!el) return
  let current = 0
  const step = Math.max(1, Math.ceil(target / 30))
  const timer = setInterval(() => {
    current += step
    if (current >= target) { current = target; clearInterval(timer) }
    el.textContent = current
  }, 40)
}
