import { db } from '../lib/firebase';
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
  onSnapshot
} from 'firebase/firestore';

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
      'PrePrimaryContent': 'prePrimaryContent',
      'Kahanis': 'kahanis',
      'AppBasicSettings': 'appSettings',
      'Teachers': 'teachers',
      'SocialLinks': 'socialLinks',
      'SuccessStories': 'successStories'
    };
    return map[tabName] || tabName.toLowerCase();
  }

  async fetchCollection(tabName: string): Promise<any[]> {
    try {
      const colName = this.getCollectionName(tabName);
      const q = query(collection(db, colName));
      const querySnapshot = await getDocs(q);
      
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by createdat if it exists (descending)
      data.sort((a, b) => {
        if (a.createdat && b.createdat) {
          return new Date(b.createdat).getTime() - new Date(a.createdat).getTime();
        }
        return 0;
      });

      return data;
    } catch (error) {
      console.error(`Error fetching collection ${tabName}:`, error);
      return [];
    }
  }

  async writeToCollection(action: 'add' | 'update' | 'delete', tabName: string, data: any): Promise<{ success: boolean; message: string }> {
    try {
      const colName = this.getCollectionName(tabName);
      
      if (action === 'add') {
        const docData = {
          ...data,
          createdat: data.createdat || new Date().toISOString()
        };
        // Remove id if it exists to let Firestore auto-generate
        delete docData.id; 
        await addDoc(collection(db, colName), docData);
        return { success: true, message: 'Data added successfully.' };
      } 
      else if (action === 'update') {
        if (!data.id) throw new Error("Document ID is required for update");
        const docRef = doc(db, colName, data.id);
        const updateData = { ...data };
        delete updateData.id; // Don't save the id field inside the document
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
      console.error(`Error writing to collection ${tabName}:`, error);
      return { success: false, message: error.message || 'Failed to write to database.' };
    }
  }

  async getAllData(): Promise<AppData> {
    const [
      notifications, gallery, studyMaterials, toppers, users, 
      noticeBoard, prePrimaryContent, kahanis, appSettings, teachers, socialLinks,
      successStories, tests, testQuestions, testResults
    ] = await Promise.all([
      this.fetchCollection('Notifications'),
      this.fetchCollection('Gallery'),
      this.fetchCollection('StudyMaterials'),
      this.fetchCollection('Toppers'),
      this.fetchCollection('Users'),
      this.fetchCollection('NoticeBoard'),
      this.fetchCollection('PrePrimaryContent'),
      this.fetchCollection('Kahanis'),
      this.fetchCollection('AppBasicSettings'),
      this.fetchCollection('Teachers'),
      this.fetchCollection('SocialLinks'),
      this.fetchCollection('SuccessStories'),
      this.fetchCollection('Tests'),
      this.fetchCollection('TestQuestions'),
      this.fetchCollection('TestResults')
    ]);

    return {
      notifications, gallery, studyMaterials, toppers, users, 
      noticeBoard, prePrimaryContent, kahanis, appSettings, teachers, socialLinks,
      successStories, tests, testQuestions, testResults
    };
  }

  async login(username: string, password: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const colName = this.getCollectionName('Users');
      const q = query(collection(db, colName));
      const querySnapshot = await getDocs(q);
      
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      const user = users.find(u => 
        String(u.username || u.Username || '').trim() === username.trim() && 
        String(u.password || u.Password || '').trim() === password.trim()
      );
      
      if (user) {
        return { success: true, user };
      } else {
        return { success: false, message: 'Invalid username or password. Please contact your administrator if you need an account.' };
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
        // Fallback: check if user exists by email if uid is not found directly
        const users = await this.fetchCollection('Users');
        const user = users.find(u => u.uid === uid || u.id === uid);
        if (user) {
          return { success: true, data: user };
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
