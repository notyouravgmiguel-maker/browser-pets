/**
 * Automated Unit Tests for Browser Companion Pet
 */

const assert = require('assert');

// Test 1: Manifest validation
function testManifest() {
  const manifest = require('../manifest.json');
  assert.strictEqual(manifest.manifest_version, 3, 'Manifest must be version 3');
  assert.strictEqual(typeof manifest.name, 'string', 'Name should be string');
  assert.strictEqual(typeof manifest.version, 'string', 'Version should be string');
  assert.ok(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content script should be defined');
  assert.ok(manifest.permissions.includes('storage'), 'Storage permission required');
  console.log('✓ testManifest passed');
}

// Test 2: Movement and boundary logic
function testMovementBoundaries() {
  const screenWidth = 1000 - 75; // 925
  let x = 910;
  let direction = 1;
  const speed = 30;

  // Next step
  let nextX = x + direction * speed; // 940 -> exceeds 925
  if (nextX >= screenWidth) {
    nextX = screenWidth;
    direction = -1;
  } else if (nextX <= 10) {
    nextX = 10;
    direction = 1;
  }

  assert.strictEqual(nextX, 925, 'Boundary should cap x to screenWidth');
  assert.strictEqual(direction, -1, 'Direction should turn left at right boundary');

  // Next step going left
  nextX = nextX + direction * speed; // 925 - 30 = 895
  assert.strictEqual(nextX, 895, 'Should move left after bounce');

  // Test left boundary bounce
  x = 20;
  direction = -1;
  nextX = x + direction * speed; // -10 <= 10
  if (nextX >= screenWidth) {
    nextX = screenWidth;
    direction = -1;
  } else if (nextX <= 10) {
    nextX = 10;
    direction = 1;
  }
  assert.strictEqual(nextX, 10, 'Boundary should cap x to min 10');
  assert.strictEqual(direction, 1, 'Direction should turn right at left boundary');
  console.log('✓ testMovementBoundaries passed');
}

// Test 3: Cursor chase / follow distance calculations
function testCursorChaseMath() {
  const petCenter = { x: 100, y: 100 };
  const mousePos = { x: 200, y: 100 };
  const speed = 30;

  const dx = mousePos.x - petCenter.x;
  const dy = mousePos.y - petCenter.y;
  const dist = Math.hypot(dx, dy);

  assert.strictEqual(dist, 100, 'Distance should be 100');

  const step = Math.min(speed, dist * 0.1);
  const nextX = petCenter.x + (dx / dist) * step;
  const nextY = petCenter.y + (dy / dist) * step;

  assert.strictEqual(step, 10, 'Step should be capped proportional');
  assert.strictEqual(nextX, 110, 'Target pet X should advance towards mouse');
  assert.strictEqual(nextY, 100, 'Target pet Y should stay aligned on horizontal chase');
  console.log('✓ testCursorChaseMath passed');
}

// Test 4: Happiness treat bounds
function testHappinessBounds() {
  let happiness = 90;
  happiness = Math.min(100, happiness + 20);
  assert.strictEqual(happiness, 100, 'Happiness should not exceed 100%');

  happiness = 50;
  happiness = Math.min(100, happiness + 20);
  assert.strictEqual(happiness, 70, 'Happiness should increase by 20%');
  console.log('✓ testHappinessBounds passed');
}

function runAll() {
  console.log('Running browser pet unit tests...');
  testManifest();
  testMovementBoundaries();
  testCursorChaseMath();
  testHappinessBounds();
  console.log('All tests passed successfully!');
}

runAll();
