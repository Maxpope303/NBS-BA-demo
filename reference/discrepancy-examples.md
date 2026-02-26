# Discrepancy Detection Examples

This document provides examples of common discrepancies to help the Discrepancy Detection mode identify and classify issues accurately.

---

## 1. Missing Implementation

### Example: Password Reset Endpoint

**Design Artifact** (docs/api/endpoints.md):
```markdown
### POST /api/users/reset-password
Reset user password via email token
```

**Code Analysis** (src/api/routes/users.js):
```
No implementation found
```

**Classification**:
- **Type**: Missing Implementation
- **Severity**: High
- **Confidence**: High
- **Impact**: Critical user functionality unavailable

**Report Entry**:
```markdown
#### Missing Implementation: Password Reset Endpoint

**Expected**: POST /api/users/reset-password
**Actual**: Not implemented
**Location**: Should be in src/api/routes/users.js
**Documented**: docs/api/endpoints.md:45-55

**Recommendation**: Implement password reset endpoint according to specification
```

---

## 2. Undocumented Feature

### Example: Product Recommendations Endpoint

**Code Implementation** (src/api/routes/products.js):
```javascript
router.get('/recommendations/:id', async (req, res) => {
  // Returns product recommendations
});
```

**Design Artifact Analysis**:
- Not mentioned in docs/api/endpoints.md
- Not mentioned in docs/requirements/feature-list.md

**Classification**:
- **Type**: Undocumented Implementation
- **Severity**: Medium
- **Confidence**: High
- **Impact**: Integration point not documented, maintenance risk

**Report Entry**:
```markdown
#### Undocumented Feature: Product Recommendations

**Actual**: GET /api/products/recommendations/:id
**Expected**: No documentation found
**Location**: src/api/routes/products.js:145-165

**Recommendation**: Add endpoint documentation to API specification
```

---

## 3. API Specification Mismatch

### Example: Product Search Method

**Design Artifact** (docs/api/endpoints.md):
```yaml
GET /api/products
Query Parameters: page, limit, category, search
```

**Code Implementation** (src/api/routes/products.js):
```javascript
router.post('/search', async (req, res) => {
  const { query, category, filters } = req.body;
});
```

**Classification**:
- **Type**: Specification Mismatch
- **Severity**: High
- **Confidence**: High
- **Impact**: API consumers following documentation will fail

**Differences**:
1. HTTP Method: GET (spec) vs POST (implementation)
2. Endpoint Path: /api/products (spec) vs /api/products/search (implementation)
3. Parameter Location: Query string (spec) vs Request body (implementation)
4. Extra Parameter: 'filters' not in specification

**Report Entry**:
```markdown
#### API Mismatch: Product Search

**Expected**: GET /api/products with query params
**Actual**: POST /api/products/search with body params
**Severity**: High - Breaking change for API consumers

**Recommendation**: Choose one approach and update accordingly
```

---

## 4. Data Model Inconsistency

### Example: User Email Field

**Design Artifact** (docs/design/data-models.md):
```markdown
| email | String | Yes | Yes | - | User email address |
```

**Code Implementation** (src/models/User.js):
```javascript
email: {
  type: String,
  required: false,  // Should be true
  unique: true
}
```

**Classification**:
- **Type**: Data Model Mismatch
- **Severity**: Critical
- **Confidence**: High
- **Impact**: Users can be created without email, violates business requirements

**Report Entry**:
```markdown
#### Data Model Inconsistency: User Email Required

**Expected**: email field required: true
**Actual**: email field required: false
**Location**: src/models/User.js:12
**Documented**: docs/design/data-models.md:15

**Impact**: 
- Users can be created without email addresses
- Password reset functionality will fail
- Violates authentication requirements

**Recommendation**: Update User model to make email required
```

---

## 5. Missing Data Model Field

### Example: Order deliveredAt Field

**Design Artifact** (docs/design/data-models.md):
```markdown
| deliveredAt | Date | No | - | - | Delivery timestamp |
```

**Code Implementation** (src/models/Order.js):
```javascript
// Field is missing from schema
cancelledAt: { type: Date }
// No deliveredAt field
```

**Classification**:
- **Type**: Missing Field
- **Severity**: Medium
- **Confidence**: High
- **Impact**: Cannot track delivery timestamps

**Report Entry**:
```markdown
#### Missing Field: Order deliveredAt

**Expected**: deliveredAt field in Order model
**Actual**: Field not present in schema
**Location**: src/models/Order.js
**Documented**: docs/design/data-models.md:145

**Recommendation**: Add deliveredAt field to Order schema
```

---

## 6. Extra Data Model Field

### Example: User profileImage Field

**Code Implementation** (src/models/User.js):
```javascript
profileImage: {
  type: String
}
```

**Design Artifact Analysis**:
- Not mentioned in docs/design/data-models.md

**Classification**:
- **Type**: Undocumented Field
- **Severity**: Low
- **Confidence**: High
- **Impact**: Field exists but not documented

**Report Entry**:
```markdown
#### Undocumented Field: User profileImage

**Actual**: profileImage field in User model
**Expected**: Not in specification
**Location**: src/models/User.js:35-37

**Recommendation**: Add field to data model documentation
```

---

## 7. Architecture Violation

### Example: Business Logic in Route Handler

**Design Artifact** (docs/architecture/system-architecture.md):
```markdown
Routes Layer: Handle HTTP requests/responses, delegate to service layer
Service Layer: Business logic and transaction management
```

**Code Implementation** (src/api/routes/users.js):
```javascript
router.post('/', async (req, res) => {
  // Direct database access in route
  const user = await User.create({ ... });
  
  // Business logic in route
  if (user.email.endsWith('@admin.com')) {
    user.role = 'admin';
  }
});
```

**Classification**:
- **Type**: Architecture Violation
- **Severity**: High
- **Confidence**: High
- **Impact**: Reduced testability, code duplication risk

**Report Entry**:
```markdown
#### Architecture Violation: Business Logic in Routes

**Expected**: Routes delegate to service layer
**Actual**: Business logic and database access in route handler
**Location**: src/api/routes/users.js:15-35

**Violations**:
1. Direct database access (User.create)
2. Business logic (admin role assignment)
3. No service layer usage

**Recommendation**: Refactor to follow layered architecture
```

---

## False Positive Patterns

### Pattern 1: Naming Variations

**Scenario**: Field names with different casing

**Spec**: `firstName` (camelCase)
**Code**: `first_name` (snake_case)

**Classification**: Likely NOT a discrepancy if semantically equivalent

**Mitigation**: Use fuzzy matching for field names

---

### Pattern 2: Implementation Details

**Scenario**: Spec describes behavior, code shows implementation

**Spec**: "System validates email format"
**Code**: Uses regex pattern for validation

**Classification**: NOT a discrepancy - implementation detail

**Mitigation**: Focus on behavior, not implementation

---

### Pattern 3: Optional vs Required Context

**Scenario**: Field marked optional but has default value

**Spec**: `role` field optional
**Code**: `role` field has default value 'user'

**Classification**: NOT a discrepancy - default satisfies optional

**Mitigation**: Consider defaults when checking required fields

---

## Confidence Scoring Guidelines

### High Confidence (95-100%)
- Exact name match with clear difference
- Missing documented feature with no code evidence
- Clear specification violation
- Documented field completely absent

### Medium Confidence (70-94%)
- Similar but not exact name match
- Possible implementation in unexpected location
- Ambiguous specification language
- Partial implementation found

### Low Confidence (50-69%)
- Fuzzy name match
- Implementation details vs specification
- Synonyms or alternative naming
- Context-dependent interpretation

---

## Severity Guidelines

### Critical
- Security vulnerabilities
- Data integrity issues
- Breaking changes for users
- Required fields missing

### High
- Missing core functionality
- API breaking changes
- Major specification mismatches
- Architecture violations

### Medium
- Undocumented features
- Minor API differences
- Missing optional fields
- Documentation gaps

### Low
- Extra undocumented fields
- Minor naming differences
- Implementation details
- Non-critical documentation gaps

---

## Common Discrepancy Types Summary

| Type | Typical Severity | Common Causes |
|------|-----------------|---------------|
| Missing Implementation | High | Feature not yet developed |
| Undocumented Feature | Medium | Documentation not updated |
| API Mismatch | High | Spec and code diverged |
| Data Model Inconsistency | Critical | Schema changes not synced |
| Missing Field | Medium | Incomplete implementation |
| Extra Field | Low | Feature added without docs |
| Architecture Violation | High | Shortcuts taken in code |

---

## Best Practices for Detection

1. **Always provide evidence**: Include file paths and line numbers
2. **Consider context**: Implementation details may differ from specs
3. **Use fuzzy matching**: Handle naming convention differences
4. **Check semantics**: Focus on behavior, not just names
5. **Validate confidence**: Flag uncertain findings for BA review
6. **Prioritize by impact**: Critical issues first
7. **Provide recommendations**: Suggest specific actions
8. **Cross-reference**: Check multiple documentation sources