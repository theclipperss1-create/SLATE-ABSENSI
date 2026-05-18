import { db } from './config';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, writeBatch, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { AttendanceLog } from '@/types';

export async function submitAttendance(log: Omit<AttendanceLog, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'attendance_logs'), {
      ...log,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting attendance:', error);
    return { success: false, error };
  }
}

export async function getStudentLogs(userId: string) {
  try {
    const q = query(collection(db, 'attendance_logs'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const logs: AttendanceLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as AttendanceLog);
    });
    
    logs.sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeB.localeCompare(timeA);
    });
    
    return logs;
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
}

// Realtime subscription for student logs
export function subscribeToStudentLogs(userId: string, callback: (logs: AttendanceLog[]) => void) {
  const q = query(collection(db, 'attendance_logs'), where('userId', '==', userId));
  
  return onSnapshot(q, (querySnapshot) => {
    const logs: AttendanceLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as AttendanceLog);
    });
    
    logs.sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeB.localeCompare(timeA);
    });
    
    callback(logs);
  });
}

export async function getAllLogs() {
  try {
    const q = query(collection(db, 'attendance_logs'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const logs: AttendanceLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as AttendanceLog);
    });
    return logs;
  } catch (error) {
    console.error('Error getting all logs:', error);
    return [];
  }
}

// Realtime subscription for all logs (Admin)
export function subscribeToAllLogs(callback: (logs: AttendanceLog[]) => void) {
  const q = query(collection(db, 'attendance_logs'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const logs: AttendanceLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as AttendanceLog);
    });
    callback(logs);
  });
}

export async function deleteAllLogs() {
  try {
    const q = query(collection(db, 'attendance_logs'));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error deleting all logs:', error);
    return { success: false, error };
  }
}

export async function deleteLogsByDate(dateStr: string) {
  try {
    const q = query(collection(db, 'attendance_logs'), where('date', '==', dateStr));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error deleting logs by date:', error);
    return { success: false, error };
  }
}

export async function seedDummyData() {
  const names = ['Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dedi Irawan', 'Eka Putri', 'Fajar Bahari', 'Gita Permata', 'Hadi Wijaya', 'Indah Lestari', 'Joko Susilo'];
  const statuses = ['Hadir', 'Izin', 'Sakit', 'Alpa'];
  
  try {
    const batch = writeBatch(db);
    const now = new Date();
    const currentDay = now.getDay();
    // Get Monday of current week
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    
    for (let i = 0; i < 35; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomDay = Math.floor(Math.random() * 5) + 1; // 1 to 5 (Mon to Fri)
      
      // Create a new date object for this specific log
      const logDate = new Date(now.getFullYear(), now.getMonth(), diff);
      logDate.setDate(logDate.getDate() + (randomDay - 1));
      logDate.setHours(7, 15, Math.floor(Math.random() * 60), 0);
      
      const dateStr = logDate.toLocaleDateString('id-ID');
      
      const docRef = doc(collection(db, 'attendance_logs'));
      batch.set(docRef, {
        userId: `dummy_user_${Math.floor(Math.random() * 10)}`, // Simulate 10 users
        userName: randomName,
        status: randomStatus,
        date: dateStr,
        time: `07:15:${Math.floor(Math.random() * 60)}`,
        selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        createdAt: logDate,
      });
    }
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, error };
  }
}

export async function getSchedule() {
  try {
    const docRef = doc(db, 'settings', 'schedule');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    } else {
      const defaultSchedule = [
        { id: 1, time: '07:30', subject: 'Pemrograman Web (Next.js)' },
        { id: 2, time: '09:30', subject: 'Desain Sistem & UI/UX' },
        { id: 3, time: '11:00', subject: 'Basis Data NoSQL (Firestore)' },
        { id: 4, time: '13:00', subject: 'Praktik Industri' },
      ];
      await setDoc(docRef, { items: defaultSchedule });
      return defaultSchedule;
    }
  } catch (error) {
    console.error('Error getting schedule:', error);
    return [];
  }
}

export async function updateSchedule(items: any[]) {
  try {
    const docRef = doc(db, 'settings', 'schedule');
    await setDoc(docRef, { items });
    return { success: true };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return { success: false, error };
  }
}

export async function setAnnouncement(text: string) {
  try {
    await setDoc(doc(db, 'settings', 'announcement'), {
      text,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting announcement:', error);
    return { success: false, error };
  }
}

export function subscribeToAnnouncement(callback: (text: string) => void) {
  return onSnapshot(doc(db, 'settings', 'announcement'), (doc) => {
    if (doc.exists()) {
      callback(doc.data().text);
    } else {
      callback('');
    }
  });
}

export async function getTimeLockSettings() {
  try {
    const docRef = doc(db, 'settings', 'time_lock');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure days exists for backward compatibility
      if (!data.days) {
        data.days = [1, 2, 3, 4, 5];
      }
      return data;
    } else {
      const defaultSettings = { startTime: '05:00', endTime: '07:00', days: [1, 2, 3, 4, 5] };
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting time lock settings:', error);
    return { startTime: '05:00', endTime: '07:00', days: [1, 2, 3, 4, 5] };
  }
}

export async function updateTimeLockSettings(settings: { startTime: string; endTime: string; days: number[] }) {
  try {
    const docRef = doc(db, 'settings', 'time_lock');
    await setDoc(docRef, settings);
    return { success: true };
  } catch (error) {
    console.error('Error updating time lock settings:', error);
    return { success: false, error };
  }
}
