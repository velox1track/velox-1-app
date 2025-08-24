/**
 * Randomizer utility for generating event sequences
 * Ensures no event repeats and places relays at specified positions
 */

export const generateEventSequence = (eventPool, totalEvents, numRelays, relayPositions = []) => {
  // Extract enabled events from the categorized pool
  const enabledEvents = [];
  Object.keys(eventPool).forEach(category => {
    eventPool[category].forEach(event => {
      if (event.enabled) {
        enabledEvents.push(event.name);
      }
    });
  });

  // Separate relay and non-relay events
  const relayEvents = enabledEvents.filter(event => event.includes('4x'));
  const nonRelayEvents = enabledEvents.filter(event => !event.includes('4x'));
  
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
  return {
    shortSprints: [
      { name: "50m", enabled: true },
      { name: "60m", enabled: false },
      { name: "100m", enabled: true },
      { name: "150m", enabled: false },
      { name: "200m", enabled: true },
      { name: "300m", enabled: true }
    ],
    middleDistances: [
      { name: "400m", enabled: true },
      { name: "500m", enabled: true },
      { name: "600m", enabled: true },
      { name: "700m", enabled: false },
      { name: "800m", enabled: true },
      { name: "1km", enabled: false }
    ],
    longDistances: [
      { name: "1.2km", enabled: true },
      { name: "1 Mile", enabled: true },
      { name: "2km", enabled: true },
      { name: "2.4km", enabled: true },
      { name: "2.8km", enabled: false },
      { name: "2 Mile", enabled: false }
    ],
    relays: [
      { name: "4x100", enabled: true },
      { name: "4x200", enabled: true },
      { name: "4x400", enabled: true },
      { name: "4x800", enabled: false },
      { name: "100-100-200-400", enabled: true },
      { name: "200-200-400-800", enabled: true },
      { name: "1200-400-800-1600", enabled: false }
    ],
    technicalEvents: [
      { name: "60mH", enabled: false },
      { name: "110mH", enabled: false },
      { name: "400mH", enabled: false },
      { name: "Long Jump", enabled: false },
      { name: "Triple Jump", enabled: false },
      { name: "High Jump", enabled: false },
      { name: "Pole Vault", enabled: false },
      { name: "Shot Put", enabled: false },
      { name: "Discus", enabled: false }
    ]
  };
}; 