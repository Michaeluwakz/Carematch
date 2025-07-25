import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { uid } = req.query;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid uid' });
  }
  try {
    await deleteDoc(doc(db, 'users', uid));
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
} 