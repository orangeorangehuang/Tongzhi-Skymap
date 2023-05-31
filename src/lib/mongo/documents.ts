import clientPromise from '.';
import { Collection, Db } from 'mongodb';

let client;
let db: Db;
let document: Collection;

const init = async () => {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db('tongzhi_skymap');
    document = db.collection('document');
    console.log("Connected to mongodb.")
  } catch (error) {
    throw new Error('Failed to establish connection to mongodb.');
  }
};

export const getDocumentById = async (filename: String) => {
  try {
    if (!document) await init();
    const result = await document.findOne({ 'filename': String(filename) });
    return { document: result};
  } catch (error) {
    throw new Error('Failed to fetch constellation.');
    // return { error: 'Failed to fetch star.' };
  }
};