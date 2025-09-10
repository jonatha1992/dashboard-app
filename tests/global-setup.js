/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Ensure test database is clean
    console.log('📦 Setting up test database...');
    
    // Navigate to backend directory and run setup
    process.chdir(path.join(process.cwd(), '../backend'));
    
    // Create test database
    try {
      execSync('python manage.py migrate --settings=dashboard_project.test_settings', 
        { stdio: 'inherit' });
      console.log('✅ Test database migrated');
    } catch (error) {
      console.warn('⚠️ Migration warning (may be expected):', error.message);
    }
    
    // Create test users
    try {
      execSync('python manage.py init_users --settings=dashboard_project.test_settings', 
        { stdio: 'inherit' });
      console.log('✅ Test users created');
    } catch (error) {
      console.warn('⚠️ User creation warning (may be expected):', error.message);
    }
    
    // Load sample data if available
    const sampleDataPath = path.join(process.cwd(), '..', 'test_upload.xlsx');
    if (fs.existsSync(sampleDataPath)) {
      console.log('📊 Sample data file found');
      // Could potentially load sample data here
    } else {
      console.log('📊 No sample data file found (test_upload.xlsx)');
    }
    
    // Return to original directory
    process.chdir(path.join(process.cwd(), '../tests'));
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Return to original directory even if setup fails
    try {
      process.chdir(path.join(process.cwd(), '../tests'));
    } catch (cdError) {
      console.error('Failed to return to tests directory:', cdError);
    }
    
    throw error;
  }
}

export default globalSetup;