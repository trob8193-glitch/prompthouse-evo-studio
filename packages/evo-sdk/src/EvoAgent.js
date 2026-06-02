export class EvoAgent {
  constructor({ id, name, personality, avatar, tools = [] }) {
    this.id = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    this.name = name;
    this.personality = personality;
    this.avatar = avatar;
    this.tools = tools;
    this.client = null;
  }

  setClient(client) {
    this.client = client;
  }

  // Handle incoming message from the studio
  async receiveMessage(message, history) {
    // Basic echo loop. In a real scenario, this would call an LLM with the tools.
    console.log(`[${this.name}] Received: ${message}`);
    
    // Send a typing indicator or intermediate thought
    if (this.client) {
      // Simulate thinking
      await new Promise(r => setTimeout(r, 1000));
      
      const reply = `Hello! I am ${this.name}, an external agent. You said: "${message}"`;
      this.client.sendMessage(this.id, reply);
    }
  }
}
