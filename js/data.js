// Simple ID Generator
const generateId = (prefix) => {
    return prefix + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Initial Data Setup
const initialData = {
    cases: [
        { id: 'CAS-1001', title: 'State vs. John Doe', type: 'Criminal', status: 'Hearing', filedDate: '2026-04-10', notes: 'Robbery charges.' },
        { id: 'CAS-1002', title: 'Smith vs. Smith', type: 'Family', status: 'Open', filedDate: '2026-05-01', notes: 'Divorce settlement.' },
        { id: 'CAS-1003', title: 'TechCorp vs. StartupInc', type: 'Civil', status: 'Pending', filedDate: '2026-05-12', notes: 'Patent infringement.' },
        { id: 'CAS-1004', title: 'State vs. Jane Roe', type: 'Criminal', status: 'Closed', filedDate: '2026-01-15', notes: 'Assault.' },
        { id: 'CAS-1005', title: 'Johnson Estate Dispute', type: 'Civil', status: 'Hearing', filedDate: '2026-03-22', notes: 'Will contest.' },
        { id: 'CAS-1006', title: 'City vs. MegaBuild', type: 'Civil', status: 'Open', filedDate: '2026-05-14', notes: 'Zoning violation.' },
        { id: 'CAS-1007', title: 'Brown Custody Battle', type: 'Family', status: 'Pending', filedDate: '2026-05-05', notes: 'Child custody.' },
        { id: 'CAS-1008', title: 'State vs. Robert King', type: 'Criminal', status: 'Closed', filedDate: '2025-11-20', notes: 'Fraud.' },
        { id: 'CAS-1009', title: 'Green vs. Local Hospital', type: 'Civil', status: 'Hearing', filedDate: '2026-02-18', notes: 'Medical malpractice.' },
        { id: 'CAS-1010', title: 'State vs. Alice Wonderland', type: 'Criminal', status: 'Closed', filedDate: '2025-08-30', notes: 'Theft.' }
    ],
    judges: [
        { id: 'JUD-01', name: 'Hon. Robert Peterson', specialization: 'Criminal', experience: 15, courtroomId: 'CR-101' },
        { id: 'JUD-02', name: 'Hon. Sarah Jenkins', specialization: 'Family', experience: 8, courtroomId: 'CR-205' },
        { id: 'JUD-03', name: 'Hon. Michael Chang', specialization: 'Civil', experience: 22, courtroomId: 'CR-310' }
    ],
    courtrooms: [
        { id: 'CR-101', roomNo: '101', floor: 1, capacity: 50, status: 'In Use' },
        { id: 'CR-205', roomNo: '205', floor: 2, capacity: 30, status: 'Available' },
        { id: 'CR-310', roomNo: '310', floor: 3, capacity: 100, status: 'Maintenance' },
        { id: 'CR-102', roomNo: '102', floor: 1, capacity: 40, status: 'Available' }
    ],
    hearings: [
        { id: 'HR-501', caseId: 'CAS-1001', judgeId: 'JUD-01', courtroomId: 'CR-101', date: '2026-05-16', time: '10:00', notes: 'Initial trial phase.' },
        { id: 'HR-502', caseId: 'CAS-1005', judgeId: 'JUD-03', courtroomId: 'CR-310', date: '2026-05-16', time: '14:30', notes: 'Witness testimony.' },
        { id: 'HR-503', caseId: 'CAS-1009', judgeId: 'JUD-03', courtroomId: 'CR-310', date: '2026-05-17', time: '09:00', notes: 'Expert witness.' },
        { id: 'HR-504', caseId: 'CAS-1002', judgeId: 'JUD-02', courtroomId: 'CR-205', date: '2026-05-18', time: '11:00', notes: 'Mediation.' },
        { id: 'HR-505', caseId: 'CAS-1004', judgeId: 'JUD-01', courtroomId: 'CR-101', date: '2026-01-20', time: '10:00', notes: 'Final sentencing.' },
        { id: 'HR-506', caseId: 'CAS-1008', judgeId: 'JUD-01', courtroomId: 'CR-101', date: '2025-12-10', time: '13:00', notes: 'Plea hearing.' },
        { id: 'HR-507', caseId: 'CAS-1010', judgeId: 'JUD-01', courtroomId: 'CR-101', date: '2025-09-15', time: '09:30', notes: 'Trial.' },
        { id: 'HR-508', caseId: 'CAS-1006', judgeId: 'JUD-03', courtroomId: 'CR-310', date: '2026-05-20', time: '10:00', notes: 'Injunction hearing.' }
    ],
    verdicts: [
        { id: 'VER-001', caseId: 'CAS-1004', decision: 'Guilty', penalty: '5 years probation', date: '2026-01-25' },
        { id: 'VER-002', caseId: 'CAS-1008', decision: 'Guilty', penalty: '2 years imprisonment', date: '2025-12-15' },
        { id: 'VER-003', caseId: 'CAS-1010', decision: 'Not Guilty', penalty: 'None', date: '2025-09-20' },
        { id: 'VER-004', caseId: 'CAS-1001', decision: 'Pending', penalty: 'TBD', date: '' }
    ],
    lawyers: [
        { id: 'LAW-01', name: 'Harvey Specter', barNumber: 'NY-12345', specialization: 'Civil', contact: 'harvey@law.com' },
        { id: 'LAW-02', name: 'Alicia Florrick', barNumber: 'IL-54321', specialization: 'Criminal', contact: 'alicia@law.com' },
        { id: 'LAW-03', name: 'Saul Goodman', barNumber: 'NM-98765', specialization: 'Criminal', contact: 'saul@law.com' },
        { id: 'LAW-04', name: 'Kim Wexler', barNumber: 'NM-11223', specialization: 'Civil', contact: 'kim@law.com' },
        { id: 'LAW-05', name: 'Miranda Hobbes', barNumber: 'NY-55667', specialization: 'Family', contact: 'miranda@law.com' },
        { id: 'LAW-06', name: 'Alan Shore', barNumber: 'MA-99887', specialization: 'Civil', contact: 'alan@law.com' }
    ],
    parties: [
        { id: 'PAR-01', name: 'John Doe', role: 'Defendant', contact: 'john@email.com', address: '123 Main St' },
        { id: 'PAR-02', name: 'Jane Smith', role: 'Plaintiff', contact: 'jane@email.com', address: '456 Oak Ave' },
        { id: 'PAR-03', name: 'TechCorp LLC', role: 'Plaintiff', contact: 'legal@techcorp.com', address: '789 Silicon Blvd' },
        { id: 'PAR-04', name: 'StartupInc', role: 'Defendant', contact: 'founder@startup.com', address: '321 Garage Ln' },
        { id: 'PAR-05', name: 'Jane Roe', role: 'Defendant', contact: 'jane.roe@email.com', address: '555 Pine St' },
        { id: 'PAR-06', name: 'City Municipality', role: 'Plaintiff', contact: 'legal@city.gov', address: '1 City Hall' },
        { id: 'PAR-07', name: 'MegaBuild Corp', role: 'Defendant', contact: 'info@megabuild.com', address: '200 Construction Way' },
        { id: 'PAR-08', name: 'Local Hospital', role: 'Defendant', contact: 'legal@hospital.org', address: '100 Health Dr' }
    ],
    evidence: [
        { id: 'EVD-01', caseId: 'CAS-1001', type: 'Physical', description: 'Weapon found at scene', submittedBy: 'LAW-02', date: '2026-04-12' },
        { id: 'EVD-02', caseId: 'CAS-1003', type: 'Document', description: 'Patent filing documents', submittedBy: 'LAW-01', date: '2026-05-13' },
        { id: 'EVD-03', caseId: 'CAS-1003', type: 'Digital', description: 'Source code repository logs', submittedBy: 'LAW-04', date: '2026-05-14' },
        { id: 'EVD-04', caseId: 'CAS-1004', type: 'Testimony', description: 'Eyewitness statement', submittedBy: 'LAW-02', date: '2026-01-16' },
        { id: 'EVD-05', caseId: 'CAS-1006', type: 'Document', description: 'Zoning permit application', submittedBy: 'LAW-06', date: '2026-05-15' },
        { id: 'EVD-06', caseId: 'CAS-1006', type: 'Physical', description: 'Construction site photos', submittedBy: 'LAW-06', date: '2026-05-15' },
        { id: 'EVD-07', caseId: 'CAS-1008', type: 'Digital', description: 'Bank transfer records', submittedBy: 'LAW-02', date: '2025-11-25' },
        { id: 'EVD-08', caseId: 'CAS-1009', type: 'Document', description: 'Medical charts', submittedBy: 'LAW-01', date: '2026-02-20' },
        { id: 'EVD-09', caseId: 'CAS-1002', type: 'Document', description: 'Prenuptial agreement', submittedBy: 'LAW-05', date: '2026-05-02' },
        { id: 'EVD-10', caseId: 'CAS-1010', type: 'Digital', description: 'Security camera footage', submittedBy: 'LAW-03', date: '2025-09-02' },
        { id: 'EVD-11', caseId: 'CAS-1001', type: 'Testimony', description: 'Police officer report', submittedBy: 'LAW-02', date: '2026-04-15' },
        { id: 'EVD-12', caseId: 'CAS-1005', type: 'Document', description: 'Original will document', submittedBy: 'LAW-04', date: '2026-03-25' }
    ],
    // N:M Relationships
    caseLawyers: [
        { caseId: 'CAS-1001', lawyerId: 'LAW-02' },
        { caseId: 'CAS-1001', lawyerId: 'LAW-03' },
        { caseId: 'CAS-1003', lawyerId: 'LAW-01' },
        { caseId: 'CAS-1003', lawyerId: 'LAW-04' },
        { caseId: 'CAS-1002', lawyerId: 'LAW-05' },
        { caseId: 'CAS-1006', lawyerId: 'LAW-06' },
        { caseId: 'CAS-1008', lawyerId: 'LAW-02' },
        { caseId: 'CAS-1009', lawyerId: 'LAW-01' },
        { caseId: 'CAS-1010', lawyerId: 'LAW-03' }
    ],
    caseParties: [
        { caseId: 'CAS-1001', partyId: 'PAR-01' },
        { caseId: 'CAS-1002', partyId: 'PAR-02' },
        { caseId: 'CAS-1003', partyId: 'PAR-03' },
        { caseId: 'CAS-1003', partyId: 'PAR-04' },
        { caseId: 'CAS-1004', partyId: 'PAR-05' },
        { caseId: 'CAS-1006', partyId: 'PAR-06' },
        { caseId: 'CAS-1006', partyId: 'PAR-07' },
        { caseId: 'CAS-1009', partyId: 'PAR-08' }
    ]
};

// Initialize LocalStorage if empty
if (!localStorage.getItem('cjms_data')) {
    localStorage.setItem('cjms_data', JSON.stringify(initialData));
}

// Data Access Layer
const db = {
    getAll: (collection) => {
        const data = JSON.parse(localStorage.getItem('cjms_data'));
        return data[collection] || [];
    },
    getById: (collection, id) => {
        const items = db.getAll(collection);
        return items.find(item => item.id === id);
    },
    insert: (collection, item) => {
        const data = JSON.parse(localStorage.getItem('cjms_data'));
        if (!data[collection]) data[collection] = [];
        data[collection].push(item);
        localStorage.setItem('cjms_data', JSON.stringify(data));
        updateSidebarCounts();
        return item;
    },
    update: (collection, id, updates) => {
        const data = JSON.parse(localStorage.getItem('cjms_data'));
        if (!data[collection]) return null;
        const index = data[collection].findIndex(item => item.id === id);
        if (index !== -1) {
            data[collection][index] = { ...data[collection][index], ...updates };
            localStorage.setItem('cjms_data', JSON.stringify(data));
            return data[collection][index];
        }
        return null;
    },
    delete: (collection, id) => {
        const data = JSON.parse(localStorage.getItem('cjms_data'));
        if (!data[collection]) return false;
        const initialLength = data[collection].length;
        data[collection] = data[collection].filter(item => item.id !== id);
        
        // Handle cascades if necessary (e.g. deleting a case deletes its hearings)
        if (collection === 'cases') {
            data.hearings = data.hearings.filter(h => h.caseId !== id);
            data.verdicts = data.verdicts.filter(v => v.caseId !== id);
            data.evidence = data.evidence.filter(e => e.caseId !== id);
            data.caseLawyers = data.caseLawyers.filter(cl => cl.caseId !== id);
            data.caseParties = data.caseParties.filter(cp => cp.caseId !== id);
        }
        
        localStorage.setItem('cjms_data', JSON.stringify(data));
        updateSidebarCounts();
        return data[collection].length !== initialLength;
    },
    // Helpers for N:M relationships
    addLink: (collection, link) => {
        const data = JSON.parse(localStorage.getItem('cjms_data'));
        if (!data[collection]) data[collection] = [];
        data[collection].push(link);
        localStorage.setItem('cjms_data', JSON.stringify(data));
    },
    removeLink: (collection, predicate) => {
        const data = JSON.parse(localStorage.getItem('cjms_data'));
        if (!data[collection]) return;
        data[collection] = data[collection].filter(item => !predicate(item));
        localStorage.setItem('cjms_data', JSON.stringify(data));
    }
};

function updateSidebarCounts() {
    const casesCount = db.getAll('cases').length;
    const hearingsCount = db.getAll('hearings').filter(h => h.date === new Date().toISOString().split('T')[0]).length; // Today's hearings
    
    document.getElementById('sidebar-cases-count').textContent = casesCount;
    const hBadge = document.getElementById('sidebar-hearings-count');
    hBadge.textContent = hearingsCount > 0 ? hearingsCount : '';
    if(hearingsCount === 0) hBadge.style.display = 'none';
    else hBadge.style.display = 'inline-block';
}
