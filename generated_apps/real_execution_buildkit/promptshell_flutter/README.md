# PromptShell Flutter

Real client shell. It has no dummy records and calls PromptEnds.

Run:

```bash
flutter create .
flutter pub get
flutter run -d chrome --dart-define=PROMPTENDS_BASE_URL=http://localhost:3001/api/promptshell
```

Live readiness proof:

```bash
curl http://localhost:3001/api/promptshell/health
curl http://localhost:3001/api/promptshell/live-readiness
flutter devices
flutter run -d chrome --dart-define=PROMPTENDS_BASE_URL=http://localhost:3001/api/promptshell
```

Required live env keys are `JWT_SECRET`, `PH_EVO_MASTER_KEY`, `OPENAI_API_KEY`,
`STRIPE_SECRET_KEY`, and `VERCEL_TOKEN`. Device proof can be recorded by setting
`PROMPTSHELL_DEVICE_ID` plus `PROMPTSHELL_DEVICE_PROOF` after a real Flutter run
against the live bridge.
