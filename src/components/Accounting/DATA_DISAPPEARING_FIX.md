# Data Disappearing Issue - Root Causes and Fixes

## Problems Identified

### 1. **Auto-Selection Conflict** 
**Issue**: The `fetchDriversSummary` function was automatically selecting the first driver, which triggered multiple state updates and API calls simultaneously.

**Fix**: 
- Removed automatic driver selection on initial load
- Only auto-select when restoring from persisted state
- Let users manually choose drivers to prevent conflicts

### 2. **useEffect Race Conditions**
**Issue**: Multiple useEffect hooks were triggering `fetchDriverDetails` at the same time:
- Driver selection useEffect
- Date range useEffect  
- Both could fire simultaneously and conflict

**Fix**:
- Added timeout delays to prevent rapid re-fetching
- Added proper cleanup for timeouts
- Better conditional checks in useEffect dependencies

### 3. **API Response Inconsistency**
**Issue**: The API fallback logic could return different data structures, causing the UI to not know how to handle the response properly.

**Fix**:
- Standardized response format in `getDriverPayData`
- Always return consistent object structure with default values
- Removed complex fallback logic that could cause errors

### 4. **State Update Conflicts**
**Issue**: Multiple state updates happening in rapid succession could cause React to re-render and lose data.

**Fix**:
- Added `initialLoadComplete` state to track loading phases
- Improved state update sequencing
- Better error handling to prevent state corruption

## Specific Code Changes

### In `paySystem.js`:
```javascript
// Now ensures consistent response format
return {
  loads: ensureArray(response.loads || []),
  other_pays: ensureArray(response.other_pays || []),
  driver: response.driver || { id: driverId },
  statement_notes: response.statement_notes || '',
  fuel_advance: response.fuel_advance || 0,
  other_deductions: response.other_deductions || 0,
  ...response
};
```

### In `AccountingPage.jsx`:
```javascript
// Removed auto-selection to prevent conflicts
// Don't auto-select a driver initially - let user choose
// This prevents the data disappearing issue
setPersistedHydrated(true);

// Added timeout delays to prevent race conditions
const timeoutId = setTimeout(() => {
  fetchDriverDetails(selectedDriverId);
}, 100);
```

## Expected Behavior Now

1. **Page loads** → Shows drivers list without auto-selecting
2. **User clicks driver** → Data loads and stays visible
3. **Date changes** → Data refreshes with delay to prevent conflicts
4. **No more disappearing data** → State updates are properly sequenced

## Debug Information

The debug panel now shows:
- Initial Load Complete status
- Better tracking of state transitions
- More detailed API response logging

## Testing

To verify the fix works:
1. Refresh the page
2. Click "Show Debug" to monitor state
3. Select a driver and verify data appears and stays
4. Change date range and verify data updates properly
5. Check console for any error messages