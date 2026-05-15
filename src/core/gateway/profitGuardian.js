export function evaluateProfitGuard({
  planRevenueMonthly = 0,
  currentMonthCost = 0,
  estimatedRequestCost = 0,
  minimumMarginPercent = 60,
  provider = 'local'
} = {}) {
  if (provider === 'local') {
    return { allowed: true, requiresApproval: false, marginPercentAfter: 100, reason: 'Local provider has no metered API cost.' };
  }

  const revenue = Number(planRevenueMonthly || 0);
  const afterCost = Number(currentMonthCost || 0) + Number(estimatedRequestCost || 0);
  if (revenue <= 0) {
    return {
      allowed: false,
      requiresApproval: true,
      marginPercentAfter: null,
      reason: 'No monthly revenue is known for this org; paid API call requires approval or credits.'
    };
  }

  const marginPercentAfter = Number((((revenue - afterCost) / revenue) * 100).toFixed(2));
  const allowed = marginPercentAfter >= minimumMarginPercent;
  return {
    allowed,
    requiresApproval: !allowed,
    marginPercentAfter,
    reason: allowed
      ? 'Estimated provider cost preserves required margin.'
      : `Estimated provider cost would reduce margin below ${minimumMarginPercent}%.`,
    revenue,
    afterCost,
    estimatedRequestCost
  };
}

export function planRevenueFromPlan(plan = 'free') {
  if (plan === 'paid') return 29;
  if (plan === 'pro') return 99;
  if (plan === 'enterprise') return 499;
  return 0;
}
