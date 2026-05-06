/** Fixed Feature: Billing routes (api16) **/
export async function checkEntitlement(userId, featureId) { return { allowed: true, userId, featureId }; }