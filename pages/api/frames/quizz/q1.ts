import { getQuizzQ1Frame } from "@app/frames/quizz/q1-frame";
import { getErrorFrame } from "@app/util/frames";

const options = {
  1: 'Incorrect. sDOLA is Inverse’s yield bearing stablecoin!',
  2: 'Correct!',
  3: 'Incorrect. sDOLA is Inverse’s yield bearing stablecoin!',
};

export default async function handler(req, res) {
  const data = req.body;
  const buttonId = data?.untrustedData?.buttonIndex;
  const fid = data?.untrustedData?.fid;
  const url = data?.untrustedData?.url;

  if(req?.query?.ask === 'true') {    
    return res.status(200).send(getQuizzQ1Frame());
  }
  else if (!fid || !options[buttonId]) {
    return res.status(200).send(getErrorFrame(url));
  }

  return res.status(200).send(getQuizzQ1Frame(options[buttonId]));
}