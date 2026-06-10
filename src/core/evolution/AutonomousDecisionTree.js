export class AutonomousDecisionTree {
  /**
   * Decides what action to take on a proposed real-time update.
   * Returns: 'MERGE_INSTANT', 'REQUIRE_OWNER_APPROVAL', or 'DISCARD'
   */
  static evaluateUpdate(stabilityScore, ethicalReport, riskLevel = 'LOW') {
    if (!ethicalReport.compliant) {
      return 'DISCARD';
    }

    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      return 'REQUIRE_OWNER_APPROVAL';
    }

    // If stability score is too low, the update might be destructive
    if (stabilityScore < 0.2) {
      return 'REQUIRE_OWNER_APPROVAL';
    }

    return 'MERGE_INSTANT';
  }
}
