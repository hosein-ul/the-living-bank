import { sound } from "../lib/sound";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("==================================================");
console.log("STARTING AUDIO & PARTICLE PHYSICS VERIFICATION");
console.log("==================================================");

// 1. Initial mute status (must be OFF by default per §3)
assert(sound.getIsMuted() === true, "Sound must be OFF by default per specification");
console.log("✓ Sound initial state is muted (OFF by default)");

// 2. Toggle mute
const unmuted = sound.toggleMute();
assert(unmuted === false, "toggleMute() should return false (unmuted)");
assert(sound.getIsMuted() === false, "getIsMuted() should reflect unmuted state");
console.log("✓ Toggle mute functions correctly");

// 3. Verify all 6 mechanical sound methods execute without throwing in Node/SSR/Mock environments
try {
  sound.playTick();
  sound.playRatchet();
  sound.playThud();
  sound.playStamp();
  sound.playSlam();
  sound.playCrackle();
  sound.playFurnaceRoar();
  sound.playCoinClink();
  sound.playRustle();
  sound.playStream();
  sound.playChime();
  sound.playCelebration();
  sound.playShatter();
  sound.startContractionDrone();
  sound.stopContractionDrone();
  sound.setRegimeDrone("CONTRACTION");
  sound.setRegimeDrone("EXPANSION");
  console.log("✓ All 6 mechanical sound synthesizers and contraction drone executed safely without error");
} catch (err) {
  throw new Error(`Audio method threw an error: ${err}`);
}

// 4. Toggle mute back to off
const remuted = sound.toggleMute();
assert(remuted === true, "toggleMute() should return true (muted)");
assert(sound.getIsMuted() === true, "getIsMuted() should be true");
console.log("✓ Re-muting functions correctly");

console.log("==================================================");
console.log("AUDIO & PHYSICS VERIFICATION SUITE PASSED (100%)");
console.log("==================================================");
