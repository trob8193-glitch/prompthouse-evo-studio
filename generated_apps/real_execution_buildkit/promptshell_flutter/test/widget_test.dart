import 'package:flutter_test/flutter_test.dart';
import 'package:promptshell/main.dart';

void main() {
  testWidgets('PromptShell app renders command deck', (tester) async {
    await tester.pumpWidget(const PromptShellApp());
    await tester.pump();

    expect(find.text('PromptShell Command Deck'), findsOneWidget);
    expect(find.text('Deck'), findsOneWidget);
  });
}
