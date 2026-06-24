export class DataSanitizer {
  /**
   * Cleans incoming telemetry data before it enters the online learning stream.
   * Removes nulls, standardizes formats, trims text.
   */
  static clean(payload) {
    if (!payload) return null;
    
    let sanitized = { ...payload };
    
    // Normalize string lengths to prevent buffer overflow attacks
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim().slice(0, 5000); 
      }
    }
    
    // Ensure timestamp
    sanitized.processedAt = new Date().toISOString();
    return sanitized;
  }
}
