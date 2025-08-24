/**
 * Randomizer utility for generating event sequences
 * Ensures no event repeats and places relays at specified positions
 */

export const generateEventSequence = (eventPool, totalEvents, numRelays, relayPositions = []) => {
  // Separate relay and non-relay events
  const relayEvents = eventPool.filter(event => event.includes('4x'));
  const nonRelayEvents = eventPool.filter(event => !event.includes('4x'));
  
  // Validation
  if (nonRelayEvents.length < totalEvents - numRelays) {
    return {
      success: false,
      error: `Not enough non-relay events. Need ${totalEvents - numRelays}, but only have ${nonRelayEvents.length}`
    };
  }
  
  if (relayEvents.length < numRelays) {
    return {
      success: false,
      error: `Not enough relay events. Need ${numRelays}, but only have ${relayEvents.length}`
    };
  }
  
  // Create sequence array
  const sequence = new Array(totalEvents);
  
  // Place relays at specified positions or random positions
  let relayPositionsToUse = relayPositions;
  if (relayPositions.length === 0) {
    // Generate random relay positions
    relayPositionsToUse = [];
    while (relayPositionsToUse.length < numRelays) {
      const pos = Math.floor(Math.random() * totalEvents);
      if (!relayPositionsToUse.includes(pos)) {
        relayPositionsToUse.push(pos);
      }
    }
    relayPositionsToUse.sort((a, b) => a - b);
  }
  
  // Shuffle relay events
  const shuffledRelays = [...relayEvents].sort(() => Math.random() - 0.5);
  
  // Shuffle non-relay events
  const shuffledNonRelays = [...nonRelayEvents].sort(() => Math.random() - 0.5);
  
  // Fill sequence
  let relayIndex = 0;
  let nonRelayIndex = 0;
  
  for (let i = 0; i < totalEvents; i++) {
    if (relayPositionsToUse.includes(i)) {
      sequence[i] = shuffledRelays[relayIndex++];
    } else {
      sequence[i] = shuffledNonRelays[nonRelayIndex++];
    }
  }
  
  return {
    success: true,
    sequence: sequence,
    relayPositions: relayPositionsToUse
  };
};

export const getDefaultEventPool = () => {
  return [
    "100m", "200m", "400m", "800m", "1 Mile", "3K", "60mH", "110mH", "4x100", "4x400"
  ];
}; 