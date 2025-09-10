# QA Matrix - Dashboard de Operaciones de Seguridad

## Executive Summary

Este documento presenta un análisis integral de QA para el dashboard de operaciones de seguridad, un sistema full-stack con React/Django que procesa y visualiza datos operacionales de fuerzas de seguridad.

### Critical Findings
- **📋 No existe infraestructura de testing automatizada**
- **🔐 JWT authentication sin validación de edge cases**
- **📊 Data processing pipeline vulnerable a datos malformados**
- **🗺️ Coordenadas geográficas sin validación robusta**
- **📱 Responsive design no testeado sistemáticamente**

---

## 1. Test Strategy & Approach

### 1.1 Testing Pyramid Strategy

```
    E2E Tests (15%)
   ╔═══════════════════╗
   ║ Browser automation ║
   ║ User workflows     ║
   ╚═══════════════════╝
         
  Integration Tests (35%)
  ╔══════════════════════════╗
  ║ API endpoints           ║
  ║ Database operations     ║
  ║ Component integration   ║
  ╚══════════════════════════╝
           
    Unit Tests (50%)
    ╔═══════════════════════════════╗
    ║ Data processing functions    ║
    ║ Component methods           ║
    ║ Business logic             ║
    ╚═══════════════════════════════╝
```

### 1.2 Risk-Based Testing Priority

| Priority | Component | Risk Level | Impact |
|----------|-----------|------------|---------|
| P1 | Data Processing Pipeline | CRITICAL | System corruption, data loss |
| P1 | Authentication/Authorization | CRITICAL | Security breach |
| P1 | Excel Upload/Processing | HIGH | Data integrity |
| P2 | Map Visualization | HIGH | User experience |
| P2 | Chart Rendering | MEDIUM | Data interpretation |
| P3 | UI Responsive Design | MEDIUM | Accessibility |

---

## 2. Identified Issues & Vulnerabilities

### 2.1 CRITICAL Issues

#### 🚨 Issue #1: Data Processing Pipeline Vulnerabilities
**Location**: `frontend/src/contexts/DashboardContext.jsx:41-120`
**Severity**: CRITICAL
**Description**: 
- `parseDateToISO()` function vulnerable to malformed date inputs
- No validation for coordinate ranges beyond basic checks
- Province normalization can fail with Unicode edge cases

```javascript
// Problematic code:
const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
if (dmy) {
  const dd = dmy[1].padStart(2, '0');
  const mm = dmy[2].padStart(2, '0');
  // No validation of logical date ranges (e.g., month > 12)
}
```

**Recommended Fix**: Add comprehensive validation layer

#### 🚨 Issue #2: Authentication Token Management
**Location**: `frontend/src/services/apiService.js`
**Severity**: CRITICAL
**Description**:
- JWT tokens stored in localStorage without encryption
- No automatic token refresh mechanism
- Token expiration not handled gracefully

#### 🚨 Issue #3: Excel Upload SQL Injection Risk
**Location**: `backend/dashboard_api/views.py`
**Severity**: CRITICAL
**Description**:
- Direct Excel data insertion without proper sanitization
- Dynamic field mapping vulnerable to malicious field names

### 2.2 HIGH Priority Issues

#### ⚠️ Issue #4: Map Coordinate Validation
**Location**: `frontend/src/contexts/DashboardContext.jsx:95-140`
**Severity**: HIGH
**Description**:
- Coordinates (0,0) filtered but other invalid combinations allowed
- No validation for coordinates outside expected geographic boundaries (Argentina)

#### ⚠️ Issue #5: Error Boundary Missing
**Location**: Global React application
**Severity**: HIGH
**Description**:
- No React error boundaries implemented
- JavaScript errors can crash entire application

### 2.3 MEDIUM Priority Issues

#### ⚠️ Issue #6: Data Consistency Validation
**Location**: `frontend/src/contexts/DashboardContext.jsx:447-475`
**Severity**: MEDIUM
**Description**:
- Consistency check only logs warnings, doesn't prevent data corruption
- 10% tolerance may be too permissive for critical security data

---

## 3. Test Cases by Component

### 3.1 Frontend Testing

#### 3.1.1 DashboardContext Unit Tests
```javascript
// Test cases for data processing utilities
describe('DashboardContext Utilities', () => {
  describe('parseDateToISO', () => {
    test('should parse Argentine date format dd/MM/yyyy', () => {
      expect(parseDateToISO('15/03/2025')).toBe('2025-03-15');
    });
    
    test('should handle invalid dates gracefully', () => {
      expect(parseDateToISO('32/13/2025')).toBe(null);
      expect(parseDateToISO('malformed')).toBe(null);
      expect(parseDateToISO('')).toBe(null);
    });
    
    test('should validate year ranges', () => {
      expect(parseDateToISO('01/01/1800')).toBe(null);
      expect(parseDateToISO('01/01/2200')).toBe(null);
    });
  });
  
  describe('normalizeProvinceKey', () => {
    test('should normalize CABA variants', () => {
      expect(normalizeProvinceKey('CABA')).toBe('ciudad autonoma de buenos aires');
      expect(normalizeProvinceKey('Capital Federal')).toBe('ciudad autonoma de buenos aires');
    });
    
    test('should handle Unicode characters', () => {
      expect(normalizeProvinceKey('Córdoba')).toBe('cordoba');
      expect(normalizeProvinceKey('Tucumán')).toBe('tucuman');
    });
    
    test('should handle edge cases', () => {
      expect(normalizeProvinceKey(null)).toBe('');
      expect(normalizeProvinceKey(undefined)).toBe('');
      expect(normalizeProvinceKey(0)).toBe('0');
    });
  });
  
  describe('getCoordinatesFromItem', () => {
    test('should extract coordinates from various field names', () => {
      const item1 = { LATITUD: -34.6037, LONGITUD: -58.3816 };
      expect(getCoordinatesFromItem(item1)).toEqual({ lat: -34.6037, lng: -58.3816 });
      
      const item2 = { latitud_decimal: -34.6037, longitud_decimal: -58.3816 };
      expect(getCoordinatesFromItem(item2)).toEqual({ lat: -34.6037, lng: -58.3816 });
    });
    
    test('should validate coordinate ranges', () => {
      const invalid1 = { LATITUD: 91, LONGITUD: -58.3816 };
      expect(getCoordinatesFromItem(invalid1)).toEqual({ lat: null, lng: null });
      
      const invalid2 = { LATITUD: -34.6037, LONGITUD: 181 };
      expect(getCoordinatesFromItem(invalid2)).toEqual({ lat: null, lng: null });
    });
    
    test('should filter (0,0) coordinates', () => {
      const zero = { LATITUD: 0, LONGITUD: 0 };
      expect(getCoordinatesFromItem(zero)).toEqual({ lat: null, lng: null });
    });
  });
});
```

#### 3.1.2 Component Integration Tests
```javascript
describe('Dashboard Components Integration', () => {
  test('Filter changes should update map markers', async () => {
    render(<Dashboard />);
    
    // Apply province filter
    const provinceFilter = screen.getByLabelText(/provincia/i);
    fireEvent.change(provinceFilter, { target: { value: 'Buenos Aires' } });
    
    // Verify map updates
    await waitFor(() => {
      const markers = screen.getAllByTestId('map-marker');
      expect(markers.every(marker => 
        marker.dataset.province === 'buenos aires'
      )).toBe(true);
    });
  });
  
  test('Data upload should refresh visualizations', async () => {
    const { container } = render(<Dashboard />);
    
    // Upload Excel file
    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['test data'], 'test.xlsx');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Verify charts and tables update
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.getByTestId('statistics-chart')).toBeInTheDocument();
    });
  });
});
```

### 3.2 Backend Testing

#### 3.2.1 Model Validation Tests
```python
class TestGeografiaProcedimientoModel(TestCase):
    def test_province_normalization(self):
        """Test provincia_key generation"""
        procedimiento = GeografiaProcedimiento(
            id_operativo='OP001',
            provincia='Ciudad Autónoma de Buenos Aires'
        )
        procedimiento.save()
        
        self.assertEqual(
            procedimiento.provincia_key, 
            'ciudad autonoma de buenos aires'
        )
    
    def test_date_parsing(self):
        """Test fecha_iso generation from various formats"""
        test_cases = [
            ('15/03/2025', '2025-03-15'),
            ('2025-03-15', '2025-03-15'),
            ('invalid', None),
            ('32/13/2025', None),
        ]
        
        for input_date, expected in test_cases:
            procedimiento = GeografiaProcedimiento(
                id_operativo=f'OP{id}',
                fecha=input_date
            )
            procedimiento.save()
            
            if expected:
                self.assertEqual(str(procedimiento.fecha_iso), expected)
            else:
                self.assertIsNone(procedimiento.fecha_iso)
    
    def test_coordinate_validation(self):
        """Test coordinate field validation"""
        # Valid coordinates
        procedimiento = GeografiaProcedimiento(
            id_operativo='OP001',
            latitud=-34.6037,
            longitud=-58.3816
        )
        procedimiento.save()
        
        # Invalid coordinates should raise validation error
        with self.assertRaises(ValidationError):
            invalid = GeografiaProcedimiento(
                id_operativo='OP002',
                latitud=91,  # Invalid latitude
                longitud=-58.3816
            )
            invalid.full_clean()
```

#### 3.2.2 API Endpoint Tests
```python
class TestDashboardAPI(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            role='admin'
        )
        self.viewer_user = User.objects.create_user(
            username='viewer', 
            password='viewer123',
            role='viewer'
        )
    
    def test_authentication_required(self):
        """Test protected endpoints require authentication"""
        response = self.client.get('/api/data/categorized/')
        self.assertEqual(response.status_code, 401)
    
    def test_excel_upload_permissions(self):
        """Test Excel upload requires admin role"""
        # Viewer should be denied
        self.client.force_authenticate(user=self.viewer_user)
        response = self.client.post('/api/upload-excel/')
        self.assertEqual(response.status_code, 403)
        
        # Admin should be allowed
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/upload-excel/')
        # Should fail with validation error, not permission error
        self.assertNotEqual(response.status_code, 403)
    
    def test_data_filtering(self):
        """Test data filtering by date and province"""
        # Create test data
        proc1 = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            provincia='Buenos Aires',
            fecha_iso='2025-01-15'
        )
        proc2 = GeografiaProcedimiento.objects.create(
            id_operativo='OP002', 
            provincia='Córdoba',
            fecha_iso='2025-02-15'
        )
        
        self.client.force_authenticate(user=self.viewer_user)
        
        # Filter by province
        response = self.client.get('/api/data/categorized/?province=Buenos Aires')
        self.assertEqual(response.status_code, 200)
        
        # Filter by date range
        response = self.client.get('/api/data/categorized/?from_date=2025-01-01&to_date=2025-01-31')
        self.assertEqual(response.status_code, 200)
```

### 3.3 Excel Processing Tests

```python
class TestExcelProcessing(TestCase):
    def test_malformed_excel_handling(self):
        """Test handling of malformed Excel files"""
        # Create malformed Excel file
        malformed_content = b'invalid excel content'
        
        with self.assertRaises(ValidationError):
            process_excel_file(malformed_content)
    
    def test_missing_required_columns(self):
        """Test Excel with missing required columns"""
        # Create Excel with missing ID_OPERATIVO column
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(['PROVINCIA', 'FECHA'])  # Missing ID_OPERATIVO
        ws.append(['Buenos Aires', '15/03/2025'])
        
        with self.assertRaises(ValidationError) as context:
            process_excel_sheet(ws, 'test_sheet')
        
        self.assertIn('ID_OPERATIVO', str(context.exception))
    
    def test_sql_injection_prevention(self):
        """Test prevention of SQL injection through Excel data"""
        malicious_data = [
            "'; DROP TABLE geografia_procedimiento; --",
            "<script>alert('xss')</script>",
            "../../etc/passwd"
        ]
        
        for malicious_input in malicious_data:
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.append(['ID_OPERATIVO', 'PROVINCIA'])
            ws.append([malicious_input, 'Buenos Aires'])
            
            # Should not raise exception or execute malicious code
            result = process_excel_sheet(ws, 'test_sheet')
            self.assertIsNotNone(result)
```

### 3.4 End-to-End Test Scenarios

#### 3.4.1 Complete User Workflows
```javascript
// Using Playwright for E2E testing
describe('Complete User Workflows', () => {
  test('Admin Upload and Data Visualization Flow', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to upload
    await page.click('[data-testid="upload-tab"]');
    
    // Upload Excel file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test_upload.xlsx');
    await page.click('[data-testid="upload-button"]');
    
    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]');
    
    // Navigate to dashboard
    await page.click('[data-testid="dashboard-tab"]');
    
    // Verify data appears in table
    await expect(page.locator('[data-testid="data-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-row"]')).toHaveCount.greaterThan(0);
    
    // Verify map shows markers
    await expect(page.locator('[data-testid="map-marker"]')).toHaveCount.greaterThan(0);
    
    // Test filtering
    await page.selectOption('[data-testid="province-filter"]', 'Buenos Aires');
    await page.waitForTimeout(1000); // Wait for filter to apply
    
    // Verify filtered results
    const markers = page.locator('[data-testid="map-marker"]');
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);
  });
  
  test('Viewer Access Restrictions', async ({ page }) => {
    // Login as viewer
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="username"]', 'viewer');
    await page.fill('[data-testid="password"]', 'viewer123');
    await page.click('[data-testid="login-button"]');
    
    // Verify upload tab is disabled/hidden
    await expect(page.locator('[data-testid="upload-tab"]')).not.toBeVisible();
    
    // Verify can access dashboard
    await expect(page.locator('[data-testid="dashboard-tab"]')).toBeVisible();
    await page.click('[data-testid="dashboard-tab"]');
    
    // Verify can view data but not modify
    await expect(page.locator('[data-testid="data-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-button"]')).not.toBeVisible();
  });
});
```

---

## 4. Performance Testing Requirements

### 4.1 Load Testing Scenarios

| Scenario | Concurrent Users | Data Volume | Expected Response Time |
|----------|-----------------|-------------|----------------------|
| Normal Load | 10 users | 1,000 records | < 2 seconds |
| Peak Load | 50 users | 10,000 records | < 5 seconds |
| Stress Test | 100 users | 50,000 records | < 10 seconds |

### 4.2 Performance Test Cases

```python
class PerformanceTests(TestCase):
    def test_large_dataset_filtering(self):
        """Test filtering performance with large datasets"""
        # Create 10,000 test records
        procedimientos = []
        for i in range(10000):
            procedimientos.append(GeografiaProcedimiento(
                id_operativo=f'OP{i:05d}',
                provincia=random.choice(['Buenos Aires', 'Córdoba', 'Santa Fe']),
                fecha_iso=date.today() - timedelta(days=random.randint(0, 365))
            ))
        
        start_time = time.time()
        GeografiaProcedimiento.objects.bulk_create(procedimientos)
        creation_time = time.time() - start_time
        
        # Test filtering performance
        start_time = time.time()
        filtered = GeografiaProcedimiento.objects.filter(
            provincia_key='buenos aires',
            fecha_iso__gte='2025-01-01'
        )
        list(filtered)  # Execute query
        query_time = time.time() - start_time
        
        self.assertLess(creation_time, 30)  # Bulk creation < 30s
        self.assertLess(query_time, 2)      # Query < 2s
```

---

## 5. Security Testing

### 5.1 Authentication & Authorization Tests

```python
class SecurityTests(APITestCase):
    def test_jwt_token_expiration(self):
        """Test JWT token expiration handling"""
        # Create expired token
        expired_token = generate_jwt_token(self.user, expires_in_seconds=-3600)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {expired_token}')
        response = self.client.get('/api/data/categorized/')
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('expired', response.data['detail'].lower())
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention in filter parameters"""
        malicious_inputs = [
            "'; DROP TABLE geografia_procedimiento; --",
            "1 OR 1=1",
            "UNION SELECT * FROM auth_user"
        ]
        
        self.client.force_authenticate(user=self.viewer_user)
        
        for malicious_input in malicious_inputs:
            response = self.client.get(f'/api/data/categorized/?province={malicious_input}')
            
            # Should not cause server error or expose data
            self.assertIn(response.status_code, [200, 400])
            if response.status_code == 200:
                # Verify no data leak
                self.assertNotIn('password', str(response.data))
                self.assertNotIn('DROP', str(response.data))
    
    def test_xss_prevention(self):
        """Test XSS prevention in data display"""
        # Create procedimiento with XSS payload
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='<script>alert("xss")</script>',
            descripcion='<img src=x onerror=alert("xss")>',
            provincia='Buenos Aires'
        )
        
        self.client.force_authenticate(user=self.viewer_user)
        response = self.client.get('/api/data/categorized/')
        
        # Verify HTML is escaped
        response_content = str(response.data)
        self.assertNotIn('<script>', response_content)
        self.assertNotIn('onerror=', response_content)
```

---

## 6. Testing Infrastructure Setup

### 6.1 Frontend Testing Setup

#### 6.1.1 Install Testing Dependencies
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev vitest @vitest/ui jsdom
npm install --save-dev @playwright/test
```

#### 6.1.2 Vitest Configuration
```javascript
// vite.config.js - Add test configuration
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

#### 6.1.3 Test Setup File
```javascript
// src/test/setup.js
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Auto cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();
```

### 6.2 Backend Testing Setup

#### 6.2.1 Django Test Settings
```python
# backend/dashboard_project/test_settings.py
from .settings import *

# Use in-memory SQLite for faster tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable migrations for faster test setup
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Fast password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
```

#### 6.2.2 Test Command Setup
```python
# backend/management/commands/run_tests.py
from django.core.management.base import BaseCommand
from django.test.utils import get_runner
from django.conf import settings

class Command(BaseCommand):
    help = 'Run test suite with coverage'
    
    def add_arguments(self, parser):
        parser.add_argument('--coverage', action='store_true')
        parser.add_argument('--fast', action='store_true')
    
    def handle(self, *args, **options):
        if options['coverage']:
            import coverage
            cov = coverage.Coverage()
            cov.start()
        
        TestRunner = get_runner(settings)
        test_runner = TestRunner()
        
        if options['fast']:
            os.environ['DJANGO_SETTINGS_MODULE'] = 'dashboard_project.test_settings'
        
        failures = test_runner.run_tests(["dashboard_api"])
        
        if options['coverage']:
            cov.stop()
            cov.save()
            cov.report()
```

---

## 7. Automation Recommendations

### 7.1 CI/CD Pipeline Configuration

#### 7.1.1 GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ dev, main ]
  pull_request:
    branches: [ dev, main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install coverage pytest-django
    
    - name: Run tests with coverage
      run: |
        coverage run --source='.' manage.py test
        coverage xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

### 7.2 Automated Quality Gates

#### 7.2.1 Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-json
      - id: check-yaml
  
  - repo: local
    hooks:
      - id: frontend-lint
        name: Frontend ESLint
        entry: bash -c 'cd frontend && npm run lint'
        language: system
        files: ^frontend/
      
      - id: frontend-tests
        name: Frontend Unit Tests
        entry: bash -c 'cd frontend && npm run test:unit'
        language: system
        files: ^frontend/
        
      - id: backend-tests
        name: Backend Tests
        entry: bash -c 'cd backend && python manage.py test --fast'
        language: system
        files: ^backend/
```

---

## 8. Test Data Management

### 8.1 Test Data Factory
```python
# backend/dashboard_api/test_factories.py
import factory
from django.contrib.auth import get_user_model
from .models import GeografiaProcedimiento

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    role = 'viewer'

class AdminUserFactory(UserFactory):
    role = 'admin'

class GeografiaProcedimientoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GeografiaProcedimiento
    
    id_operativo = factory.Sequence(lambda n: f"OP{n:05d}")
    id_procedimiento = factory.Sequence(lambda n: f"PROC{n:05d}")
    provincia = factory.Iterator(['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza'])
    fecha_iso = factory.Faker('date_between', start_date='-1y', end_date='today')
    latitud = factory.Faker('pyfloat', left_digits=2, right_digits=6, min_value=-55, max_value=-20)
    longitud = factory.Faker('pyfloat', left_digits=2, right_digits=6, min_value=-73, max_value=-53)
```

### 8.2 Test Data Fixtures
```json
// frontend/src/test/fixtures/sampleData.json
{
  "procedimientos": [
    {
      "ID_OPERATIVO": "OP00001",
      "PROVINCIA": "Buenos Aires",
      "FECHA": "15/03/2025",
      "LATITUD": -34.6037,
      "LONGITUD": -58.3816,
      "DESCRIPCION": "Control rutinario en ruta nacional"
    },
    {
      "ID_OPERATIVO": "OP00002", 
      "PROVINCIA": "Córdoba",
      "FECHA": "16/03/2025",
      "LATITUD": -31.4201,
      "LONGITUD": -64.1888,
      "DESCRIPCION": "Operativo antinarcóticos"
    }
  ]
}
```

---

## 9. Monitoring & Reporting

### 9.1 Test Metrics Dashboard

#### Key Metrics to Track:
- **Test Coverage**: Target 80% minimum
- **Test Execution Time**: < 5 minutes for full suite
- **Flaky Test Rate**: < 5%
- **Bug Detection Rate**: Tests should catch 90% of bugs before production

### 9.2 Quality Gates

#### 9.2.1 Merge Requirements
- [ ] All tests pass
- [ ] Coverage ≥ 80%
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Code review approved

#### 9.2.2 Release Criteria
- [ ] E2E tests pass in production-like environment
- [ ] Security scan passes
- [ ] Performance tests meet SLA requirements
- [ ] Documentation updated

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up testing infrastructure (Vitest, Playwright, pytest)
- [ ] Create basic test utilities and factories
- [ ] Implement unit tests for critical utilities (data processing)

### Phase 2: Core Testing (Week 3-4)
- [ ] Complete backend API tests
- [ ] Implement frontend component tests  
- [ ] Add authentication/authorization tests

### Phase 3: Integration & E2E (Week 5-6)
- [ ] Full integration test suite
- [ ] End-to-end user workflow tests
- [ ] Performance and load testing

### Phase 4: Automation (Week 7-8)
- [ ] CI/CD pipeline setup
- [ ] Automated quality gates
- [ ] Monitoring and reporting dashboard

---

## 11. Risk Mitigation

### High-Risk Areas Requiring Immediate Attention:

1. **Data Processing Pipeline**: Implement comprehensive input validation
2. **Authentication Security**: Add token refresh and secure storage
3. **Excel Upload**: Sanitization and validation layer
4. **Error Handling**: React error boundaries and graceful degradation

### Recommended Testing Priority:

1. **P1**: Data integrity and security tests
2. **P2**: Core functionality and user workflows  
3. **P3**: Performance optimization and edge cases
4. **P4**: UI/UX and accessibility testing

---

*Document Version: 1.0*  
*Last Updated: 2025-09-09*  
*Next Review: 2025-09-16*