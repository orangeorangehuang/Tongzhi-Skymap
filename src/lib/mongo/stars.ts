import clientPromise from '.';
import { Collection, Db } from 'mongodb';

let client;
let db: Db;
let stars: Collection;

const init = async () => {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db('tongzhi_skymap');
    stars = db.collection('star');
    console.log("Connected to mongodb.")
  } catch (error) {
    throw new Error('Failed to establish connection to mongodb.');
  }
};

export const getStarById = async (star_id: String) => {
  try {
    if (!stars) await init();
    const result = await stars.findOne({ 'star_id': String(star_id) });
    return { star: result};
  } catch (error) {
    throw new Error('Failed to fetch star.');
    // return { error: 'Failed to fetch star.' };
  }
};

export const getStarByName = async (name: String) => {
  try {
    if (!stars) await init();
    const result = await stars.findOne({ 'name': String(name) });
    return { star: result};
  } catch (error) {
    throw new Error('Failed to fetch star.');
    // return { error: 'Failed to fetch star.' };
  }
};

export const getStars = async () => {
  try {
    if (!stars) await init();
    const result = await stars.find({}).toArray();
    return { star: result};
  } catch (error) {
    throw new Error('Failed to fetch stars.');
    // return { error: 'Failed to fetch star.' };
  }
};
