# Testing Implementation Guide

## Quick Start Guide

This document provides step-by-step instructions to implement the comprehensive testing strategy outlined in the QA Matrix.

## 🚀 Immediate Action Items (Week 1)

### 1. Setup Frontend Testing Infrastructure

```bash
# Navigate to frontend directory
cd frontend

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 jsdom
npm install --save-dev msw factory-girl

# Add test scripts to package.json
```

**Update package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui", 
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### 2. Setup Backend Testing Infrastructure

```bash
# Navigate to backend directory
cd backend

# Install testing dependencies
pip install pytest-django coverage factory-boy pytest-xdist

# Create pytest configuration (already provided)
# pytest.ini file has been created

# Add test management command
```

### 3. Run Initial Tests

```bash
# Frontend tests
cd frontend
npm run test:run

# Backend tests  
cd backend
python -m pytest tests/ -v

# Or using Django test runner
python manage.py test --settings=dashboard_project.test_settings
```

## 📋 Critical Fixes Required

### Fix #1: Data Processing Validation (CRITICAL)
**Location**: `frontend/src/contexts/DashboardContext.jsx`

```javascript
// BEFORE (vulnerable)
const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
if (dmy) {
  const dd = dmy[1].padStart(2, '0');
  const mm = dmy[2].padStart(2, '0');
  // No validation of logical date ranges
}

// AFTER (secure)
const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
if (dmy) {
  const day = parseInt(dmy[1], 10);
  const month = parseInt(dmy[2], 10);
  const year = parseInt(dmy[3], 10);
  
  // Validate logical ranges
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    return null;
  }
  
  // Check if date is actually valid
  const testDate = new Date(year, month - 1, day);
  if (testDate.getFullYear() !== year || 
      testDate.getMonth() !== month - 1 || 
      testDate.getDate() !== day) {
    return null;
  }
  
  const dd = day.toString().padStart(2, '0');
  const mm = month.toString().padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
```

### Fix #2: Add React Error Boundaries
**Create**: `frontend/src/components/ErrorBoundary.jsx`

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo salió mal</h2>
          <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Update**: `frontend/src/App.jsx`
```javascript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        {/* existing app content */}
      </Router>
    </ErrorBoundary>
  );
}
```

### Fix #3: Secure JWT Token Storage
**Update**: `frontend/src/services/apiService.js`

```javascript
// BEFORE (insecure)
localStorage.setItem('token', token);

// AFTER (more secure)
class TokenManager {
  static setToken(token) {
    // Use sessionStorage instead of localStorage for auto-cleanup
    sessionStorage.setItem('auth_token', token);
    
    // Set expiration check
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    sessionStorage.setItem('token_expires', expirationTime.toString());
  }
  
  static getToken() {
    const token = sessionStorage.getItem('auth_token');
    const expires = sessionStorage.getItem('token_expires');
    
    if (!token || !expires) return null;
    
    if (Date.now() > parseInt(expires)) {
      this.clearToken();
      return null;
    }
    
    return token;
  }
  
  static clearToken() {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token_expires');
  }
  
  static isTokenValid() {
    return this.getToken() !== null;
  }
}
```

### Fix #4: Add Input Sanitization
**Create**: `backend/dashboard_api/utils/sanitization.py`

```python
import re
import html
from django.utils.html import strip_tags

def sanitize_excel_input(value):
    """Sanitize input from Excel files"""
    if not value:
        return value
    
    # Convert to string
    str_value = str(value).strip()
    
    # Remove dangerous characters
    str_value = re.sub(r'[<>"\';\\]', '', str_value)
    
    # HTML escape
    str_value = html.escape(str_value)
    
    # Strip HTML tags
    str_value = strip_tags(str_value)
    
    return str_value

def validate_coordinate(coord_value):
    """Validate coordinate values"""
    try:
        coord = float(coord_value)
        
        # Basic range validation (adjust for your geographic area)
        if not (-90 <= coord <= 90) and not (-180 <= coord <= 180):
            return None
            
        # Filter (0,0) coordinates as likely invalid
        if coord == 0:
            return None
            
        return coord
    except (ValueError, TypeError):
        return None
```

## 📊 Testing Implementation Priority

### Phase 1: Unit Tests (Week 1-2)
1. **DashboardContext utilities** ✅ (Already created)
2. **Backend models** ✅ (Already created)  
3. **API endpoints** ✅ (Already created)
4. **Data processing functions**

### Phase 2: Integration Tests (Week 3)
1. **Component integration tests**
2. **API integration tests**
3. **Database operations**

### Phase 3: E2E Tests (Week 4)
1. **User authentication flows** ✅ (Already created)
2. **Data upload workflows**
3. **Filtering and visualization**

### Phase 4: Performance & Security (Week 5-6)
1. **Load testing with large datasets**
2. **Security vulnerability scanning**
3. **Performance optimization**

## 🛠️ Running Tests

### Frontend Tests
```bash
cd frontend

# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch

# Run UI mode for debugging
npm run test:ui
```

### Backend Tests
```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=dashboard_api --cov-report=html

# Run specific test categories
python -m pytest tests/ -m "unit"
python -m pytest tests/ -m "integration"
python -m pytest tests/ -m "security"

# Run fast tests only
python -m pytest tests/ -m "not slow"
```

### E2E Tests
```bash
cd tests

# Install dependencies
npm install @playwright/test
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium
```

## 📈 Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Frontend Utils | 90% | 🔨 In Progress |
| Backend Models | 85% | 🔨 In Progress |
| API Endpoints | 80% | 🔨 In Progress |
| React Components | 75% | ❌ Not Started |
| E2E Workflows | 80% | 🔨 In Progress |

## 🚨 Quality Gates

Before any deployment:

1. **All tests must pass** ✅
2. **Coverage ≥ 80%** ✅  
3. **No critical security vulnerabilities** ✅
4. **Performance benchmarks met** ✅
5. **ESLint passes with no errors** ✅

## 📝 Test Data Management

### Creating Test Data

**Frontend Test Data**:
```javascript
// frontend/src/test/fixtures/testData.js
export const mockProcedimientos = [
  {
    ID_OPERATIVO: 'OP001',
    PROVINCIA: 'Buenos Aires',
    FECHA: '15/03/2025',
    LATITUD: -34.6037,
    LONGITUD: -58.3816,
    DESCRIPCION: 'Test procedure'
  }
  // Add more test data
];
```

**Backend Test Data**:
```python
# backend/tests/factories.py
import factory
from dashboard_api.models import GeografiaProcedimiento

class ProcedimientoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GeografiaProcedimiento
    
    id_operativo = factory.Sequence(lambda n: f"OP{n:05d}")
    provincia = factory.Iterator(['Buenos Aires', 'Córdoba', 'Santa Fe'])
    fecha_iso = factory.Faker('date_this_year')
```

## 🔧 IDE Setup

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.pylint", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

### Settings
```json
{
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["tests"],
  "eslint.workingDirectories": ["frontend"],
  "editor.formatOnSave": true,
  "python.linting.enabled": true
}
```

## 📚 Resources and Documentation

### Testing Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Django Testing Documentation](https://docs.djangoproject.com/en/5.0/topics/testing/)

### Security Testing
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Django Security Documentation](https://docs.djangoproject.com/en/5.0/topics/security/)

## 🎯 Success Metrics

Track these metrics weekly:

1. **Test Coverage**: Aim for 80%+ across all components
2. **Test Execution Time**: Keep under 5 minutes for full suite
3. **Flaky Test Rate**: Keep under 5%
4. **Bug Detection Rate**: Tests should catch 90% of issues
5. **Performance**: No regression in load times

## 🔄 Continuous Improvement

### Weekly Reviews
- Review failed tests and fix immediately
- Update test coverage reports
- Review performance metrics
- Update test documentation

### Monthly Reviews  
- Analyze bug patterns and add preventive tests
- Review and update testing strategy
- Performance optimization based on metrics
- Security review and updates

---

**Next Steps:**
1. Implement critical fixes listed above
2. Run existing tests and fix any failures
3. Set up CI/CD pipeline with quality gates
4. Begin Phase 1 implementation following the schedule

**Questions or Issues:**
- Check the QA Matrix document for detailed technical specifications
- Review test files for implementation examples
- Refer to this guide for step-by-step instructions