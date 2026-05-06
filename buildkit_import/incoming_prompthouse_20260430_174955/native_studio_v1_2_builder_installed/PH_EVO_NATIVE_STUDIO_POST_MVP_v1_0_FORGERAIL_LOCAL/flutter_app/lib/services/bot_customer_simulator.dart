import '../models.dart';

class BotCustomerSimulator {
  List<BotCustomerFeedback> simulateFeedback(Blueprint blueprint) => const [
    BotCustomerFeedback(persona: 'Vibe Coder Founder', feedback: 'I can describe the app and see screens, tasks, and proof without learning every framework first.', score: 9, repairRequest: 'Add voice-note intake and screenshot inspiration upload.'),
    BotCustomerFeedback(persona: 'AI Coder Engineer', feedback: 'Fire Orders and Proof Deck help me feed clearer work into AI coding agents.', score: 8, repairRequest: 'Add repo scan and context-pack export.'),
    BotCustomerFeedback(persona: 'Mobile Freelancer', feedback: 'Flutter compatibility makes sense; I need export bundles for client handoff.', score: 8, repairRequest: 'Add client-ready PDF/Markdown export.'),
    BotCustomerFeedback(persona: 'QA Reviewer', feedback: 'Proof Deck blocks fake shipping. Add E2E checklist and screenshot receipts.', score: 9, repairRequest: 'Add device QA capture.'),
  ];
}
