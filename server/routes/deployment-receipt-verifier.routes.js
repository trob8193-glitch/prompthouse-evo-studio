import { registerDeploymentReceiptVerifierRoutes } from '../services/deployment-receipt-verifier.js';

export function registerDeploymentReceiptRoutes(app, context) {
  registerDeploymentReceiptVerifierRoutes(app, context);
}
