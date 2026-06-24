import React from 'react';
import Rive, { useRive, useStateMachineInput } from '@rive-app/react-canvas';

/**
 * Premium Rive Character Component
 * Supports interactive state machines, eye tracking, and dynamic states.
 */
export function RiveCharacter({ rivPath, stateMachine = 'State Machine 1', artboard, size = 160 }) {
  const { rive, RiveComponent } = useRive({
    src: rivPath,
    stateMachines: stateMachine,
    artboard: artboard,
    autoplay: true,
  });

  // Example of finding a state machine input (e.g. 'Hover', 'Talk', 'Level')
  const isHovered = useStateMachineInput(rive, stateMachine, 'isHover');
  const isTalking = useStateMachineInput(rive, stateMachine, 'isTalking');

  return (
    <div 
      className="rive-character-container" 
      style={{ width: size, height: size, position: 'relative' }}
      onMouseEnter={() => isHovered && (isHovered.value = true)}
      onMouseLeave={() => isHovered && (isHovered.value = false)}
    >
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
