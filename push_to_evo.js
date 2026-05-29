fetch('http://127.0.0.1:3001/evo-layer/push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Studio-Gateway-Key': 'dev-gateway-key-123'
  },
  body: JSON.stringify({
    tenantId: "tenant_default",
    ownerUserId: "admin",
    source: "ide",
    intent: "push_to_evo_layer",
    riskLevel: "high",
    approvalRef: "studio-admin-approved-123",
    payload: { message: "Saving latest Studio architecture to Evo Layer" }
  })
}).then(r => r.json()).then(console.log).catch(console.error);
