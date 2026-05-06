# Install Patch Guide: Evo Studio Builder

## Add assets
Copy:
- `flutter_patch/assets/evo_studio_builder_templates.json`

to your Flutter app:
- `flutter_app/assets/evo_studio_builder_templates.json`

Then add this under `flutter.assets` in `pubspec.yaml`:

```yaml
    - assets/evo_studio_builder_templates.json
```

## Add Dart files
Copy:
- `flutter_patch/lib/models/evo_agent_builder_models.dart`
- `flutter_patch/lib/services/evo_studio_builder_service.dart`
- `flutter_patch/lib/screens/evo_studio_builder_screen.dart`

into your Flutter app's matching folders.

## Add to navigation
Import:

```dart
import 'screens/evo_studio_builder_screen.dart';
```

Add a navigation destination:

```dart
NavigationDestination(
  icon: Icon(Icons.account_tree_outlined),
  selectedIcon: Icon(Icons.account_tree),
  label: 'Evo Builder',
)
```

Add the page:

```dart
const EvoStudioBuilderScreen()
```

## Verify locally
```bash
cd flutter_app
flutter pub get
flutter analyze
flutter test
flutter run
```

## Boundary
Do not mark the panel installed until the source has been added to your app and run locally.
