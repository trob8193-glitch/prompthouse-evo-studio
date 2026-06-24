import time
import sys

class PipelineConfigurator:
    def __init__(self):
        pass

    def get_current_load(self):
        # Simulate getting load (e.g., number of active tasks or file size)
        return 50 # Mock load percentage

    def get_performance_metrics(self):
        # Simulate getting metrics
        return {"latency": "120ms", "throughput": "5 req/sec"}

class ResourceManager:
    def __init__(self):
        pass

    def calculate_optimal_resources(self, load):
        if load > 80:
            return "Large (Scale Up)"
        elif load > 40:
            return "Medium (Stable)"
        else:
            return "Small (Scale Down)"

    def allocate_resources(self, resources):
        print(f"🛠️ [ResourceManager] Allocating resources: {resources}")

    def needs_adjustment(self, metrics):
        # Simple heuristic: if latency is high, we might need adjustment
        return False # Mock for now

class InferredInfrastructureManager:
    def __init__(self):
        self.pipeline_configurator = PipelineConfigurator()
        self.resource_manager = ResourceManager()

    def optimize_infrastructure(self):
        print("🔍 [InfraManager] Optimizing infrastructure...")
        current_load = self.pipeline_configurator.get_current_load()
        optimal_resources = self.resource_manager.calculate_optimal_resources(current_load)
        self.resource_manager.allocate_resources(optimal_resources)

    def monitor_and_adjust(self):
        print("📡 [InfraManager] Starting monitoring loop...")
        try:
            while True:
                metrics = self.pipeline_configurator.get_performance_metrics()
                print(f"📊 [InfraManager] Current Metrics: {metrics}")
                if self.resource_manager.needs_adjustment(metrics):
                    self.optimize_infrastructure()
                time.sleep(10) # Check every 10 seconds for demo (blueprint said 5 mins)
        except KeyboardInterrupt:
            print("\n🛑 [InfraManager] Monitoring stopped.")

# Demonstration
if __name__ == "__main__":
    manager = InferredInfrastructureManager()
    manager.optimize_infrastructure()
    
    # Uncomment to run the loop (it blocks the process)
    # manager.monitor_and_adjust()
