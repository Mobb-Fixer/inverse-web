import { FRAME_BASE_URL } from '@app/util/frames';
import { getFramePngBuffer } from '@app/util/frames-server';

export default async function handler(req, res) {
    try {
        const pngBuffer = await getFramePngBuffer({
            title: 'Stay in-the-know about sDOLA',
            subtitle: "Subscribe to Inverse's weekly newsletter",
            imageSrc: FRAME_BASE_URL+'/assets/sDOLAx512.png',
        });
        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=31536000');
        res.send(pngBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}
