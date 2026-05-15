import { registerHealthRoutes } from './health.routes.js';
import { registerProviderRoutes } from './provider.routes.js';
import { registerSecurityRoutes } from './security.routes.js';
import { registerDiagnosticsRoutes } from './diagnostics.routes.js';
import { registerDeploymentReadinessRoutes } from './deployment-readiness.routes.js';
import { registerDeployActionRoutes } from './deploy-action.routes.js';
import { registerEnvValidationRoutes } from './env-validation.routes.js';
import { registerProviderCredentialChecklistRoutes } from './provider-credential-checklist.routes.js';

export function registerCoreRoutes(app, context) {
  const summary = {
    registeredModules: [],
    failedModules: [],
    routes: []
  };

  const attemptRegistration = (name, registerFn) => {
    try {
      registerFn(app, context);
      summary.registeredModules.push(name);
    } catch (err) {
      summary.failedModules.push({ name, error: err.message });
      console.error(`[Route Registry] Failed to register module: ${name}`, err);
    }
  };

  attemptRegistration('health', registerHealthRoutes);
  attemptRegistration('provider', registerProviderRoutes);
  attemptRegistration('security', registerSecurityRoutes);
  attemptRegistration('diagnostics', registerDiagnosticsRoutes);
  attemptRegistration('deployment-readiness', registerDeploymentReadinessRoutes);
  attemptRegistration('deploy-action', registerDeployActionRoutes);
  attemptRegistration('env-validation', registerEnvValidationRoutes);
  attemptRegistration('provider-credential-checklist', registerProviderCredentialChecklistRoutes);

  if (context.routeRegistry) {
    summary.routes = context.routeRegistry.routes;
  }

  return summary;
}
