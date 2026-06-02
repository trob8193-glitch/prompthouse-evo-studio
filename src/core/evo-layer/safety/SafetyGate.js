export function checkExecutionSafety({ rootDir = process.cwd(), task = '' } = {}) {
  const t = (task || '').toLowerCase();

  const risky = [
    'delete',
    'rm -rf',
    'drop',
    'format'
  ];

  const blocked = risky.find(r => t.includes(r));

  if (blocked) {
    return {
      allowed: false,
      reason: `Blocked risky operation: ${blocked}`
    };
  }

  return {
    allowed: true,
    reason: 'SAFE'
  };
}