import { Server } from 'socket.io';

export class HiveMindProtocol {
  constructor(server, options = {}) {
    this.io = new Server(server, {
      cors: { origin: '*' }
    });
    
    this.connectedNodes = new Map();
    this.bounties = new Map();
    
    this.io.on('connection', (socket) => {
      console.log(`\n🌐 [HiveMind] New Node Connected: ${socket.id}`);
      this.connectedNodes.set(socket.id, { computeLevel: 'idle', joinedAt: Date.now() });

      socket.on('broadcast_bounty', (bounty) => {
        console.log(`🐝 [HiveMind] Swarm Bounty Received from ${socket.id}: ${bounty.taskType}`);
        this.bounties.set(bounty.id, bounty);
        // Relay to all other nodes
        socket.broadcast.emit('new_bounty', bounty);
      });

      socket.on('submit_bounty_solution', (solution) => {
        console.log(`💡 [HiveMind] Swarm Node ${socket.id} solved a bounty! Reward issued.`);
        // In a real network, this would trigger an on-chain/ledger micro-transaction.
        this.io.to(solution.requesterId).emit('bounty_solved', solution);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 [HiveMind] Node Disconnected: ${socket.id}`);
        this.connectedNodes.delete(socket.id);
      });
    });
  }

  getSwarmStatus() {
    return {
      activeNodes: this.connectedNodes.size,
      activeBounties: this.bounties.size
    };
  }
}
