// Test file to verify all imports work correctly
console.log('Testing imports...');

try {
  // Test analysisService import
  import('./services/analysisService.js').then(module => {
    console.log('✅ analysisService imported successfully');
    console.log('Available methods:', Object.getOwnPropertyNames(module.analysisService));
  }).catch(error => {
    console.error('❌ Error importing analysisService:', error);
  });

  // Test apiService import  
  import('./services/apiService.js').then(module => {
    console.log('✅ apiService imported successfully');
    console.log('ApiService available:', typeof module.default);
  }).catch(error => {
    console.error('❌ Error importing apiService:', error);
  });

  // Test analysis components
  import('./components/analysis/AnalysisMain.jsx').then(() => {
    console.log('✅ AnalysisMain component imported successfully');
  }).catch(error => {
    console.error('❌ Error importing AnalysisMain:', error);
  });

} catch (error) {
  console.error('❌ General import error:', error);
}