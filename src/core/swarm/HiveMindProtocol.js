import { Server } from 'socket.io';

export class HiveMindProtocol {
  constructor(server, options = {}) {
    this.rewardSettlement = options.rewardSettlement || null;
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

      socket.on('submit_bounty_solution', async (solution) => {
        console.log(`💡 [HiveMind] Swarm Node ${socket.id} submitted a bounty solution.`);
        let settlement = {
          success: false,
          truthState: 'REWARD_SETTLEMENT_PROVIDER_REQUIRED',
          reason: 'No reward settlement adapter is configured.'
        };

        if (this.rewardSettlement?.settle) {
          try {
            settlement = await this.rewardSettlement.settle(solution);
          } catch (error) {
            settlement = {
              success: false,
              truthState: 'REWARD_SETTLEMENT_FAILED',
              error: error.message
            };
          }
        }

        this.io.to(solution.requesterId).emit('bounty_solved', {
          ...solution,
          settlement
        });
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
      activeBounties: this.bounties.size,
      rewardSettlement: this.rewardSettlement ? 'configured' : 'provider_required'
    };
  }
}
