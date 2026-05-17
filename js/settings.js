async function initSettings() {
  // Check API status
  try {
    const res = await fetch('http://localhost:5001/api/cases')
    const statusEl = document.getElementById('api-status')
    if (statusEl) {
      if (res.ok) {
        statusEl.innerHTML = `
          <div style="width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,0.5);"></div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);padding:6px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);">Online</div>
        `
      } else {
        statusEl.innerHTML = `
          <div style="width:7px;height:7px;border-radius:50%;background:#f87171;"></div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);padding:6px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);">Offline</div>
        `
      }
    }
  } catch(e) {
    const statusEl = document.getElementById('api-status')
    if (statusEl) {
      statusEl.innerHTML = `
        <div style="width:7px;height:7px;border-radius:50%;background:#f87171;"></div>
        <div style="font-size:13px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);padding:6px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);">Offline</div>
      `
    }
  }
}

async function exportData() {
  try {
    const res = await fetch('http://localhost:5001/api/cases')
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'judicams-cases.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch(e) {
    alert('Export failed — make sure backend is running')
  }
}

async function resetDatabase() {
  if (!confirm('Are you sure? This will clear all data and reseed sample data.')) return
  try {
    const res = await fetch('http://localhost:5001/api/reset', { method: 'POST' })
    if (res.ok) {
      alert('Database reset successfully!')
      navigateTo('dashboard')
    } else {
      alert('Reset failed — check backend')
    }
  } catch(e) {
    alert('Reset failed — make sure backend is running')
  }
}
