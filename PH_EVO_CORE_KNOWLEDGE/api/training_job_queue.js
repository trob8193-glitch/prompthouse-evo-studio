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
            // Simulating training job
            const response = await fetch('http://127.0.0.1:3001/train', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(job),
            });

            if (!response.ok) {
                throw new Error(`Training failed: ${response.statusText}`);
            }

            job.status = 'completed';
            this.saveJobs();
            return job;
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            this.saveJobs();
            throw error;
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