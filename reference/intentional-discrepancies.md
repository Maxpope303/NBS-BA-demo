# Intentional Discrepancies - Quick Reference

This document lists all intentional discrepancies in the Nationwide Demo project for testing Bob's Discrepancy Detection mode.

---

## Summary Statistics

| Category | Count | Severity Breakdown |
|----------|-------|-------------------|
| Missing Implementations | 5 | 3 High, 2 Medium |
| Undocumented Features | 3 | 2 Medium, 1 Low |
| API Mismatches | 3 | 3 High |
| Data Model Issues | 3 | 2 Critical, 1 Medium |
| **Total** | **14** | **2 Critical, 6 High, 5 Medium, 1 Low** |

---

## 1. Missing Implementations (5 total)

### 1.1 Password Reset Request Endpoint
- **Feature**: US-003 Password Reset
- **Expected**: `POST /api/users/reset-password`
- **Actual**: Not implemented
- **Location**: Should be in `src/api/routes/users.js`
- **Documented**: `docs/api/endpoints.md:45-55`
- **Severity**: High
- **Impact**: Critical user functionality unavailable

### 1.2 Password Reset Confirmation Endpoint
- **Feature**: US-003 Password Reset
- **Expected**: `POST /api/users/reset-password/confirm`
- **Actual**: Not implemented
- **Location**: Should be in `src/api/routes/users.js`
- **Documented**: `docs/api/endpoints.md:57-67`
- **Severity**: High
- **Impact**: Password reset flow incomplete

### 1.3 Product Update Endpoint
- **Feature**: US-014 Product Management (Admin)
- **Expected**: `PUT /api/products/:id`
- **Actual**: Not implemented
- **Location**: Should be in `src/api/routes/products.js`
- **Documented**: `docs/api/endpoints.md:245-265`
- **Severity**: High
- **Impact**: Admins cannot update products

### 1.4 Inventory Tracking Feature
- **Feature**: US-008 Inventory Tracking
- **Expected**: Low inventory alerts (< 10 units)
- **Actual**: Not implemented
- **Location**: Should be in `src/services/` or `src/models/Product.js`
- **Documented**: `docs/requirements/feature-list.md:95-105`
- **Severity**: Medium
- **Impact**: Cannot proactively manage inventory

### 1.5 Admin Dashboard Endpoint
- **Feature**: US-013 Admin Dashboard
- **Expected**: `GET /api/admin/dashboard`
- **Actual**: Not implemented
- **Location**: Should be in `src/api/routes/admin.js` (file doesn't exist)
- **Documented**: `docs/api/endpoints.md:445-465`
- **Severity**: Medium
- **Impact**: Admin users lack dashboard access

---

## 2. Undocumented Features (3 total)

### 2.1 Product Recommendations Endpoint
- **Actual**: `GET /api/products/recommendations/:id`
- **Expected**: No documentation found
- **Location**: `src/api/routes/products.js:145-165`
- **Severity**: Medium
- **Impact**: Integration point not documented, maintenance risk

### 2.2 Order Status Webhook
- **Actual**: `POST /api/orders/webhook/status`
- **Expected**: No documentation found
- **Location**: `src/api/routes/orders.js:235-253`
- **Severity**: Medium
- **Impact**: External integration not documented, potential security concern

### 2.3 User Profile Image Field
- **Actual**: `profileImage` field in User model
- **Expected**: Not in data model specification
- **Location**: `src/models/User.js:35-37`
- **Severity**: Low
- **Impact**: Field exists but not documented

---

## 3. API Specification Mismatches (3 total)

### 3.1 Product Search Method and Path
- **Expected**: `GET /api/products` with query parameters
- **Actual**: `POST /api/products/search` with body parameters
- **Location**: `src/api/routes/products.js:8-65`
- **Documented**: `docs/api/endpoints.md:145-175`
- **Severity**: High
- **Differences**:
  1. HTTP Method: GET (spec) vs POST (implementation)
  2. Endpoint Path: `/api/products` (spec) vs `/api/products/search` (implementation)
  3. Parameter Location: Query string (spec) vs Request body (implementation)
  4. Extra Parameter: `filters` not in specification
- **Impact**: API consumers following documentation will fail

### 3.2 Product Search Extra Parameter
- **Expected**: Parameters: `page`, `limit`, `category`, `search`, `sort`, `order`
- **Actual**: Additional `filters` parameter with `minPrice`, `maxPrice`, `inStock`
- **Location**: `src/api/routes/products.js:15-16`
- **Documented**: `docs/api/endpoints.md:150-155`
- **Severity**: High
- **Impact**: Undocumented functionality, API contract unclear

### 3.3 Missing GET /api/products Endpoint
- **Expected**: `GET /api/products` for listing products
- **Actual**: Only `POST /api/products/search` exists
- **Location**: `src/api/routes/products.js`
- **Documented**: `docs/api/endpoints.md:145`
- **Severity**: High
- **Impact**: Standard product listing endpoint missing

---

## 4. Data Model Inconsistencies (3 total)

### 4.1 User Email Field Not Required
- **Expected**: `email` field required: true
- **Actual**: `email` field required: false
- **Location**: `src/models/User.js:12`
- **Documented**: `docs/design/data-models.md:15`
- **Severity**: Critical
- **Impact**: 
  - Users can be created without email addresses
  - Password reset functionality will fail
  - Violates authentication requirements
  - Data integrity issue

### 4.2 Order Missing deliveredAt Field
- **Expected**: `deliveredAt` field (Date, optional)
- **Actual**: Field not present in schema
- **Location**: `src/models/Order.js` (field missing around line 100)
- **Documented**: `docs/design/data-models.md:145`
- **Severity**: Medium
- **Impact**: Cannot track delivery timestamps, incomplete order lifecycle

### 4.3 User Extra profileImage Field
- **Expected**: Field not in specification
- **Actual**: `profileImage` field exists
- **Location**: `src/models/User.js:35-37`
- **Documented**: Not in `docs/design/data-models.md`
- **Severity**: Low (duplicate of 2.3, different perspective)
- **Impact**: Undocumented field in data model

---

## Detection Confidence Levels

### High Confidence (Expected: 11 findings)
1. Password reset endpoints missing (exact match)
2. Product update endpoint missing (exact match)
3. User email not required (exact field match)
4. Order deliveredAt missing (exact field match)
5. Product search method mismatch (clear difference)
6. Product recommendations undocumented (code exists, no docs)
7. Order webhook undocumented (code exists, no docs)
8. User profileImage undocumented (field exists, no docs)
9. Admin dashboard missing (exact match)
10. Product search path mismatch (clear difference)
11. Filters parameter extra (clear addition)

### Medium Confidence (Expected: 2 findings)
1. Inventory tracking feature (behavior-based, may be partial)
2. GET /api/products missing (may be intentional design choice)

### Low Confidence (Expected: 1 finding)
1. Any fuzzy matches or ambiguous cases

---

## Coverage Expectations

### Feature Coverage
- **Total Documented Features**: 14 required + 1 future = 15
- **Implemented Features**: ~12-13
- **Expected Coverage**: 85-90%

### API Coverage
- **Total Documented Endpoints**: 17 endpoints
- **Matching Endpoints**: ~14-15
- **Expected Coverage**: 88-92%

### Data Model Coverage
- **Total Documented Fields**: ~35 fields across 3 models
- **Matching Fields**: ~33-34
- **Expected Coverage**: 95-98%

---

## Testing Checklist

When testing Discrepancy Detection mode, verify it finds:

**Missing Implementations**:
- [ ] POST /api/users/reset-password
- [ ] POST /api/users/reset-password/confirm
- [ ] PUT /api/products/:id
- [ ] Inventory tracking alerts
- [ ] GET /api/admin/dashboard

**Undocumented Features**:
- [ ] GET /api/products/recommendations/:id
- [ ] POST /api/orders/webhook/status
- [ ] User.profileImage field

**API Mismatches**:
- [ ] Product search method (GET vs POST)
- [ ] Product search path (/products vs /products/search)
- [ ] Product search extra filters parameter

**Data Model Issues**:
- [ ] User.email not required
- [ ] Order.deliveredAt missing
- [ ] User.profileImage undocumented

**Metrics**:
- [ ] Feature coverage calculated correctly
- [ ] API coverage calculated correctly
- [ ] Data model coverage calculated correctly
- [ ] Severity levels assigned appropriately
- [ ] Confidence scores reasonable

---

## Expected Report Sections

A complete discrepancy report should include:

1. **Executive Summary**
   - Total discrepancies found
   - Severity breakdown
   - Coverage metrics
   - Key findings

2. **Coverage Analysis**
   - Feature coverage percentage
   - API coverage percentage
   - Data model coverage percentage
   - Module coverage percentage

3. **Critical Findings** (2 expected)
   - User email not required
   - (Potentially) Password reset missing

4. **High Severity Findings** (6 expected)
   - Password reset endpoints
   - Product update endpoint
   - Product search mismatches

5. **Medium Severity Findings** (5 expected)
   - Inventory tracking
   - Admin dashboard
   - Undocumented features

6. **Low Severity Findings** (1 expected)
   - Extra fields

7. **Recommendations**
   - Prioritized action items
   - Specific fixes for each issue

8. **Metrics Dashboard**
   - Time to first report
   - True positive rate estimate
   - False positive rate estimate

---

## Notes for BA Review

### High Priority Items (Review First)
1. User email field not required - **Critical data integrity issue**
2. Password reset missing - **Security feature gap**
3. Product search API mismatch - **Breaking change for consumers**

### Medium Priority Items
1. Undocumented features - **Maintenance and integration risk**
2. Missing admin features - **Incomplete functionality**

### Low Priority Items
1. Extra undocumented fields - **Documentation gap only**

### Auto-Approval Candidates
- Low severity findings with high confidence
- Documentation-only issues
- Non-breaking additions

---

## Success Criteria

The Discrepancy Detection mode should:
- ✅ Find 12-14 of the 14 intentional discrepancies
- ✅ Correctly classify severity (Critical, High, Medium, Low)
- ✅ Assign appropriate confidence scores (>85% high confidence)
- ✅ Calculate accurate coverage metrics (85-95% range)
- ✅ Provide clear evidence (file paths, line numbers)
- ✅ Generate actionable recommendations
- ✅ Complete initial scan in <5 minutes
- ✅ Present findings clearly for BA review

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-26  
**Total Discrepancies**: 14