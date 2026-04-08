import { db, auth } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc,
  where,
  onSnapshot
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AppData {
  notifications: any[];
  gallery: any[];
  studyMaterials: any[];
  toppers: any[];
  users: any[];
  tests: any[];
  testQuestions: any[];
  testResults: any[];
  noticeBoard: any[];
  prePrimaryContent: any[];
  kahanis: any[];
  appSettings: any[];
  teachers: any[];
  socialLinks: any[];
  successStories: any[];
}

class FirebaseService {
  
  // Helper to map tab names to Firestore collection names
  private getCollectionName(tabName: string): string {
    const map: Record<string, string> = {
      'Notifications': 'notifications',
      'Gallery': 'gallery',
      'StudyMaterials': 'studyMaterials',
      'Toppers': 'toppers',
      'Users': 'users',
      'Tests': 'tests',
      'TestQuestions': 'testQuestions',
      'TestResults': 'testResults',
      'NoticeBoard': 'noticeBoard',
      'prePrimaryContent': 'prePrimaryContent',
      'Kahanis': 'kahanis',
      'AppBasicSettings': 'appSettings',
      'Teachers': 'teachers',
      'SocialLinks': 'socialLinks',
      'SuccessStories': 'successStories'
    };
    
    return map[tabName] || tabName;
  }

  async fetchCollection(tabName: string, filters?: { field: string; value: any }[]): Promise<any[]> {
    const colName = this.getCollectionName(tabName);
    try {
      let q = query(collection(db, colName));
      
      if (filters) {
        filters.forEach(f => {
          q = query(q, where(f.field, '==', f.value));
        });
      }

      const querySnapshot = await getDocs(q);
      
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      return this.sortData(data);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.LIST, colName);
      }
      console.error(`Error fetching collection ${tabName}:`, error);
      return [];
    }
  }

  subscribeToCollection(tabName: string, callback: (data: any[]) => void, filters?: { field: string; value: any }[]): () => void {
    const colName = this.getCollectionName(tabName);
    let q = query(collection(db, colName));
    
    if (filters) {
      filters.forEach(f => {
        q = query(q, where(f.field, '==', f.value));
      });
    }
    
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      callback(this.sortData(data));
    }, (error) => {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.LIST, colName);
      }
      console.error(`Error subscribing to ${tabName}:`, error);
    });
  }

  private sortData(data: any[]): any[] {
    return [...data].sort((a, b) => {
      if (a.createdat && b.createdat) {
        return new Date(b.createdat).getTime() - new Date(a.createdat).getTime();
      }
      return 0;
    });
  }

  async writeToCollection(action: 'add' | 'update' | 'delete', tabName: string, data: any): Promise<{ success: boolean; message: string }> {
    const colName = this.getCollectionName(tabName);
    try {
      if (action === 'add') {
        const docData = {
          ...data,
          createdat: data.createdat || new Date().toISOString()
        };
        delete docData.id; 
        await addDoc(collection(db, colName), docData);
        return { success: true, message: 'Data added successfully.' };
      } 
      else if (action === 'update') {
        if (!data.id) throw new Error("Document ID is required for update");
        const docRef = doc(db, colName, data.id);
        const updateData = { ...data };
        delete updateData.id;
        await updateDoc(docRef, updateData);
        return { success: true, message: 'Data updated successfully.' };
      } 
      else if (action === 'delete') {
        if (!data.id) throw new Error("Document ID is required for delete");
        await deleteDoc(doc(db, colName, data.id));
        return { success: true, message: 'Data deleted successfully.' };
      }
      
      return { success: false, message: 'Invalid action.' };
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.WRITE, colName);
      }
      console.error(`Error writing to collection ${tabName}:`, error);
      return { success: false, message: error.message || 'Failed to write to database.' };
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const colName = this.getCollectionName('Users');
      const q = query(collection(db, colName), where('username', '==', username.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, message: 'Invalid username or password.' };
      }

      const userDoc = querySnapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as any;

      if (String(user.password || '').trim() === password.trim()) {
        return { success: true, user };
      } else {
        return { success: false, message: 'Invalid username or password.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: `Database Error: ${error.message}` };
    }
  }

  getSetting(settings: any[], key: string, defaultValue: string = ''): string {
    if (!settings || !Array.isArray(settings)) return defaultValue;
    const setting = settings.find(s => s.key === key || s.settingkey === key);
    return setting ? (setting.value || setting.settingvalue || defaultValue) : defaultValue;
  }

  async getUserProfile(uid: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        // Fallback: query by uid field if doc ID is not the uid
        const q = query(collection(db, 'users'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
        }
        return { success: false, message: 'User profile not found.' };
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return { success: false, message: error.message };
    }
  }

  async logout(): Promise<void> {
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async updateUserStatus(userId: string, active: boolean, role?: string): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'users', userId);
      const updateData: any = { active };
      if (role) {
        updateData.role = role;
      }
      await updateDoc(docRef, updateData);
      return { success: true, message: 'User updated successfully.' };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return { success: false, message: error.message || 'Failed to update user.' };
    }
  }
}

export const firebaseService = new FirebaseService();
