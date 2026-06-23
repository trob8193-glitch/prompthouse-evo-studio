import fs from 'fs';
import path from 'path';

// Production-ready adapter that connects to the real OpenAI fine-tuning API.
// Requires OPENAI_API_KEY to be set in the environment.

export class OpenAIFineTuningAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async uploadTrainingFile(filePath) {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is required for real training execution.');
    
    void(`[OpenAI Adapter] Uploading file to OpenAI: ${filePath}`);
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Build raw multipart/form-data payload
    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="purpose"\r\n\r\n`;
    body += `fine-tune\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
    body += `Content-Type: application/jsonl\r\n\r\n`;
    body += `${fileContent}\r\n`;
    body += `--${boundary}--\r\n`;

    // Make native fetch request since node-fetch doesn't have native FormData support 
    // unless we install external packages, which we avoid here to preserve raw routing
    const res = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `File upload failed: HTTP ${res.status}`);

    void(`[OpenAI Adapter] File uploaded successfully. File ID: ${data.id}`);
    return data;
  }

  async startFineTuningJob(fileId, model = 'gpt-4o-mini-2024-07-18') {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is required for real training execution.');

    void(`[OpenAI Adapter] Starting real fine-tuning job for file ${fileId} on model ${model}`);
    
    const res = await fetch(`${this.baseUrl}/fine_tuning/jobs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${this.apiKey}` 
      },
      body: JSON.stringify({ training_file: fileId, model })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Job creation failed: HTTP ${res.status}`);

    void(`[OpenAI Adapter] Job created. Job ID: ${data.id}`);
    return data;
  }

  async getJobStatus(jobId) {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is required for real training execution.');

    void(`[OpenAI Adapter] Polling status for job ${jobId}`);
    
    const res = await fetch(`${this.baseUrl}/fine_tuning/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error?.message || `Job polling failed: HTTP ${res.status}`);

    return {
      id: jobId,
      status: data.status,
      fine_tuned_model: data.fine_tuned_model || null,
      error: data.error
    };
  }
}
