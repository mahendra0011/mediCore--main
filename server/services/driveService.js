import { google } from 'googleapis';

// Decode escaped newlines in private key (from .env)
const decodePrivateKey = (key) => {
  if (!key) return '';
  // Try multiple newline formats
  let decoded = key.replace(/\\n/g, '\n'); // \n -> actual newline
  decoded = decoded.replace(/\\r/g, '');   // remove \r if present
  decoded = decoded.replace(/^"|"$/g, ''); // remove surrounding quotes
  return decoded;
};

const GOOGLE_CREDENTIALS = {
  type: "service_account",
  project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
  private_key: decodePrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
  client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLOUD_CLIENT_EMAIL)}`,
};

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '17ycMzOyZRplmM_OX-Yg2k7qMx-T0Jup-';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const uploadToGoogleDrive = async (fileBuffer, filename, mimeType) => {
  try {
    const fileMetadata = {
      name: filename,
      parents: [FOLDER_ID],
    };

    const media = {
      mimeType: mimeType,
      body: fileBuffer,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    const file = response.data;

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: file.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      id: file.id,
      url: file.webContentLink || `https://drive.google.com/uc?id=${file.id}&export=download`,
      filename: filename,
      fileId: file.id,
    };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw error;
  }
};

export default drive;
