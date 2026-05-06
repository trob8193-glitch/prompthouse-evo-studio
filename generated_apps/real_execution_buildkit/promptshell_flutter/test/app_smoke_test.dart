import 'package:flutter_test/flutter_test.dart';
import 'package:promptshell/main.dart' as app;

void main() {
  testWidgets('PromptShell renders command deck', (tester) async {
    app.main();
    await tester.pump();
    expect(find.text('PromptShell Command Deck'), findsOneWidget);
  });
}
