/**
 * Team assigner utility for balanced tier-based distribution
 * Uses round-robin assignment across High → Med → Low tiers
 */

export const assignTeams = (athletes, numTeams) => {
  if (!athletes || athletes.length === 0) {
    return {
      success: false,
      error: 'No athletes provided'
    };
  }
  
  if (numTeams < 1) {
    return {
      success: false,
      error: 'Number of teams must be at least 1'
    };
  }
  
  // Separate athletes by tier
  const highTier = athletes.filter(athlete => athlete.tier === 'High');
  const medTier = athletes.filter(athlete => athlete.tier === 'Med');
  const lowTier = athletes.filter(athlete => athlete.tier === 'Low');
  
  // Initialize teams
  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    athletes: []
  }));
  
  // Round-robin assignment: High → Med → Low
  let teamIndex = 0;
  
  // Assign high tier athletes
  highTier.forEach(athlete => {
    teams[teamIndex % numTeams].athletes.push(athlete);
    teamIndex++;
  });
  
  // Assign medium tier athletes
  medTier.forEach(athlete => {
    teams[teamIndex % numTeams].athletes.push(athlete);
    teamIndex++;
  });
  
  // Assign low tier athletes
  lowTier.forEach(athlete => {
    teams[teamIndex % numTeams].athletes.push(athlete);
    teamIndex++;
  });
  
  return {
    success: true,
    teams: teams,
    stats: {
      totalAthletes: athletes.length,
      highTier: highTier.length,
      medTier: medTier.length,
      lowTier: lowTier.length,
      averageTeamSize: Math.round(athletes.length / numTeams * 10) / 10
    }
  };
};

export const moveAthlete = (teams, athleteId, fromTeamId, toTeamId) => {
  const fromTeam = teams.find(team => team.id === fromTeamId);
  const toTeam = teams.find(team => team.id === toTeamId);
  
  if (!fromTeam || !toTeam) {
    return {
      success: false,
      error: 'Invalid team ID'
    };
  }
  
  const athleteIndex = fromTeam.athletes.findIndex(athlete => athlete.id === athleteId);
  if (athleteIndex === -1) {
    return {
      success: false,
      error: 'Athlete not found in source team'
    };
  }
  
  const athlete = fromTeam.athletes.splice(athleteIndex, 1)[0];
  toTeam.athletes.push(athlete);
  
  return {
    success: true,
    teams: teams
  };
}; 