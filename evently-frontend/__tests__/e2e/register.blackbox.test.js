/**
 * BLACKBOX TESTING - REGISTER FUNCTIONALITY
 * 
 * Test Scenarios:
 * 1. Register dengan kredensial yang benar (valid credentials)
 * 2. Register dengan kredensial yang salah (invalid credentials)
 * 
 * Test Framework: Playwright for E2E testing
 */

const { test, expect } = require('@playwright/test');

// Test Configuration
const BASE_URL = 'http://localhost:3000';
const REGISTER_URL = `${BASE_URL}/register`;

// Test Data
const VALID_USER_DATA = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password123'
};

const INVALID_USER_DATA = [
  {
    name: 'Test Invalid Email',
    data: { name: 'Jane Doe', email: 'invalid-email', password: 'password123' },
    expectedError: 'Please enter a valid email address'
  },
  {
    name: 'Test Short Password',
    data: { name: 'Jane Doe', email: 'jane@example.com', password: '123' },
    expectedError: 'Password must be at least 6 characters'
  },
  {
    name: 'Test Empty Name',
    data: { name: '', email: 'jane@example.com', password: 'password123' },
    expectedError: 'Name is required'
  },
  {
    name: 'Test Empty Email',
    data: { name: 'Jane Doe', email: '', password: 'password123' },
    expectedError: 'Email is required'
  },
  {
    name: 'Test Empty Password',
    data: { name: 'Jane Doe', email: 'jane@example.com', password: '' },
    expectedError: 'Password is required'
  },
  {
    name: 'Test Existing Email',
    data: { name: 'Jane Doe', email: 'existing@example.com', password: 'password123' },
    expectedError: 'Email already exists'
  }
];

test.describe('Register Page - Blackbox Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to register page before each test
    await page.goto(REGISTER_URL);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the register page
    await expect(page).toHaveTitle(/Evently/);
    await expect(page.locator('h1')).toContainText('Create an account');
  });

  /**
   * SKENARIO 1: REGISTER DENGAN KREDENSIAL YANG BENAR
   * Expected Result: User berhasil register dan redirect ke halaman events
   */
  test('Should successfully register with valid credentials', async ({ page }) => {
    console.log('🧪 Testing: Register dengan kredensial yang benar');
    
    // Step 1: Verify register form elements are present
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Step 2: Fill out the registration form with valid data
    await page.fill('#name', VALID_USER_DATA.name);
    await page.fill('#email', VALID_USER_DATA.email);
    await page.fill('#password', VALID_USER_DATA.password);
    
    // Step 3: Verify form values are filled correctly
    await expect(page.locator('#name')).toHaveValue(VALID_USER_DATA.name);
    await expect(page.locator('#email')).toHaveValue(VALID_USER_DATA.email);
    await expect(page.locator('#password')).toHaveValue(VALID_USER_DATA.password);
    
    // Step 4: Submit the form
    await page.click('button[type="submit"]');
    
    // Step 5: Verify loading state is shown
    await expect(page.locator('button[type="submit"]')).toContainText('Creating account...');
    await expect(page.locator('.animate-spin')).toBeVisible();
    
    // Step 6: Wait for the registration to complete
    await page.waitForTimeout(3000); // Wait for API call
    
    // Step 7: Verify success scenarios
    // Check for success toast message
    await expect(page.locator('.sonner-toast')).toContainText('Registration successful!');
    
    // OR check if redirected to events page
    await page.waitForURL('**/events', { timeout: 10000 });
    await expect(page).toHaveURL(/\/events/);
    
    console.log('✅ Test Passed: Register berhasil dengan kredensial yang benar');
  });

  /**
   * SKENARIO 2: REGISTER DENGAN KREDENSIAL YANG SALAH
   * Expected Result: User mendapat error message dan tetap di halaman register
   */
  test.describe('Register with invalid credentials', () => {
    
    INVALID_USER_DATA.forEach(({ name, data, expectedError }) => {
      test(`Should show error for: ${name}`, async ({ page }) => {
        console.log(`🧪 Testing: ${name}`);
        
        // Step 1: Fill out the form with invalid data
        if (data.name !== undefined) {
          await page.fill('#name', data.name);
        }
        if (data.email !== undefined) {
          await page.fill('#email', data.email);
        }
        if (data.password !== undefined) {
          await page.fill('#password', data.password);
        }
        
        // Step 2: Submit the form
        await page.click('button[type="submit"]');
        
        // Step 3: Check for HTML5 validation errors first
        const nameField = page.locator('#name');
        const emailField = page.locator('#email');
        const passwordField = page.locator('#password');
        
        if (data.name === '') {
          await expect(nameField).toHaveJSProperty('validationMessage');
        }
        if (data.email === '') {
          await expect(emailField).toHaveJSProperty('validationMessage');
        }
        if (data.password === '') {
          await expect(passwordField).toHaveJSProperty('validationMessage');
        }
        if (data.email === 'invalid-email') {
          await expect(emailField).toHaveJSProperty('validationMessage');
        }
        
        // Step 4: For backend validation errors, check toast messages
        if (name.includes('Existing Email') || name.includes('Short Password')) {
          await page.waitForTimeout(3000); // Wait for API call
          await expect(page.locator('.sonner-toast')).toContainText(/error|failed|exists/i);
        }
        
        // Step 5: Verify user stays on register page
        await expect(page).toHaveURL(REGISTER_URL);
        await expect(page.locator('h1')).toContainText('Create an account');
        
        console.log(`✅ Test Passed: ${name} - Error handled correctly`);
      });
    });
  });

  /**
   * ADDITIONAL TEST CASES - Edge Cases & UI Testing
   */
  
  test('Should disable submit button while loading', async ({ page }) => {
    console.log('🧪 Testing: Submit button disabled during loading');
    
    // Fill valid data
    await page.fill('#name', VALID_USER_DATA.name);
    await page.fill('#email', VALID_USER_DATA.email);
    await page.fill('#password', VALID_USER_DATA.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify button is disabled during loading
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    await expect(page.locator('button[type="submit"]')).toContainText('Creating account...');
    
    console.log('✅ Test Passed: Submit button properly disabled during loading');
  });
  
  test('Should have working navigation links', async ({ page }) => {
    console.log('🧪 Testing: Navigation links functionality');
    
    // Test "Back to Events" link
    const backLink = page.locator('text=Back to Events');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/events');
    
    // Test "Sign in" link
    const signInLink = page.locator('text=Sign in');
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute('href', '/login');
    
    // Test Terms and Privacy links
    const termsLink = page.locator('text=Terms of Service');
    const privacyLink = page.locator('text=Privacy Policy');
    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
    
    console.log('✅ Test Passed: All navigation links are working');
  });
  
  test('Should display Google OAuth button', async ({ page }) => {
    console.log('🧪 Testing: Google OAuth button presence');
    
    // Check if Google OAuth button is present
    const googleButton = page.locator('text=Continue with Google').or(page.locator('[data-testid="google-oauth"]'));
    await expect(googleButton).toBeVisible();
    
    console.log('✅ Test Passed: Google OAuth button is displayed');
  });
  
  test('Should validate password minimum length', async ({ page }) => {
    console.log('🧪 Testing: Password minimum length validation');
    
    // Fill form with short password
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '123');
    
    // Check HTML5 validation
    const passwordField = page.locator('#password');
    await expect(passwordField).toHaveAttribute('minLength', '6');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Should show validation message
    const validationMessage = await passwordField.evaluate(el => el.validationMessage);
    expect(validationMessage).toBeTruthy();
    
    console.log('✅ Test Passed: Password minimum length validation working');
  });
});

/**
 * TEST EXECUTION NOTES:
 * 
 * 1. Make sure the development server is running on http://localhost:3000
 * 2. Run tests with: npx playwright test register.blackbox.test.js
 * 3. For debugging: npx playwright test register.blackbox.test.js --debug
 * 4. For headed mode: npx playwright test register.blackbox.test.js --headed
 * 
 * EXPECTED OUTCOMES:
 * - Valid credentials: User successfully registered and redirected to /events
 * - Invalid credentials: Appropriate error messages shown, user stays on register page
 * - UI elements: All form elements, buttons, and links work as expected
 */
