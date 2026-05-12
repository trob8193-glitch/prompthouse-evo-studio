import fs from 'fs';
import path from 'path';

/**
 * EVOGENAGE — PHYSICAL ASSET VAULT (OFFLINE STORAGE)
 * ═══════════════════════════════════════════════════════════════
 * Writes generated assets directly to the local filesystem.
 * No S3. No Cloudinary. Absolute Disk Sovereignty.
 */

export class AssetVault {
  private storageRoot = path.join(process.cwd(), 'storage', 'assets');

  constructor() {
    if (!fs.existsSync(this.storageRoot)) {
      fs.mkdirSync(this.storageRoot, { recursive: true });
    }
  }

  /**
   * Save a generated buffer or stream to the physical vault.
   */
  async saveAsset(jobId: string, data: Buffer, ext: string = 'png'): Promise<string> {
    const filename = `asset_${jobId}_${Date.now()}.${ext}`;
    const filePath = path.join(this.storageRoot, filename);

    await fs.promises.writeFile(filePath, data);

    console.log(`💾 [AssetVault] Asset physically anchored to disk: ${filePath}`);
    
    // Return the local relative URL
    return `/storage/assets/${filename}`;
  }

  /**
   * Physically purge an asset from the disk.
   */
  async purgeAsset(filePath: string) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      console.log(`🗑️ [AssetVault] Asset physically purged: ${fullPath}`);
    }
  }
}
