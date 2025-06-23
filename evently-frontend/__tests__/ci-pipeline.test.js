// Test untuk memastikan CI/CD pipeline berfungsi dengan baik
describe('CI/CD Pipeline Test', () => {
  test('should pass in any environment', () => {
    // Test sederhana yang selalu berhasil
    expect(1 + 1).toBe(2);
  });

  test('should have proper test environment', () => {
    // Memastikan environment test sudah di-set dengan benar
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should validate CI environment when in CI', () => {
    // Test untuk memastikan bahwa logic CI/CD benar
    const ciEnv = process.env.CI;
    const nodeEnv = process.env.NODE_ENV;
    
    console.log('🔍 CI Environment:', ciEnv);
    console.log('🔍 Node Environment:', nodeEnv);
    
    // Jika CI environment di-set, pastikan itu 'true'
    if (ciEnv) {
      expect(ciEnv).toBe('true');
    }
    
    // Test environment harus di-set dengan benar
    expect(['test', 'development'].includes(nodeEnv)).toBe(true);
  });

  test('should demonstrate test failure blocking deployment', () => {
    // Test ini menunjukkan bagaimana test yang gagal akan memblokir deployment
    const isTestingPipeline = true;
    
    console.log('🚀 This test demonstrates how failed tests block deployment');
    console.log('✅ If this test passes, deployment would be allowed');
    console.log('❌ If this test fails, deployment would be blocked');
    
    expect(isTestingPipeline).toBe(true);
  });
});
