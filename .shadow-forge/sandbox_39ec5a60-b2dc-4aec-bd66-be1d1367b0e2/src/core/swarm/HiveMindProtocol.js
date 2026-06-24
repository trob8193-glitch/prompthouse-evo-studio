import { Server } from 'socket.io';

export class HiveMindProtocol {
  constructor(server, options = {}) {
    this.rewardSettlement = options.rewardSettlement || null;
    this.networkMode = options.networkMode || 'MASTER_NODE'; // can be MASTER_NODE or PURE_P2P
    
    this.io = new Server(server, {
      cors: { origin: '*' }
    });

    this.connectedNodes = new Map();
    this.bounties = new Map();

    this.io.on('connection', (socket) => {
      global.Log && global.Log.info(`\n🌐 [HiveMind] New Node Connected: ${socket.id}`);
      this.connectedNodes.set(socket.id, { computeLevel: 'idle', joinedAt: Date.now() });

      socket.on('broadcast_bounty', (bounty) => {
        global.Log && global.Log.info(`🐝 [HiveMind] Swarm Bounty Received from ${socket.id}: ${bounty.taskType}`);
        this.bounties.set(bounty.id, bounty);
        
        // In PURE_P2P mode, we relay the bounty. In MASTER_NODE mode, the master assigns it.
        if (this.networkMode === 'PURE_P2P') {
          socket.broadcast.emit('new_bounty', bounty);
        } else {
          // Master Node logic (basic assignment for now)
          socket.broadcast.emit('new_bounty', { ...bounty, assignedByMaster: true });
        }
      });

      socket.on('submit_bounty_solution', async (solution) => {
        global.Log && global.Log.info(`💡 [HiveMind] Swarm Node ${socket.id} submitted a bounty solution.`);
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
        global.Log && global.Log.info(`🔌 [HiveMind] Node Disconnected: ${socket.id}`);
        this.connectedNodes.delete(socket.id);
      });
    });
  }

  getSwarmStatus() {
    return {
      networkMode: this.networkMode,
      activeNodes: this.connectedNodes.size,
      activeBounties: this.bounties.size,
      rewardSettlement: this.rewardSettlement ? 'configured' : 'provider_required'
    };
  }
}
