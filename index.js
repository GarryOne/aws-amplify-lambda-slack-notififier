const integrationURL = ''; // Set your Slack Webhook URL

const mainAmplifyAppURL = 'https://main.d3d9a90v2cc2tb.amplifyapp.com/';
const realDomainAppURL = 'https://forum.useadrenaline.com';

const amplifyBuildURLPattern = /Go to (https:\/\/console\.aws\.amazon\.com\/amplify\/home\?region=us-east-1#\w+\/main\/\d+)/

function transformMessage(message) {
  // Remove the static portion
  let transformed = message.replace("Build notification from the AWS Amplify Console for app: ", "");

  // Replace initial URL
  transformed = transformed.replace(mainAmplifyAppURL, realDomainAppURL);

  // Capture and bold the build status
  transformed = transformed.replace(/Your build status is (\w+)\./, (match, status) => {
    return `\nYour build status is *${status}*.\n`;
  });

  // Replace the long URL for build details with the shortened version
  transformed = transformed.replace(amplifyBuildURLPattern, "Go <$1|here>");

  return transformed;
}

exports.handler = async (event) => {
  const message = event?.Records[0]?.Sns?.Message?.slice(1, -1);
  const timestamp = (new Date(event?.Records[0]?.Sns?.Timestamp)).getTime()/1000;
  let color = "warning";
  if(message.includes("FAILED")) {
    color = "danger"
  } else if (message.includes("SUCCEED")) {
    color = "good"
  }

  const slackMessage = {
    attachments: [{
      color,
      text: transformMessage(message),
      ts: timestamp,
    }]
  }

  return await fetch(integrationURL, {
    method: 'POST',
    body: JSON.stringify(slackMessage),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((data) => console.log('sent!'))
    .catch((e) => console.error(e.response.data))
}
