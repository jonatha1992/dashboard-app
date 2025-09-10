/**
 * Global teardown for Playwright tests
 * Runs once after all tests complete
 */

import { execSync } from 'child_process';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Navigate to backend directory
    process.chdir(path.join(process.cwd(), '../backend'));
    
    // Clean up test database
    try {
      execSync('python manage.py flush --noinput --settings=dashboard_project.test_settings', 
        { stdio: 'inherit' });
      console.log('✅ Test database cleaned');
    } catch (error) {
      console.warn('⚠️ Database cleanup warning:', error.message);
    }
    
    // Return to original directory
    process.chdir(path.join(process.cwd(), '../tests'));
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    
    // Return to original directory even if teardown fails
    try {
      process.chdir(path.join(process.cwd(), '../tests'));
    } catch (cdError) {
      console.error('Failed to return to tests directory:', cdError);
    }
    
    // Don't throw error in teardown - tests already completed
  }
}

export default globalTeardown;