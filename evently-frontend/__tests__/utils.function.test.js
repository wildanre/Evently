// Test untuk utility functions
describe('Utility Functions Testing', () => {
  
  test('cn function should merge class names correctly', () => {
    console.log('🧪 Testing: Class name merging utility');
    
    const { cn } = require('../src/lib/utils');
    
    // Test basic functionality
    expect(cn('class1', 'class2')).toBeTruthy();
    
    // Test with conditional classes
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    
    // Test with object syntax
    const classes = cn({
      'active': true,
      'disabled': false
    });
    expect(classes).toContain('active');
    expect(classes).not.toContain('disabled');
    
    // Test with arrays
    const arrayClasses = cn(['class1', 'class2', null, undefined]);
    expect(arrayClasses).toBeTruthy();
    
    console.log('✅ Test class name utility berhasil');
  });

  test('ANIMATION_DELAY constant should be defined', () => {
    console.log('🧪 Testing: Animation delay constant');
    
    const { ANIMATION_DELAY } = require('../src/lib/utils');
    
    expect(ANIMATION_DELAY).toBeDefined();
    expect(typeof ANIMATION_DELAY).toBe('number');
    expect(ANIMATION_DELAY).toBe(4.15);
    
    console.log('✅ Test animation delay constant berhasil');
  });
});
