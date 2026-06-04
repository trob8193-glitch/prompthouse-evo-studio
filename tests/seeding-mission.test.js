import { describe, it, expect } from 'vitest';
import { SeedingMission } from '../src/core/automation/seeding_mission.js';

describe('SeedingMission', () => {
  it('starts and tracks a mission', () => {
    const mission = new SeedingMission();
    expect(mission.startMission('m1', { data: 'test' })).toBe(true);
    expect(mission.startMission('m1', { data: 'test2' })).toBe(false); // already running
    
    const status = mission.getMissionStatus('m1');
    expect(status.status).toBe('RUNNING');
    expect(status.progress).toBe(0);
  });

  it('updates progress and completes', () => {
    const mission = new SeedingMission();
    mission.startMission('m2', {});
    
    expect(mission.updateProgress('m2', 50)).toBe('RUNNING');
    
    const status = mission.getMissionStatus('m2');
    expect(status.progress).toBe(50);
    
    expect(mission.updateProgress('m2', 60)).toBe('COMPLETED'); // 50 + 60 = 110 -> 100
    
    const finalStatus = mission.getMissionStatus('m2');
    expect(finalStatus.status).toBe('COMPLETED');
    expect(finalStatus.progress).toBe(100);
  });

  it('getStatus returns active grade', () => {
    const mission = new SeedingMission();
    const status = mission.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
