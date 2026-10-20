// Storage constants
const STORAGE_KEY = 'simple_smart_cart_items_v1';

// App State
let items = [];

// DOM Elements
const currentDateDisplay = document.getElementById('currentDateDisplay');
const totalSumDisplay = document.getElementById('totalSumDisplay');
const totalCountBadge = document.getElementById('totalCountBadge');
const listCountBadge = document.getElementById('listCountBadge');
const itemForm = document.getElementById('itemForm');
const nameInput = document.getElementById('nameInput');
const priceInput = document.getElementById('priceInput');
const qtyInput = document.getElementById('qtyInput');
const itemList = document.getElementById('itemList');
const emptyState = document.getElementById('emptyState');
const listFooter = document.getElementById('listFooter');
const clearAllBtn = document.getElementById('clearAllBtn');
const bottomClearAllBtn = document.getElementById('bottomClearAllBtn');
const toastEl = document.getElementById('toast');

// Utilities
function formatCurrency(num) {
  return (num || 0).toLocaleString('ko-KR');
}

function parseNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Current Date in Korean
function initDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
  currentDateDisplay.textContent = now.toLocaleDateString('ko-KR', options);
}

// Storage Handlers
function loadItems() {
  // Check if opened with shared URL data (#cart=...)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#cart=')) {
    try {
      const encoded = hash.substring(6);
      const jsonStr = decodeURIComponent(atob(encoded));
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed.map(arr => ({
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: arr[0],
          price: arr[1] || 0,
          quantity: arr[2] || 1
        }));
        saveItems();
        showToast(`공유받은 ${items.length}개 품목을 불러왔습니다!`);
        window.location.hash = '';
        return;
      }
    } catch (e) {
      console.error('Failed to parse incoming hash:', e);
    }
  }

  // Load from LocalStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      items = JSON.parse(saved);
    } catch (e) {
      items = [];
    }
  } else {
    items = [
      { id: '1', name: '사과 (1봉)', price: 6800, quantity: 1 },
      { id: '2', name: '서울우유 1L', price: 2980, quantity: 2 },
      { id: '3', name: '달걀 15구', price: 5480, quantity: 1 }
    ];
    saveItems();
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Automatic Total Calculation & Rendering
function calculateAndRender() {
  let totalSum = 0;
  let totalCount = 0;

  items.forEach(item => {
    const subtotal = (item.price || 0) * (item.quantity || 1);
    totalSum += subtotal;
    totalCount += (item.quantity || 1);
  });

  // Update Total Sum Display
  totalSumDisplay.textContent = formatCurrency(totalSum);
  totalCountBadge.textContent = `총 ${items.length}개 품목 (${totalCount}개)`;
  listCountBadge.textContent = `${items.length}개`;

  // Render Item List
  renderList();
}

function renderList() {
  itemList.innerHTML = '';

  if (items.length === 0) {
    emptyState.style.display = 'flex';
    listFooter.style.display = 'none';
    clearAllBtn.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  clearAllBtn.style.display = 'flex';
  listFooter.style.display = items.length >= 3 ? 'flex' : 'none';

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'item-row';
    const subtotal = (item.price || 0) * (item.quantity || 1);

    li.innerHTML = `
      <div class="item-left">
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-detail">
          단가 ${formatCurrency(item.price)}원${item.quantity > 1 ? ` × ${item.quantity}개` : ''}
        </span>
      </div>

      <div class="item-right">
        <span class="item-amount">${formatCurrency(subtotal)}원</span>
        <button class="btn-delete" title="삭제" aria-label="${escapeHtml(item.name)} 삭제">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    // Delete single item (즉시 삭제 및 금액 자동 재계산)
    li.querySelector('.btn-delete').addEventListener('click', () => {
      const removedName = item.name;
      items.splice(index, 1);
      saveItems();
      calculateAndRender();
      showToast(`'${removedName}' 품목이 삭제되었습니다.`);
    });

    itemList.appendChild(li);
  });
}

// Auto format price with commas on typing
priceInput.addEventListener('input', (e) => {
  const val = parseNumber(e.target.value);
  e.target.value = val > 0 ? formatCurrency(val) : '';
});

// Add Item Form Submit
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  const price = parseNumber(priceInput.value);
  const qty = parseInt(qtyInput.value, 10) || 1;

  const newItem = {
    id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    name,
    price,
    quantity: qty > 0 ? qty : 1
  };

  items.unshift(newItem);
  saveItems();

  // Reset form inputs
  nameInput.value = '';
  priceInput.value = '';
  qtyInput.value = '1';
  nameInput.focus();

  showToast(`'${name}' 추가됨 (총 금액 자동 합산)`);
  calculateAndRender();
});

// 담은 품목 전체삭제 (Clear All Items)
function executeClearAll() {
  if (items.length === 0) {
    showToast('삭제할 담은 품목이 없습니다.');
    return;
  }
  if (confirm('장바구니에 담은 모든 품목을 전체 삭제하시겠습니까?')) {
    items = [];
    saveItems();
    calculateAndRender();
    showToast('담은 품목이 모두 삭제되었습니다.');
  }
}

clearAllBtn.addEventListener('click', executeClearAll);
bottomClearAllBtn.addEventListener('click', executeClearAll);

// Boot
initDate();
loadItems();
calculateAndRender();
