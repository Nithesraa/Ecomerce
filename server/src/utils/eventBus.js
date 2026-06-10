import { EventEmitter } from 'events';

// Create a singleton Event Bus to decouple Services from Socket.IO
class EventBus extends EventEmitter {}

export const eventBus = new EventBus();
