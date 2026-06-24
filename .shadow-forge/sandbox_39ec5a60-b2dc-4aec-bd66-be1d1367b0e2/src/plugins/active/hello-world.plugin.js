import { BasePlugin } from '../../core/plugins/BasePlugin.js';

export default class HelloWorldPlugin extends BasePlugin {
  constructor() {
    super({
      id: 'hello_world_test',
      name: 'Hello World Intent Test Plugin',
      version: '1.0.0',
      capabilities: ['test', 'omni-intent']
    });
  }

  async onMobileIntent(intent) {
    if (intent.message && intent.message.toLowerCase() === 'hello omni') {
      return { text: 'Hello from the Autonomous Plugin !System The plugin daemon successfully intercepted your OmniBot Mobile intent.' };
    }
    return null;
  }

  onBackendRoute(app) {
    app.get('/api/plugin-test-hello', (req, res) => {
      res.json({ success: true, message: 'Hello from the Autonomous Plugin backend route!' });
    });
  }
}
