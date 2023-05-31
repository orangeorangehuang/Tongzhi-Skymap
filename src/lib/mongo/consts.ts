import clientPromise from '.';
import { Collection, Db } from 'mongodb';

let client;
let db: Db;
let consts: Collection;

const init = async () => {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db('tongzhi_skymap');
    consts = db.collection('const');
    console.log("Connected to mongodb.")
  } catch (error) {
    throw new Error('Failed to establish connection to mongodb.');
  }
};

export const getConstById = async (const_id: String) => {
  try {
    if (!consts) await init();
    const result = await consts.findOne({ 'const_id': String(const_id) });
    return { const: result};
  } catch (error) {
    throw new Error('Failed to fetch constellation.');
    // return { error: 'Failed to fetch star.' };
  }
};

export const getConstByName = async (name: String) => {
  try {
    if (!consts) await init();
    const result = await consts.findOne({ 'name': String(name) });
    return { const: result};
  } catch (error) {
    throw new Error('Failed to fetch constellation.');
    // return { error: 'Failed to fetch star.' };
  }
};