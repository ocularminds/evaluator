const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

// Authenticate with YouTube Data API
async function authenticate() {
  const auth = new GoogleAuth({
    keyFile: 'api.key.json',
    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
  });

  const authClient = await auth.getClient();

  // Now, you can use `authClient` for making API requests.
}

authenticate();

// Create a YouTube Data API client
const youtube = google.youtube('v3');

// Category ID 22 for entertainment
const createMetaData = (title, description, tags)=> {
  return {
    snippet: {title, description, tags, categoryId: '22'},
    status: {
      privacyStatus: 'private',
    },
  };
};

// Upload video
const upload = (title, description, tags) => {
  const mediaPath = 'path-to-your-video.mp4';
  const fileSize = fs.statSync(mediaPath).size;
  youtube.videos.insert({
      auth: auth,
      part: 'snippet,status',
      media: {
        body: fs.createReadStream(mediaPath),
      },
      notifySubscribers: false,
      resource: createMetaData(title, description, tags),
    },
    {
      // Use mediaUploadProgress event to track upload progress
      onUploadProgress: (event) => {
        const progress = (event.bytesRead / fileSize) * 100;
        console.log(`Uploading: ${progress.toFixed(2)}% complete`);
      },
    },
    (err, data) => {
      if (err) {
        console.error('Error uploading video:', err);
      } else {
        console.log('Video uploaded successfully:', data.data.snippet.title);
      }
    }
  );
}