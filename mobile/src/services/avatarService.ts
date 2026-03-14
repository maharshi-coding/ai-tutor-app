import {avatarAPI} from './api';
import {AvatarJob} from '../types';

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 72; // ~3 minutes

/**
 * Starts async avatar generation and polls until the video is ready.
 * Returns the video URL (relative path) on success.
 * Throws on timeout or failure.
 */
export async function generateAndPollAvatar(
  avatarId: string,
  text: string,
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  onStatusUpdate?.('Sending final answer to D-ID...');

  const genResp = await avatarAPI.speak({avatarId, text});
  const {job_id, video_url} = genResp.data;

  if (!job_id && video_url) {
    onStatusUpdate?.('Avatar ready!');
    return video_url as string;
  }

  if (!job_id) {
    throw new Error('D-ID did not return a job_id');
  }

  onStatusUpdate?.('D-ID is preparing the tutor video...');

  return pollAvatarJob(job_id, onStatusUpdate);
}

export async function pollAvatarJob(
  jobId: string,
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  if (!jobId) {
    throw new Error('Missing avatar job id');
  }

  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);

    const statusResp = await avatarAPI.getJobStatus(jobId);
    const job: AvatarJob = statusResp.data;

    switch (job.status) {
      case 'done':
        if (job.video_url) {
          onStatusUpdate?.('Avatar ready!');
          return job.video_url;
        }
        throw new Error('Job done but no video_url returned');
      case 'failed':
        throw new Error(job.error || 'Tutor video generation failed');
      case 'processing':
        onStatusUpdate?.(`D-ID is rendering the tutor video... (${i + 1}/${MAX_POLLS})`);
        break;
      default:
        onStatusUpdate?.('Waiting for D-ID...');
    }
  }

  throw new Error('Tutor video generation timed out after 3 minutes');
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
