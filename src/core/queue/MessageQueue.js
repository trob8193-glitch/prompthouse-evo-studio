import { EventEmitter } from 'events';
import { Log } from '../autonomy/SovereignLogger.js';

class PubSubQueue extends EventEmitter {
  constructor() {
    super();
    this.messageHistory = [];
  }

  publish(topic, message) {
    const payload = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      topic,
      data: message,
      timestamp: new Date().toISOString()
    };
    
    this.messageHistory.push(payload);
    // Keep history manageable
    if (this.messageHistory.length > 1000) {
      this.messageHistory.shift();
    }
    
    Log.info(`[MessageQueue] Publishing to topic: ${topic}`);
    this.emit(topic, payload);
    return payload.id;
  }

  subscribe(topic, handler) {
    Log.info(`[MessageQueue] Subscribing to topic: ${topic}`);
    this.on(topic, handler);
  }
}

export const GlobalMessageQueue = new PubSubQueue();
