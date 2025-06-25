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

// Обновим структуру базы данных для поддержки нескольких профилей
// Добавим новое хранилище для профилей и обновим существующие функции

// Изменим инициализацию базы данных, добавив хранилище для профилей
export const initDatabase = async () => {
  const db = new IndexedDB("fitTrackDB", 2, [
    {
      name: "workouts",
      keyPath: "id",
      indexes: [
        { name: "date", keyPath: "date" },
        { name: "type", keyPath: "type" },
        { name: "profileId", keyPath: "profileId" },
      ],
    },
    {
      name: "goals",
      keyPath: "id",
      indexes: [{ name: "profileId", keyPath: "profileId" }],
    },
    {
      name: "userProfile",
      keyPath: "id",
    },
    {
      name: "profiles",
      keyPath: "id",
      indexes: [{ name: "name", keyPath: "name" }],
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

// Добавим функции для работы с профилями
export const saveProfiles = async (profiles) => {
  try {
    const db = await initDatabase()
    if (db) {
      // Сначала очищаем хранилище
      await db.clear("profiles")

      // Затем добавляем все профили
      for (const profile of profiles) {
        await db.put("profiles", profile)
      }

      db.close()
      return true
    } else {
      // Fallback to localStorage
      localStorage.setItem("profiles", JSON.stringify(profiles))
      return true
    }
  } catch (error) {
    console.error("Error saving profiles:", error)
    // Fallback to localStorage
    localStorage.setItem("profiles", JSON.stringify(profiles))
    return false
  }
}

export const loadProfiles = async () => {
  try {
    const db = await initDatabase()
    if (db) {
      const profiles = await db.getAll("profiles")
      db.close()
      return profiles
    } else {
      // Fallback to localStorage
      const savedProfiles = localStorage.getItem("profiles")
      return savedProfiles ? JSON.parse(savedProfiles) : []
    }
  } catch (error) {
    console.error("Error loading profiles:", error)
    // Fallback to localStorage
    const savedProfiles = localStorage.getItem("profiles")
    return savedProfiles ? JSON.parse(savedProfiles) : []
  }
}

// Обновим функции для работы с тренировками, чтобы они учитывали profileId
export const saveWorkouts = async (workouts, profileId) => {
  try {
    const db = await initDatabase()
    if (db) {
      // Удаляем только тренировки текущего профиля
      const allWorkouts = await db.getAll("workouts")
      const otherWorkouts = allWorkouts.filter((w) => w.profileId !== profileId)

      await db.clear("workouts")

      // Добавляем тренировки других профилей
      for (const workout of otherWorkouts) {
        await db.put("workouts", workout)
      }

      // Добавляем тренировки текущего профиля
      for (const workout of workouts) {
        await db.put("workouts", { ...workout, profileId })
      }

      db.close()
      return true
    } else {
      // Fallback to localStorage
      const allWorkoutsStr = localStorage.getItem("workouts") || "[]"
      const allWorkouts = JSON.parse(allWorkoutsStr)
      const otherWorkouts = allWorkouts.filter((w) => w.profileId !== profileId)
      const updatedWorkouts = [...otherWorkouts, ...workouts.map((w) => ({ ...w, profileId }))]
      localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))
      return true
    }
  } catch (error) {
    console.error("Error saving workouts:", error)
    return false
  }
}

export const loadWorkouts = async (profileId) => {
  try {
    const db = await initDatabase()
    if (db) {
      const allWorkouts = await db.getAll("workouts")
      const profileWorkouts = allWorkouts.filter((workout) => workout.profileId === profileId)
      db.close()
      return profileWorkouts
    } else {
      // Fallback to localStorage
      const savedWorkouts = localStorage.getItem("workouts")
      const allWorkouts = savedWorkouts ? JSON.parse(savedWorkouts) : []
      return allWorkouts.filter((workout) => workout.profileId === profileId)
    }
  } catch (error) {
    console.error("Error loading workouts:", error)
    return []
  }
}

// Обновим функции для работы с целями, чтобы они учитывали profileId
export const saveGoals = async (goals, profileId) => {
  try {
    const db = await initDatabase()
    if (db) {
      // Удаляем только цели текущего профиля
      const allGoals = await db.getAll("goals")
      const otherGoals = allGoals.filter((g) => g.profileId !== profileId)

      await db.clear("goals")

      // Добавляем цели других профилей
      for (const goal of otherGoals) {
        await db.put("goals", goal)
      }

      // Добавляем цели текущего профиля
      for (const goal of goals) {
        await db.put("goals", { ...goal, profileId })
      }

      db.close()
      return true
    } else {
      // Fallback to localStorage
      const allGoalsStr = localStorage.getItem("goals") || "[]"
      const allGoals = JSON.parse(allGoalsStr)
      const otherGoals = allGoals.filter((g) => g.profileId !== profileId)
      const updatedGoals = [...otherGoals, ...goals.map((g) => ({ ...g, profileId }))]
      localStorage.setItem("goals", JSON.stringify(updatedGoals))
      return true
    }
  } catch (error) {
    console.error("Error saving goals:", error)
    return false
  }
}

export const loadGoals = async (profileId) => {
  try {
    const db = await initDatabase()
    if (db) {
      const allGoals = await db.getAll("goals")
      const profileGoals = allGoals.filter((goal) => goal.profileId === profileId)
      db.close()
      return profileGoals
    } else {
      // Fallback to localStorage
      const savedGoals = localStorage.getItem("goals")
      const allGoals = savedGoals ? JSON.parse(savedGoals) : []
      return allGoals.filter((goal) => goal.profileId === profileId)
    }
  } catch (error) {
    console.error("Error loading goals:", error)
    return []
  }
}

// Обновим функции для работы с профилем пользователя
export const saveUserProfile = async (profile) => {
  try {
    const db = await initDatabase()
    if (db) {
      await db.put("userProfile", { ...profile, id: profile.id || 1 })
      db.close()
      return true
    } else {
      localStorage.setItem(`userProfile_${profile.id || 1}`, JSON.stringify(profile))
      return true
    }
  } catch (error) {
    console.error("Error saving user profile:", error)
    localStorage.setItem(`userProfile_${profile.id || 1}`, JSON.stringify(profile))
    return false
  }
}

export const loadUserProfile = async (profileId) => {
  try {
    const db = await initDatabase()
    if (db) {
      const profile = await db.get("userProfile", profileId)
      db.close()
      return profile || null
    } else {
      const savedProfile = localStorage.getItem(`userProfile_${profileId}`)
      return savedProfile ? JSON.parse(savedProfile) : null
    }
  } catch (error) {
    console.error("Error loading user profile:", error)
    const savedProfile = localStorage.getItem(`userProfile_${profileId}`)
    return savedProfile ? JSON.parse(savedProfile) : null
  }
}

// Обновим функцию очистки данных
export const clearAllData = async (profileId = null) => {
  try {
    const db = await initDatabase()
    if (db) {
      if (profileId) {
        // Удаляем только данные конкретного профиля
        const allWorkouts = await db.getAll("workouts")
        const otherWorkouts = allWorkouts.filter((w) => w.profileId !== profileId)
        await db.clear("workouts")
        for (const workout of otherWorkouts) {
          await db.put("workouts", workout)
        }

        const allGoals = await db.getAll("goals")
        const otherGoals = allGoals.filter((g) => g.profileId !== profileId)
        await db.clear("goals")
        for (const goal of otherGoals) {
          await db.put("goals", goal)
        }

        // Удаляем профиль пользователя
        await db.delete("userProfile", profileId)

        // Удаляем профиль из списка профилей
        const profiles = await db.getAll("profiles")
        const updatedProfiles = profiles.filter((p) => p.id !== profileId)
        await db.clear("profiles")
        for (const profile of updatedProfiles) {
          await db.put("profiles", profile)
        }
      } else {
        // Удаляем все данные
        await db.clear("workouts")
        await db.clear("goals")
        await db.clear("userProfile")
        await db.clear("profiles")
      }
      db.close()
    }

    // Очищаем также localStorage
    if (profileId) {
      localStorage.removeItem(`userProfile_${profileId}`)

      const workoutsStr = localStorage.getItem("workouts")
      if (workoutsStr) {
        const workouts = JSON.parse(workoutsStr)
        localStorage.setItem("workouts", JSON.stringify(workouts.filter((w) => w.profileId !== profileId)))
      }

      const goalsStr = localStorage.getItem("goals")
      if (goalsStr) {
        const goals = JSON.parse(goalsStr)
        localStorage.setItem("goals", JSON.stringify(goals.filter((g) => g.profileId !== profileId)))
      }

      const profilesStr = localStorage.getItem("profiles")
      if (profilesStr) {
        const profiles = JSON.parse(profilesStr)
        localStorage.setItem("profiles", JSON.stringify(profiles.filter((p) => p.id !== profileId)))
      }
    } else {
      localStorage.clear()
    }

    return true
  } catch (error) {
    console.error("Error clearing data:", error)
    return false
  }
}
