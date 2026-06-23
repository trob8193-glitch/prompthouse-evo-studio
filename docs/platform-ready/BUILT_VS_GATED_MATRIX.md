# Built vs Gated Matrix

| Surface                       | Truth Label    | Reason                                                       |
| ----------------------------- | -------------- | ------------------------------------------------------------ |
| Local React/Vite studio shell | BUILT          | Existing app shell and feature views exist.                  |
| PromptBridge local API        | BUILT          | Express bridge exists.                                       |
| External provider actions     | PROVIDER_GATED | Requires configured credentials and explicit owner approval. |
| Platform Sentinel             | BUILT          | Added in this branch, pending proof gates.                   |
| Platform readiness claim      | NEEDS_REPAIR   | Cannot be claimed until CI and local proof pass.             |
