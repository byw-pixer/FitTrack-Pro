// Класс для работы с IndexedDB
export class IndexedDB {
  private db: IDBDatabase | null = null
  private dbName: string
  private version: number
  private stores: {
    name: string
    keyPath: string
    indexes?: { name: string; keyPath: string; options?: IDBIndexParameters }[]
  }[]

  constructor(
    dbName: string,
    version: number,
    stores: {
      name: string
      keyPath: string
      indexes?: { name: string; keyPath: string; options?: IDBIndexParameters }[]
    }[],
  ) {
    this.dbName = dbName
    this.version = version
    this.stores = stores
  }

  // Инициализация базы данных
  async init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Создаем хранилища данных
        this.stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath })

            // Создаем индексы, если они указаны
            if (store.indexes) {
              store.indexes.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, index.options)
              })
            }
          }
        })
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(true)
      }

      request.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error)
        reject((event.target as IDBOpenDBRequest).error)
      }
    })
  }

  // Добавление или обновление данных
  async put(storeName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Получение данных по ключу
  async get(storeName: string, key: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Получение всех данных из хранилища
  async getAll(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Удаление данных по ключу
  async delete(storeName: string, key: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Очистка хранилища
  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Закрытие соединения с базой данных
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Инициализация базы данных для приложения
export const initDatabase = async () => {
  const db = new IndexedDB("fitTrackDB", 1, [
    {
      name: "workouts",
      keyPath: "id",
      indexes: [
        { name: "date", keyPath: "date" },
        { name: "type", keyPath: "type" },
      ],
    },
    {
      name: "goals",
      keyPath: "id",
    },
    {
      name: "userProfile",
      keyPath: "id",
    },
  ])

  try {
    await db.init()
    return db
  } catch (error) {
    console.error("Failed to initialize database:", error)
    // Fallback to localStorage if IndexedDB fails
    return null
  }
}

// Функции для работы с данными

// Сохранение тренировок
export const saveWorkouts = async (workouts) => {
  try {
    const db = await initDatabase()
    if (db) {
      // Сначала очищаем хранилище
      await db.clear("workouts")

      // Затем добавляем все тренировки
      for (const workout of workouts) {
        await db.put("workouts", workout)
      }

      db.close()
      return true
    } else {
      // Fallback to localStorage
      localStorage.setItem("workouts", JSON.stringify(workouts))
      return true
    }
  } catch (error) {
    console.error("Error saving workouts:", error)
    // Fallback to localStorage
    localStorage.setItem("workouts", JSON.stringify(workouts))
    return false
  }
}

// Загрузка тренировок
export const loadWorkouts = async () => {
  try {
    const db = await initDatabase()
    if (db) {
      const workouts = await db.getAll("workouts")
      db.close()
      return workouts
    } else {
      // Fallback to localStorage
      const savedWorkouts = localStorage.getItem("workouts")
      return savedWorkouts ? JSON.parse(savedWorkouts) : []
    }
  } catch (error) {
    console.error("Error loading workouts:", error)
    // Fallback to localStorage
    const savedWorkouts = localStorage.getItem("workouts")
    return savedWorkouts ? JSON.parse(savedWorkouts) : []
  }
}

// Сохранение целей
export const saveGoals = async (goals) => {
  try {
    const db = await initDatabase()
    if (db) {
      await db.clear("goals")
      for (const goal of goals) {
        await db.put("goals", goal)
      }
      db.close()
      return true
    } else {
      localStorage.setItem("goals", JSON.stringify(goals))
      return true
    }
  } catch (error) {
    console.error("Error saving goals:", error)
    localStorage.setItem("goals", JSON.stringify(goals))
    return false
  }
}

// Загрузка целей
export const loadGoals = async () => {
  try {
    const db = await initDatabase()
    if (db) {
      const goals = await db.getAll("goals")
      db.close()
      return goals
    } else {
      const savedGoals = localStorage.getItem("goals")
      return savedGoals ? JSON.parse(savedGoals) : []
    }
  } catch (error) {
    console.error("Error loading goals:", error)
    const savedGoals = localStorage.getItem("goals")
    return savedGoals ? JSON.parse(savedGoals) : []
  }
}

// Сохранение профиля пользователя
export const saveUserProfile = async (profile) => {
  try {
    const db = await initDatabase()
    if (db) {
      await db.put("userProfile", { ...profile, id: 1 }) // Используем id=1 для единственного профиля
      db.close()
      return true
    } else {
      localStorage.setItem("userProfile", JSON.stringify(profile))
      return true
    }
  } catch (error) {
    console.error("Error saving user profile:", error)
    localStorage.setItem("userProfile", JSON.stringify(profile))
    return false
  }
}

// Загрузка профиля пользователя
export const loadUserProfile = async () => {
  try {
    const db = await initDatabase()
    if (db) {
      const profile = await db.get("userProfile", 1) // Получаем профиль с id=1
      db.close()
      return profile || null
    } else {
      const savedProfile = localStorage.getItem("userProfile")
      return savedProfile ? JSON.parse(savedProfile) : null
    }
  } catch (error) {
    console.error("Error loading user profile:", error)
    const savedProfile = localStorage.getItem("userProfile")
    return savedProfile ? JSON.parse(savedProfile) : null
  }
}

// Очистка всех данных
export const clearAllData = async () => {
  try {
    const db = await initDatabase()
    if (db) {
      await db.clear("workouts")
      await db.clear("goals")
      await db.clear("userProfile")
      db.close()
    }

    // Очищаем также localStorage для полной очистки
    localStorage.clear()
    return true
  } catch (error) {
    console.error("Error clearing data:", error)
    // Пытаемся очистить хотя бы localStorage
    localStorage.clear()
    return false
  }
}
