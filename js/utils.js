// UI Utilities

// Badges
const renderBadge = (type, text) => {
    let className = 'badge-';
    const lowerType = type.toLowerCase();
    
    if (['open', 'pending', 'closed', 'hearing'].includes(lowerType)) {
        className += lowerType;
    } else if (['criminal', 'civil', 'family'].includes(lowerType)) {
        className += lowerType;
    } else if (['plaintiff', 'defendant'].includes(lowerType)) {
        className += lowerType;
    } else {
        className = 'badge-pending'; // fallback
    }
    
    return `<span class="badge ${className}">${text || type}</span>`;
};

// Date formatters
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) {
        if(Math.floor(interval) === 1) return "Yesterday";
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    if(seconds < 0) return "In the future"; // For upcoming dates
    return "Just now";
};

// Toasts
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Modals
const createModal = (options) => {
    const { title, content, onSave, saveText = 'Save', cancelText = 'Cancel' } = options;
    
    const container = document.getElementById('modal-container');
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modalHtml = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close"><i class="ti ti-x"></i></button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                <button class="btn btn-primary modal-save">${saveText}</button>
            </div>
        </div>
    `;
    
    overlay.innerHTML = modalHtml;
    container.appendChild(overlay);
    
    // Focus trap
    const focusableElements = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    overlay.addEventListener('keydown', function(e) {
        let isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) {
            if(e.key === 'Escape') closeModal();
            return;
        }

        if (e.shiftKey) { 
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { 
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    });
    
    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };
    
    // Event Listeners
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    const cancelBtn = overlay.querySelector('.modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeModal();
    });
    
    const saveBtn = overlay.querySelector('.modal-save');
    saveBtn.addEventListener('click', async () => {
        if(onSave) {
            const success = await onSave(overlay);
            if(success !== false) closeModal();
        } else {
            closeModal();
        }
    });
    
    // Show modal
    setTimeout(() => {
        overlay.classList.add('active');
        const firstInput = overlay.querySelector('input, select, textarea');
        if(firstInput) firstInput.focus();
    }, 10);
    
    return {
        close: closeModal,
        element: overlay
    };
};

// Confirmation Dialog
const confirmDialog = (message, onConfirm) => {
    createModal({
        title: 'Confirm Action',
        content: `
            <div style="text-align: center; padding: 12px 0;">
                <p style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px;">${message}</p>
                <p style="color: var(--text-secondary); font-size: 14px;">This action cannot be undone.</p>
            </div>
        `,
        saveText: 'Confirm',
        onSave: () => {
            onConfirm();
            return true;
        }
    });
    
    const overlays = document.querySelectorAll('.modal-overlay');
    const lastOverlay = overlays[overlays.length - 1];
    const saveBtn = lastOverlay.querySelector('.modal-save');
    saveBtn.className = 'btn btn-danger modal-save';
};

// Form Validation Utils
const validateForm = (formElement) => {
    let isValid = true;
    const requiredInputs = formElement.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        input.style.borderColor = '';
        if(!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ef4444';
        }
    });
    
    return isValid;
};

// Slide Panel
const createSlidePanel = (title, contentHTML) => {
    const existing = document.getElementById('slide-panel-container');
    if(existing) existing.remove();
    
    const container = document.createElement('div');
    container.id = 'slide-panel-container';
    
    container.innerHTML = `
        <div class="slide-panel-overlay">
            <div class="slide-panel">
                <div class="slide-panel-header">
                    <h3>${title}</h3>
                    <button class="modal-close"><i class="ti ti-x"></i></button>
                </div>
                <div class="slide-panel-body">
                    ${contentHTML}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    const overlay = container.querySelector('.slide-panel-overlay');
    const panel = container.querySelector('.slide-panel');
    
    const closePanel = () => {
        overlay.classList.remove('active');
        panel.classList.remove('active');
        setTimeout(() => container.remove(), 300);
    };
    
    overlay.querySelector('.modal-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closePanel();
    });
    
    setTimeout(() => {
        overlay.classList.add('active');
        panel.classList.add('active');
    }, 10);
};

// Empty State SVG
const getEmptyStateHTML = (message) => `
    <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p>${message}</p>
    </div>
`;

// Sound Synthesis: Gavel knock effect for deletions
const playGavelSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn("Web Audio API not supported", e);
    }
};

// --- API INTEGRATION ---
const API_BASE = 'https://judicams-backend.onrender.com/api'

// Universal fetch helper
async function apiFetch(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    if (body) options.body = JSON.stringify(body)
    
    const res = await fetch(`${API_BASE}${endpoint}`, options)
    const data = await res.json()
    
    if (!res.ok) throw new Error(data.error || 'Something went wrong')
    return data
  } catch (err) {
    if (typeof showToast === 'function') {
        showToast(err.message, 'error')
    } else {
        alert(err.message)
    }
    throw err
  }
}

// Debounce for search
function debounce(fn, delay) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Loading spinner show/hide
function showLoader() {
  document.querySelector('.loading-spinner')?.classList.remove('hidden')
}
function hideLoader() {
  document.querySelector('.loading-spinner')?.classList.add('hidden')
}

// Confirm dialog mapping
function showConfirm(message, onConfirm) {
  if (typeof confirmDialog === 'function') {
    confirmDialog(message, onConfirm)
  } else {
    if (confirm(message)) onConfirm()
  }
}
// Export functions to window for global access
window.apiFetch = apiFetch;
window.showToast = showToast;
window.showLoader = showLoader;
window.hideLoader = hideLoader;
window.showConfirm = showConfirm;
window.formatDate = formatDate;
window.renderBadge = renderBadge;
window.timeAgo = timeAgo;
window.createModal = createModal;
window.confirmDialog = confirmDialog;
window.validateForm = validateForm;
window.createSlidePanel = createSlidePanel;
window.getEmptyStateHTML = getEmptyStateHTML;
window.playGavelSound = playGavelSound;
window.debounce = debounce;
