import express from 'express';
import { LiveStreamController } from '../../../src/controllers/implementation/user/live/LiveStreamController';
import { container } from 'tsyringe';

const router = express.Router();
const liveStreamController = container.resolve(LiveStreamController);

router.post('/events/:eventId/start', async (req, res) => {
  await liveStreamController.startLiveStream(req, res);
});
router.post('/events/:eventId/join', async (req, res) => {
  await liveStreamController.joinLiveStream(req, res);
});
router.post('/events/:eventId/end', async (req, res) => {
  await liveStreamController.endLiveStream(req, res);
});
router.get('/events/:eventId/status', async (req, res) => {
  await liveStreamController.getLiveStreamStatus(req, res);
});
router.get('/events/:eventId/token', async (req, res) => {
  await liveStreamController.generateViewerToken(req, res);
});

export default router;