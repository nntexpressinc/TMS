# Amazon Relay Invoice Integration - Quick Reference

## 🎯 Overview

This implementation adds Amazon Relay invoice processing to the TMS system. When a user from an Amazon company uploads an Excel invoice file, the system automatically:

1. Processes the file
2. Matches loads with the system database
3. Identifies price mismatches
4. Generates a comparison report
5. Displays results with interactive UI

---

## 📂 File Structure

```
src/
├── components/Accounting/
│   ├── AmazonInvoiceUpload.jsx       ← New: Upload component
│   ├── AmazonInvoiceDetail.jsx       ← New: Detail view with tabs/search
│   ├── AmazonInvoiceList.jsx         ← New: List view with pagination
│   ├── InvoicesPage.jsx              ← Modified: Routes to Amazon components
│   ├── AmazonRelay.css               ← Modified: Extended with new styles
│   └── invoices/
│       ├── InvoiceCreatePage.jsx     ← Existing: For "other" companies
│       └── InvoiceViewPage.jsx       ← Existing: Standard invoice view
│
├── api/
│   └── accounting.js                 ← Modified: Added uploadInvoiceFile()
│
└── App.js                            ← Modified: Added route for detail view
```

---

## 🔌 API Integration

### Upload Endpoint
```javascript
POST /api/invoices/
Content-Type: multipart/form-data

// Frontend sends
FormData {
  uploaded_file: File      // Excel file
  company: Integer        // Auto from user.company
}

// Backend returns (for Amazon companies)
{
  id: 1,
  uploaded_file_url: "...",
  output_file_url: "...",
  loads: [...],
  warnings: {
    not_found: [...],
    price_mismatch: [...],
    error: [...]
  }
}
```

### Backend Routing Logic
```python
# Backend automatically detects company type
if company.company_type == 'amazon':
    # Process as Amazon Relay Invoice
    return AmazonRelayInvoiceSerializer
else:
    # Process as standard Invoice
    return InvoiceSerializer
```

---

## 🧩 Component Usage

### 1. AmazonInvoiceUpload

**Props:**
- `onUploadSuccess(response)` - Callback after successful upload

**Usage:**
```jsx
<AmazonInvoiceUpload 
  onUploadSuccess={(response) => {
    // Handle success
    navigate(`/invoices/amazon/${response.id}`);
  }} 
/>
```

**Features:**
- Drag & drop or click to browse
- File validation (10MB max, .xlsx/.xls)
- Progress indicator
- Toast notifications

---

### 2. AmazonInvoiceDetail

**Props:**
- Uses React Router's `useParams()` to get invoice ID from URL

**Route:**
```
/invoices/amazon/:id
```

**Features:**
- Summary cards (Success, Mismatch, Not Found, Errors)
- 5 tabs for filtering
- Search by Load ID or Reference ID
- Sortable columns
- Download buttons

**State Management:**
```jsx
const [activeTab, setActiveTab] = useState('all');
const [searchTerm, setSearchTerm] = useState('');
const [sortConfig, setSortConfig] = useState({ key: 'load_id', direction: 'asc' });
```

---

### 3. AmazonInvoiceList

**Props:**
- `refreshTrigger` - Number that increments to trigger refresh

**Usage:**
```jsx
<AmazonInvoiceList refreshTrigger={amazonInvoiceRefreshTrigger} />
```

**Features:**
- Paginated list
- Status filter dropdown
- Page size selector
- Mini summary badges
- View/Download actions

---

## 🎨 Styling Classes

### Key CSS Classes

```css
/* Main containers */
.amazon-invoice-list
.amazon-invoice-detail
.amazon-relay-upload

/* Drag & drop */
.drag-drop-zone
.drag-drop-zone.drag-active
.drag-drop-zone.has-file

/* Summary cards */
.summary-dashboard
.summary-card.success-card
.summary-card.warning-card
.summary-card.error-card

/* Tabs */
.tabs-container
.tab
.tab.active

/* Results table */
.results-table
.row-success
.row-price_mismatch
.row-not_found

/* Status badges */
.status-badge.success
.status-badge.warning
.status-badge.error

/* Download buttons */
.download-btn.primary
.download-btn.secondary
```

---

## 🔧 Customization

### Change Color Theme

Edit `AmazonRelay.css`:

```css
/* Success color */
.summary-card.success-card {
  border-color: #10b981;  /* Change to your color */
}

/* Warning color */
.summary-card.warning-card {
  border-color: #f59e0b;  /* Change to your color */
}
```

### Change File Size Limit

Edit `AmazonInvoiceUpload.jsx`:

```javascript
const fileSizeLimit = 10485760; // 10MB
// Change to: 20971520 for 20MB
```

### Add New Tab

Edit `AmazonInvoiceDetail.jsx`:

```jsx
// Add new tab button
<button 
  className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
  onClick={() => setActiveTab('custom')}
>
  Custom ({customCount})
</button>

// Add filter logic in filteredLoads
if (activeTab === 'custom') {
  filtered = filtered.filter(l => /* your condition */);
}
```

---

## 🐛 Troubleshooting

### Issue: Upload fails with 400 error

**Check:**
1. File format is .xlsx or .xls
2. File size under 10MB
3. User has accounting permission
4. Company exists in database

**Solution:**
```javascript
// Enable detailed error logging
console.log('Upload error:', error.response?.data);
```

### Issue: Detail page shows "Not Found"

**Check:**
1. Invoice ID is valid
2. User has permission to view
3. Invoice belongs to user's company

**Solution:**
```javascript
// Check response in browser console
console.log('Invoice data:', invoice);
```

### Issue: Results table not filtering

**Check:**
1. `activeTab` state is updating
2. `searchTerm` is lowercase for comparison
3. Loads array has `warning` field

**Solution:**
```javascript
// Add debug logging
console.log('Active tab:', activeTab);
console.log('Filtered loads:', filteredLoads);
```

---

## 🔐 Permissions

### Required Permission
```javascript
"accounting"
```

### Where It's Checked
- `App.js` - Route protection with `PermissionGuard`
- Backend API - User must have accounting access

### Adding New Permission Check
```jsx
<PermissionGuard permissionKey="accounting_admin">
  <AdminOnlyButton />
</PermissionGuard>
```

---

## 📱 Mobile Optimization

### Responsive Breakpoints
```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Key Mobile Changes
1. Summary cards stack vertically
2. Tabs become horizontally scrollable
3. Tables have horizontal scroll
4. Download buttons full width
5. Search box full width

---

## 🧪 Testing Scenarios

### 1. Upload Test
```
1. Select valid Excel file
2. Should show file name and size
3. Click "Upload & Process"
4. Should show spinner
5. Should navigate to detail page
```

### 2. Detail View Test
```
1. Check summary cards show correct counts
2. Click each tab, verify filtering
3. Search for specific load ID
4. Sort by each column
5. Download both files
```

### 3. List View Test
```
1. Change status filter
2. Change page size
3. Navigate pages
4. Click "View" button
5. Click "Download" button
```

---

## 📊 Performance Tips

### Optimize Large Lists
```javascript
// Use pagination
const [itemsPerPage, setItemsPerPage] = useState(25);

// Use useMemo for expensive calculations
const filteredLoads = useMemo(() => {
  // filtering logic
}, [loads, activeTab, searchTerm]);
```

### Reduce Re-renders
```javascript
// Use useCallback for event handlers
const handleSort = useCallback((key) => {
  setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
  }));
}, []);
```

---

## 🌍 Internationalization

### Add Translation
```javascript
// In component
const { t } = useTranslation();

// Usage
<h3>{t('Amazon Relay Invoices')}</h3>

// Add to translation file
{
  "Amazon Relay Invoices": "Facturas de Amazon Relay",
  "Upload & Process": "Subir y Procesar"
}
```

---

## 🔄 State Management Flow

```
InvoicesPage
  ↓
  ├─ AmazonInvoiceUpload
  │   ├─ [file] state
  │   ├─ [uploading] state
  │   └─ onUploadSuccess() → triggers refresh
  │
  └─ AmazonInvoiceList
      ├─ [invoices] state
      ├─ [currentPage] state
      └─ refreshTrigger prop → refetches data

AmazonInvoiceDetail
  ├─ [invoice] state
  ├─ [activeTab] state
  ├─ [searchTerm] state
  └─ [sortConfig] state
```

---

## ✅ Checklist for New Features

Before adding a new feature:
- [ ] Update component state
- [ ] Add UI elements
- [ ] Update CSS styling
- [ ] Add mobile responsive styles
- [ ] Add translation keys
- [ ] Update this documentation
- [ ] Test on desktop
- [ ] Test on mobile
- [ ] Check permissions
- [ ] Verify API integration

---

## 📞 Quick Links

- **API Docs:** Backend `/api/invoices/` endpoint documentation
- **Component Docs:** Inline JSDoc comments in each component
- **Style Guide:** `AmazonRelay.css` file
- **Main Summary:** `AMAZON_INVOICE_IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** January 13, 2025  
**Maintained by:** Frontend Development Team
