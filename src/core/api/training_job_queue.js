/** Training job queue - api12 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const JOBS_FILE = path.resolve('jobs.json');

class TrainingJobQueue {
    constructor() {
        this.jobs = [];
        this.loadJobs();
    }

    async loadJobs() {
        if (fs.existsSync(JOBS_FILE)) {
            const data = fs.readFileSync(JOBS_FILE, 'utf8');
            this.jobs = JSON.parse(data);
        }
    }

    saveJobs() {
        fs.writeFileSync(JOBS_FILE, JSON.stringify(this.jobs, null, 2));
    }

    addJob(job) {
        const newJob = {
            id: this.jobs.length + 1,
            status: 'pending',
            ...job,
        };
        this.jobs.push(newJob);
        this.saveJobs();
        return newJob;
    }

    async executeJob(job) {
        try {
            job.status = 'running';
            this.saveJobs();
            // LIVE OpenAI Training Execution
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error("FATAL: OPENAI_API_KEY is missing. No simulated training allowed.");
            }
            if (!job.fileId) {
                throw new Error("FATAL: Missing real OpenAI training file ID. Cannot use static strings.");
            }

            const response = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    training_file: job.fileId,
                    model: job.model || 'gpt-4o-mini-2024-07-18'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
            }

            job.status = 'completed';
            this.saveJobs();
            return job;
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            this.saveJobs();
            // We removed the 'throw error;' here so the server loop doesn't crash.
        }
    }

    async processQueue() {
        for (const job of this.jobs) {
            if (job.status === 'pending') {
                await this.executeJob(job);
            }
        }
    }

    getJobs() {
        return this.jobs;
    }

    async clearCompleted() {
        this.jobs = this.jobs.filter(job => job.status !== 'completed');
        this.saveJobs();
    }
}

const jobQueue = new TrainingJobQueue();

export const addTrainingJob = (job) => {
    return jobQueue.addJob(job);
};

export const startTrainingJobs = async () => {
    await jobQueue.processQueue();
};

export const getTrainingJobs = () => {
    return jobQueue.getJobs();
};

export const clearCompletedJobs = async () => {
    await jobQueue.clearCompleted();
};