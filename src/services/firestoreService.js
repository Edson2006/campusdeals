// src/services/firestoreService.js
// Service pour toutes les opérations Firestore

import { db, auth, storage } from './firebase';
import {
  doc,
  setDoc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  addDoc,
  limit,
  onSnapshot,
  startAfter
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PROFILE_PHOTOS_ROOT = 'profilePhotos';
const ANNONCES_PHOTOS_ROOT = 'annonces';

const buildStoragePath = (segments) => segments.filter(Boolean).join('/');

const safeTimestampToMillis = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value.toMillis === 'function') return value.toMillis();
  return 0;
};

const sortByNewest = (items) =>
  [...items].sort((a, b) => safeTimestampToMillis(b.createdAt) - safeTimestampToMillis(a.createdAt));

const mapDocs = (snapshot) =>
  snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }));

const normalizeParticipants = (ids) => [...new Set(ids.filter(Boolean))].sort();

const buildConversationId = (annonceId, buyerId, sellerId) => {
  const participantKey = normalizeParticipants([buyerId, sellerId]).join('__');
  return `${annonceId}__${participantKey}`;
};

const sortByLatestUpdate = (items) =>
  [...items].sort(
    (a, b) => safeTimestampToMillis(b.updatedAt || b.createdAt) - safeTimestampToMillis(a.updatedAt || a.createdAt)
  );

const DEFAULT_ANNONCES_PAGE_SIZE = 12;

const uploadFilesAndGetUrls = async (files, pathSegments) => {
  if (!files?.length) return [];

  const uploads = await Promise.all(
    Array.from(files).map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = buildStoragePath([...pathSegments, fileName]);
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    })
  );

  return uploads;
};

/**
 * Crée un profil utilisateur dans Firestore après l'inscription.
 * Respecte le modèle de la collection 'users'.
 */
export const createUserProfile = async (user, additionalData) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);

  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: additionalData.displayName || 'Étudiant AMU',
      promo: additionalData.promo || '',
      createdAt: Timestamp.now(),
      photoURL: user.photoURL || '',
      rating: { average: 0, count: 0 }
    });
  } catch (error) {
    console.error('Erreur création profil:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, updates) => {
  if (!uid) throw new Error('Identifiant utilisateur manquant.');
  const userRef = doc(db, 'users', uid);
  await setDoc(
    userRef,
    {
      ...updates,
      updatedAt: Timestamp.now()
    },
    { merge: true }
  );
};

export const uploadProfilePhoto = async (uid, file) => {
  if (!uid || !file) return null;
  const urls = await uploadFilesAndGetUrls([file], [PROFILE_PHOTOS_ROOT, uid]);
  return urls[0] || null;
};

/**
 * Récupère un profil utilisateur (nécessaire pour la dénormalisation).
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
};

export const ensureUserProfile = async (user) => {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }

  const defaultProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Étudiant AMU',
    promo: '',
    createdAt: Timestamp.now(),
    photoURL: user.photoURL || '',
    rating: { average: 0, count: 0 }
  };

  await setDoc(userRef, defaultProfile);
  return defaultProfile;
};

/**
 * Crée une nouvelle annonce en respectant la dénormalisation.
 */
export const createAnnonce = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Vous devez être connecté.');

  const userProfile = await ensureUserProfile(user);

  const annonceRef = doc(collection(db, 'annonces'));
  const imageUrls = await uploadFilesAndGetUrls(
    data.imageFiles,
    [ANNONCES_PHOTOS_ROOT, user.uid, annonceRef.id]
  );

  try {
    await setDoc(annonceRef, {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      createdAt: Timestamp.now(),
      status: 'active',
      imageUrls,
      authorId: user.uid,
      authorDisplayName: userProfile?.displayName || 'Vendeur',
      authorPhotoURL: userProfile?.photoURL || ''
    });
    return annonceRef.id;
  } catch (error) {
    console.error('Erreur création annonce:', error);
    throw error;
  }
};

/**
 * Récupère toutes les annonces actives.
 */
const buildActiveAnnoncesQuery = ({ pageSize, cursor }) => {
  const constraints = [where('status', '==', 'active'), orderBy('createdAt', 'desc')];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }
  if (typeof pageSize === 'number') {
    constraints.push(limit(pageSize));
  }
  return query(collection(db, 'annonces'), ...constraints);
};

export const fetchActiveAnnoncesPage = async ({ pageSize = DEFAULT_ANNONCES_PAGE_SIZE, startAfterDoc = null } = {}) => {
  try {
    const snapshot = await getDocs(buildActiveAnnoncesQuery({ pageSize, cursor: startAfterDoc }));
    const annonces = mapDocs(snapshot);
    const newCursor = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null;
    return {
      items: annonces,
      cursor: newCursor,
      hasMore: snapshot.size === pageSize
    };
  } catch (error) {
    console.error('Erreur récupération annonces paginées:', error);
    throw error;
  }
};

export const getActiveAnnonces = async (options = {}) => {
  const page = await fetchActiveAnnoncesPage(options);
  return page.items;
};

export const getUserAnnonces = async (uid) => {
  return getAnnoncesByAuthor(uid);
};

export const getAnnonceById = async (annonceId) => {
  if (!annonceId) return null;
  const annonceRef = doc(db, 'annonces', annonceId);
  const snapshot = await getDoc(annonceRef);
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() };
};

export const getAnnoncesByAuthor = async (authorId) => {
  if (!authorId) return [];
  try {
    const q = query(
      collection(db, 'annonces'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return mapDocs(querySnapshot);
  } catch (error) {
    console.error('Erreur récupération annonces vendeur:', error);
    if (error.code === 'failed-precondition') {
      const fallbackSnapshot = await getDocs(
        query(collection(db, 'annonces'), where('authorId', '==', authorId))
      );
      return sortByNewest(mapDocs(fallbackSnapshot));
    }
    throw error;
  }
};

export const updateAnnonce = async (annonceId, data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Vous devez être connecté.');
  if (!annonceId) throw new Error("Identifiant de l'annonce manquant");

  const annonceRef = doc(db, 'annonces', annonceId);
  const retainImageUrls = data.retainImageUrls || [];
  const newImageUrls = await uploadFilesAndGetUrls(
    data.imageFiles,
    [ANNONCES_PHOTOS_ROOT, user.uid, annonceId]
  );

  const payload = {
    title: data.title,
    description: data.description,
    price: Number(data.price),
    category: data.category,
    imageUrls: [...retainImageUrls, ...newImageUrls],
    updatedAt: Timestamp.now()
  };

  if (typeof data.status === 'string') {
    payload.status = data.status;
  }

  await updateDoc(annonceRef, payload);
};

export const deleteAnnonce = async (annonceId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Vous devez être connecté.');
  if (!annonceId) throw new Error("Identifiant de l'annonce manquant");

  const annonceRef = doc(db, 'annonces', annonceId);
  await deleteDoc(annonceRef);
};

export const syncAnnoncesAuthorInfo = async (uid, profile) => {
  if (!uid) return;
  const annonces = await getUserAnnonces(uid);
  await Promise.all(
    annonces.map((annonce) =>
      updateDoc(doc(db, 'annonces', annonce.id), {
        authorDisplayName: profile.displayName || 'Vendeur',
        authorPhotoURL: profile.photoURL || ''
      })
    )
  );
};

export const ensureConversationForAnnonce = async (annonce) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Vous devez être connecté.');
  if (!annonce?.id) throw new Error("Annonce invalide.");
  if (!annonce.authorId) throw new Error('Cette annonce ne possède pas de vendeur.');
  if (user.uid === annonce.authorId) throw new Error('Vous êtes le vendeur de cette annonce.');

  const participants = normalizeParticipants([user.uid, annonce.authorId]);
  const conversationId = buildConversationId(annonce.id, user.uid, annonce.authorId);
  const conversationRef = doc(db, 'conversations', conversationId);
  const snapshot = await getDoc(conversationRef);

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }

  const createdAt = Timestamp.now();
  const conversationData = {
    annonceId: annonce.id,
    annonceTitle: annonce.title || '',
    annoncePrice: annonce.price ?? null,
    annonceThumbnail: Array.isArray(annonce.imageUrls) ? annonce.imageUrls[0] || '' : '',
    participants,
    buyerId: user.uid,
    sellerId: annonce.authorId,
    createdAt,
    updatedAt: createdAt,
    lastMessage: null
  };

  await setDoc(conversationRef, conversationData);
  return { id: conversationId, ...conversationData };
};

export const sendConversationMessage = async (conversationId, content) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Vous devez être connecté.');
  if (!conversationId) throw new Error('Conversation invalide.');
  const trimmedContent = content?.trim();
  if (!trimmedContent) throw new Error('Message vide.');

  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnapshot = await getDoc(conversationRef);
  if (!conversationSnapshot.exists()) throw new Error('Conversation introuvable.');

  const conversation = conversationSnapshot.data();
  if (!conversation.participants?.includes(user.uid)) {
    throw new Error('Accès refusé pour cette conversation.');
  }

  const sentAt = Timestamp.now();
  const messagePayload = {
    content: trimmedContent,
    senderId: user.uid,
    createdAt: sentAt,
    status: 'sent'
  };

  await addDoc(collection(conversationRef, 'messages'), messagePayload);
  await updateDoc(conversationRef, {
    lastMessage: messagePayload,
    updatedAt: sentAt
  });
};

export const getConversationMessages = async (conversationId, options = {}) => {
  if (!conversationId) return [];
  const { limit: limitCount = 50 } = options;
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'), limit(limitCount));
  const snapshot = await getDocs(messagesQuery);
  return mapDocs(snapshot);
};

export const subscribeToConversationMessages = (conversationId, callback, options = {}) => {
  if (!conversationId || typeof callback !== 'function') return () => {};
  const { limit: limitCount } = options;
  let messagesQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  if (typeof limitCount === 'number') {
    messagesQuery = query(messagesQuery, limit(limitCount));
  }
  return onSnapshot(messagesQuery, callback);
};

export const getUserConversations = async (uid) => {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(conversationsQuery);
    return mapDocs(snapshot);
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    if (error.code === 'failed-precondition') {
      const fallbackSnapshot = await getDocs(
        query(collection(db, 'conversations'), where('participants', 'array-contains', userId))
      );
      const conversations = mapDocs(fallbackSnapshot);
      return sortByLatestUpdate(conversations);
    }
    throw error;
  }
};

export const subscribeToUserConversations = (uid, callback) => {
  const userId = uid || auth.currentUser?.uid;
  if (!userId || typeof callback !== 'function') return () => {};
  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(conversationsQuery, callback, (error) => {
      console.error('Erreur flux conversations:', error);
    });
  } catch (error) {
    console.error('Erreur initialisation flux conversations:', error);
    return () => {};
  }
};
