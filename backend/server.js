const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Data file paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const DATA_FILE = path.join(__dirname, 'data', 'operational_data.json');

// Initialize data directory and files
const initializeData = () => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize users file with default admin user
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10), // Hash the password
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'viewer',
        password: bcrypt.hashSync('viewer123', 10),
        role: 'viewer',
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    console.log('✅ Users file initialized with default users');
    console.log('📋 Admin: admin/admin123, Viewer: viewer/viewer123');
  }

  // Initialize data file
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    console.log('✅ Data file initialized');
  }
};

// Utility functions
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    next();
  };
};

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dashboard Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Get operational data (accessible by all authenticated users)
app.get('/api/data', authenticateToken, (req, res) => {
  try {
    const data = readJsonFile(DATA_FILE);
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Upload operational data (admin only)
app.post('/api/data/upload', authenticateToken, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const currentData = readJsonFile(DATA_FILE);
    let totalAdded = 0;
    let duplicatesSkipped = 0;
    const sheetsProcessed = [];

    // Process each sheet
    for (let i = 0; i < workbook.SheetNames.length; i++) {
      const sheetName = workbook.SheetNames[i];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      if (sheetData.length === 0) continue;

      // Add metadata to each row
      const processedData = sheetData.map(row => ({
        ...row,
        HOJA: sheetName,
        ARCHIVO_ORIGINAL: req.file.originalname,
        FECHA_IMPORTACION: new Date().toISOString(),
        record_key: `${row.ID_OPERATIVO || 'N/A'}_${row.ID_PROCEDIMIENTO || 'N/A'}_${sheetName}`
      }));

      // Check for duplicates
      let sheetAdded = 0;
      let sheetSkipped = 0;

      processedData.forEach(newRow => {
        const exists = currentData.some(existingRow => 
          existingRow.record_key === newRow.record_key
        );

        if (!exists) {
          currentData.push(newRow);
          sheetAdded++;
          totalAdded++;
        } else {
          sheetSkipped++;
          duplicatesSkipped++;
        }
      });

      sheetsProcessed.push({
        name: sheetName,
        totalRows: sheetData.length,
        added: sheetAdded,
        skipped: sheetSkipped
      });
    }

    // Save updated data
    if (writeJsonFile(DATA_FILE, currentData)) {
      res.json({
        success: true,
        message: 'Datos cargados exitosamente',
        stats: {
          totalAdded,
          duplicatesSkipped,
          totalRecords: currentData.length,
          sheetsProcessed
        }
      });
    } else {
      res.status(500).json({ error: 'Error al guardar datos' });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error al procesar archivo' });
  }
});

// Clear all data (admin only)
app.delete('/api/data/clear', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    if (writeJsonFile(DATA_FILE, [])) {
      res.json({ 
        success: true, 
        message: 'Todos los datos han sido eliminados' 
      });
    } else {
      res.status(500).json({ error: 'Error al limpiar datos' });
    }
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ error: 'Error al limpiar datos' });
  }
});

// Get data statistics
app.get('/api/data/stats', authenticateToken, (req, res) => {
  try {
    const data = readJsonFile(DATA_FILE);
    
    const stats = {
      totalRecords: data.length,
      sheets: [...new Set(data.map(row => row.HOJA))].filter(Boolean),
      dateRange: {
        earliest: null,
        latest: null
      },
      provinces: [...new Set(data.map(row => row['GEOG._PROCEDIMIENTO'] || row.PROVINCIA))].filter(Boolean)
    };

    // Calculate date range
    const dates = data
      .map(row => row.FECHA_ISO || row.FECHA)
      .filter(Boolean)
      .sort();
    
    if (dates.length > 0) {
      stats.dateRange.earliest = dates[0];
      stats.dateRange.latest = dates[dates.length - 1];
    }

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Initialize and start server
initializeData();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📂 Data directory: ${path.join(__dirname, 'data')}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET.substring(0, 20)}...`);
});