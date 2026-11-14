export type NoteWorkEntry = {
  id: string;
  scope: string;
  kind: 'note';
  title: string;
  content: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
};

export type FileWorkEntry = {
  id: string;
  scope: string;
  kind: 'file';
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  file: Blob;
  createdAt: string;
  updatedAt: string;
};

export type StudyWorkEntry = NoteWorkEntry | FileWorkEntry;

const DATABASE_NAME = 'studyme-work-v1';
const DATABASE_VERSION = 1;
const STORE_NAME = 'work-items';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('This browser does not support local file storage.'));
  }
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: ['scope', 'id'] });
        store.createIndex('byScope', 'scope', { unique: false });
      }
    };

    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('Could not open browser storage.'));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error('Browser storage is busy in another StudyMe tab. Close that tab and try again.'));
    };
  });

  return databasePromise;
}

export async function listStudyWork(scope: string): Promise<StudyWorkEntry[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).index('byScope').getAll(scope);
    request.onsuccess = () => resolve(request.result as StudyWorkEntry[]);
    request.onerror = () => reject(request.error ?? new Error('Could not read saved work.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not read saved work.'));
  });
}

export async function saveStudyWork(entry: StudyWorkEntry): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(entry);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save this item.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not save this item.'));
  });
}

export async function deleteStudyWork(scope: string, id: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete([scope, id]);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not delete this item.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not delete this item.'));
  });
}
