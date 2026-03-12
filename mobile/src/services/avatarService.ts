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
  text: string,
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  onStatusUpdate?.('Starting avatar generation...');

  const genResp = await avatarAPI.generate({text});
  const {job_id, video_url} = genResp.data;

  // Backend may return video_url immediately (synchronous fallback)
  if (!job_id && video_url) {
    onStatusUpdate?.('Avatar ready!');
    return video_url as string;
  }

  if (!job_id) {
    throw new Error('Backend did not return a job_id');
  }

  onStatusUpdate?.('Animating avatar...');

  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);

    const statusResp = await avatarAPI.getJobStatus(job_id);
    const job: AvatarJob = statusResp.data;

    switch (job.status) {
      case 'done':
        if (job.video_url) {
          onStatusUpdate?.('Avatar ready!');
          return job.video_url;
        }
        throw new Error('Job done but no video_url returned');
      case 'failed':
        throw new Error(job.error || 'Avatar generation failed');
      case 'processing':
        onStatusUpdate?.(`Rendering video... (${i + 1}/${MAX_POLLS})`);
        break;
      default:
        onStatusUpdate?.('Waiting in queue...');
    }
  }

  throw new Error('Avatar generation timed out after 3 minutes');
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
