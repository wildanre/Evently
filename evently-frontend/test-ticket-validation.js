// Test script untuk memvalidasi harga tiket minimum
const PAYMENT_CONFIG = {
  SETTINGS: {
    MIN_AMOUNT: 10000, // Minimum Rp 10,000
    MAX_AMOUNT: 50000000, // Maximum Rp 50,000,000
  }
};

// Function to format currency
const formatAmount = (amount) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Test validation function
function validateTicketPrice(ticketType, ticketPrice) {
  console.log(`\n=== Testing Ticket Validation ===`);
  console.log(`Ticket Type: ${ticketType}`);
  console.log(`Ticket Price: ${ticketPrice}`);

  if (ticketType === "paid") {
    const price = parseFloat(ticketPrice) || 0;
    
    if (!ticketPrice || price <= 0) {
      console.log("❌ FAILED: Ticket price is required for paid events");
      return false;
    } else if (price < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) {
      console.log(`❌ FAILED: Minimum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT)}`);
      return false;
    } else if (price > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) {
      console.log(`❌ FAILED: Maximum ticket price is ${formatAmount(PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT)}`);
      return false;
    } else {
      console.log("✅ PASSED: Ticket price is valid");
      return true;
    }
  } else {
    console.log("✅ PASSED: Free event, no price validation needed");
    return true;
  }
}

// Test scenarios
console.log("Testing various ticket price scenarios...");

// Test 1: Free event
validateTicketPrice("free", "");

// Test 2: Paid event with valid price
validateTicketPrice("paid", "15000");

// Test 3: Paid event with price below minimum (should fail)
validateTicketPrice("paid", "1000");

// Test 4: Paid event with price above maximum (should fail)
validateTicketPrice("paid", "100000000");

// Test 5: Paid event with empty price (should fail)
validateTicketPrice("paid", "");

// Test 6: Paid event with zero price (should fail)
validateTicketPrice("paid", "0");

// Test 7: Paid event with exactly minimum price (should pass)
validateTicketPrice("paid", "10000");

// Test 8: Paid event with exactly maximum price (should pass)
validateTicketPrice("paid", "50000000");

console.log("\n=== Test Complete ===");
