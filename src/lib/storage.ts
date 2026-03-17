import { S3Client } from '@aws-sdk/client-s3';

const region = import.meta.env.VITE_OCI_REGION;
const accessKeyId = import.meta.env.VITE_OCI_ACCESS_KEY;
const secretAccessKey = import.meta.env.VITE_OCI_SECRET_KEY;
const namespace = import.meta.env.VITE_OCI_NAMESPACE;

// OCI S3 Compatibility endpoint
const endpoint = `https://${namespace}.compat.objectstorage.${region}.oraclecloud.com`;

export const s3Client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
  forcePathStyle: true, // Required for OCI S3 compatibility
});

export const OCI_CONFIG = {
  bucket: import.meta.env.VITE_OCI_BUCKET || '',
  namespace: namespace || '',
};
