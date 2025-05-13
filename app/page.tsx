"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Calendar,
  Download,
  FileUp,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
  Target,
  Trash2,
  User,
  Timer,
  BarChart4,
  Flame,
  Dumbbell,
  Clock,
  LineChart,
  ChevronRight,
  Check,
  X,
  Filter,
  Save,
  Edit,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import GoalTracker from "./components/goal-tracker"
import { ThemeToggle } from "./components/theme-toggle"
import ProfileEditor from "./components/profile-editor"
import WeightTracker from "./components/weight-tracker"
import WorkoutTimer from "./components/workout-timer"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  loadWorkouts,
  saveWorkouts,
  loadGoals,
  saveGoals,
  loadUserProfile,
  saveUserProfile,
  clearAllData,
} from "./utils/db"

export default function FitnessTracker() {
  // Основные состояния
  const [activeTab, setActiveTab] = useState("dashboard")
  const [workouts, setWorkouts] = useState([])
  const [goals, setGoals] = useState([])
  const [userProfile, setUserProfile] = useState({
    name: "",
    weight: 70,
    height: 175,
    calorieTarget: 2500,
    restingHeartRate: 65,
    gender: "",
    age: "",
    activityLevel: "moderate",
    units: "metric",
    language: "ru",
    privacy: "private",
    weightHistory: [],
    measurements: {},
  })
  const [showWeightDialog, setShowWeightDialog] = useState(false)
  const [newWeight, setNewWeight] = useState("")
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)

  // Состояния для фильтрации и сортировки
  const [filterType, setFilterType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")

  // Состояние для новой тренировки
  const [newWorkout, setNewWorkout] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Бег",
    duration: 30,
    calories: 300,
    notes: "",
    completed: true,
  })

  // Состояние для редактирования тренировки
  const [editWorkout, setEditWorkout] = useState(null)

  // Состояние для новой цели
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetType: "calories",
    targetValue: 1000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed: false,
  })

  // Загрузка данных из IndexedDB при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        // Загружаем тренировки
        const savedWorkouts = await loadWorkouts()
        if (savedWorkouts && savedWorkouts.length > 0) {
          setWorkouts(savedWorkouts)
        } else {
          // Демо данные, если нет сохраненных тренировок
          setWorkouts([
            {
              id: 1,
              date: "2024-05-10",
              type: "Бег",
              duration: 30,
              calories: 320,
              notes: "Утренняя пробежка в парке",
              completed: true,
            },
            {
              id: 2,
              date: "2024-05-09",
              type: "Силовая тренировка",
              duration: 45,
              calories: 280,
              notes: "День верхней части тела",
              completed: true,
            },
            {
              id: 3,
              date: "2024-05-08",
              type: "Велосипед",
              duration: 60,
              calories: 450,
              notes: "Холмистая местность",
              completed: true,
            },
          ])
        }

        // Загружаем цели
        const savedGoals = await loadGoals()
        if (savedGoals && savedGoals.length > 0) {
          setGoals(savedGoals)
        } else {
          // Демо цели
          setGoals([
            {
              id: 1,
              title: "Сжечь 1000 калорий за неделю",
              targetType: "calories",
              targetValue: 1000,
              deadline: "2024-05-20",
              completed: false,
            },
            {
              id: 2,
              title: "Бегать 3 раза в неделю",
              targetType: "frequency",
              targetValue: 3,
              deadline: "2024-05-25",
              completed: false,
            },
          ])
        }

        // Загружаем профиль пользователя
        const savedProfile = await loadUserProfile()
        if (savedProfile) {
          setUserProfile(savedProfile)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить ваши данные. Используются значения по умолчанию.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Сохранение данных в IndexedDB при изменении
  useEffect(() => {
    if (!isLoading) {
      saveWorkouts(workouts).catch((error) => {
        console.error("Error saving workouts:", error)
      })
    }
  }, [workouts, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveGoals(goals).catch((error) => {
        console.error("Error saving goals:", error)
      })
    }
  }, [goals, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveUserProfile(userProfile).catch((error) => {
        console.error("Error saving user profile:", error)
      })
    }
  }, [userProfile, isLoading])

  // Обработчик добавления нового веса
  const handleAddWeight = () => {
    if (!newWeight) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите вес",
        variant: "destructive",
      })
      return
    }

    const weightEntry = {
      date: newWeightDate,
      weight: Number.parseFloat(newWeight),
    }

    // Обновляем историю веса и текущий вес
    const updatedProfile = {
      ...userProfile,
      weight: Number.parseFloat(newWeight),
      weightHistory: [...(userProfile.weightHistory || []), weightEntry],
    }

    // Если это первая запись веса, устанавливаем начальный вес
    if (!userProfile.initialWeight) {
      updatedProfile.initialWeight = Number.parseFloat(newWeight)
    }

    setUserProfile(updatedProfile)
    setNewWeight("")
    setShowWeightDialog(false)

    toast({
      title: "Вес обновлен",
      description: `Новый вес: ${newWeight} кг`,
    })
  }

  // Обработчики для тренировок
  const handleAddWorkout = () => {
    const workout = {
      id: Date.now(),
      ...newWorkout,
    }
    setWorkouts([workout, ...workouts])
    setNewWorkout({
      date: new Date().toISOString().split("T")[0],
      type: "Бег",
      duration: 30,
      calories: 300,
      notes: "",
      completed: true,
    })

    toast({
      title: "Тренировка добавлена",
      description: `${workout.type} - ${workout.duration} мин`,
    })

    // Проверка достижения целей
    checkGoalsProgress([...workouts, workout])
  }

  const handleDeleteWorkout = (id) => {
    setWorkouts(workouts.filter((workout) => workout.id !== id))
    toast({
      title: "Тренировка удалена",
      variant: "destructive",
    })
  }

  const handleEditWorkout = (workout) => {
    setEditWorkout(workout)
    setActiveTab("edit")
  }

  const handleUpdateWorkout = () => {
    const updatedWorkouts = workouts.map((w) => (w.id === editWorkout.id ? editWorkout : w))
    setWorkouts(updatedWorkouts)
    setEditWorkout(null)
    setActiveTab("history")

    toast({
      title: "Тренировка обновлена",
      description: `${editWorkout.type} - ${editWorkout.date}`,
    })

    // Проверка достижения целей
    checkGoalsProgress(updatedWorkouts)
  }

  // Обработчик для сохранения тренировки из таймера
  const handleSaveTimerWorkout = (workout) => {
    setWorkouts([workout, ...workouts])

    toast({
      title: "Тренировка сохранена",
      description: `${workout.type} - ${workout.duration} мин`,
    })

    // Проверка достижения целей
    checkGoalsProgress([...workouts, workout])
  }

  // Обработчики для целей
  const handleAddGoal = () => {
    const goal = {
      id: Date.now(),
      ...newGoal,
    }
    setGoals([goal, ...goals])
    setNewGoal({
      title: "",
      targetType: "calories",
      targetValue: 1000,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completed: false,
    })

    toast({
      title: "Цель добавлена",
      description: goal.title,
    })
  }

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id))
    toast({
      title: "Цель удалена",
      variant: "destructive",
    })
  }

  const handleToggleGoalCompletion = (id) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const updatedGoal = { ...goal, completed: !goal.completed }
          if (updatedGoal.completed) {
            toast({
              title: "Поздравляем!",
              description: `Цель "${goal.title}" достигнута!`,
              variant: "success",
            })
          }
          return updatedGoal
        }
        return goal
      }),
    )
  }

  // Функция для проверки прогресса целей
  const checkGoalsProgress = (currentWorkouts) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.completed) return goal

      let completed = false

      if (goal.targetType === "calories") {
        // Проверяем общее количество сожженных калорий
        const totalCalories = currentWorkouts.reduce((sum, workout) => sum + workout.calories, 0)
        completed = totalCalories >= goal.targetValue
      } else if (goal.targetType === "frequency") {
        // Проверяем количество тренировок определенного типа
        const workoutCount = currentWorkouts.filter((w) => w.type === goal.workoutType || !goal.workoutType).length
        completed = workoutCount >= goal.targetValue
      } else if (goal.targetType === "duration") {
        // Проверяем общую продолжительность тренировок
        const totalDuration = currentWorkouts.reduce((sum, workout) => sum + workout.duration, 0)
        completed = totalDuration >= goal.targetValue
      }

      if (completed && !goal.completed) {
        toast({
          title: "Поздравляем!",
          description: `Цель "${goal.title}" достигнута!`,
          variant: "success",
        })
      }

      return { ...goal, completed }
    })

    if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
      setGoals(updatedGoals)
    }
  }

  // Функции для фильтрации и сортировки
  const getFilteredWorkouts = () => {
    return workouts
      .filter((workout) => {
        // Фильтрация по типу
        if (filterType !== "all" && workout.type !== filterType) {
          return false
        }

        // Фильтрация по поисковому запросу
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            workout.type.toLowerCase().includes(query) ||
            workout.notes.toLowerCase().includes(query) ||
            workout.date.includes(query)
          )
        }

        return true
      })
      .sort((a, b) => {
        // Сортировка
        if (sortField === "date") {
          return sortDirection === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
        } else if (sortField === "duration") {
          return sortDirection === "asc" ? a.duration - b.duration : b.duration - a.duration
        } else if (sortField === "calories") {
          return sortDirection === "asc" ? a.calories - b.calories : b.calories - a.calories
        }
        return 0
      })
  }

  // Функции для экспорта/импорта данных
  const handleExportData = () => {
    const data = {
      workouts,
      goals,
      userProfile,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `fittrack-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Данные экспортированы",
      description: "Файл сохранен на ваше устройство",
    })
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (data.workouts) setWorkouts(data.workouts)
        if (data.goals) setGoals(data.goals)
        if (data.userProfile) setUserProfile(data.userProfile)

        toast({
          title: "Данные импортированы",
          description: "Ваши данные успешно загружены",
        })
      } catch (error) {
        toast({
          title: "Ошибка импорта",
          description: "Не удалось импортировать данные. Проверьте формат файла.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
    event.target.value = null
  }

  // Функция для очистки всех данных
  const handleClearAllData = async () => {
    if (confirm("Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.")) {
      try {
        await clearAllData()

        setWorkouts([])
        setGoals([])
        setUserProfile({
          weight: 70,
          height: 175,
          calorieTarget: 2500,
          restingHeartRate: 65,
        })

        toast({
          title: "Данные удалены",
          description: "Все данные приложения были удалены",
          variant: "destructive",
        })
      } catch (error) {
        console.error("Error clearing data:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось удалить все данные",
          variant: "destructive",
        })
      }
    }
  }

  // Расчет статистики
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0)
  const totalWorkouts = workouts.length
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0)
  const averageCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0

  // Группировка тренировок по типам для статистики
  const workoutsByType = workouts.reduce((acc, workout) => {
    acc[workout.type] = (acc[workout.type] || 0) + 1
    return acc
  }, {})

  // Данные для графиков
  const last7DaysWorkouts = workouts
    .filter((w) => {
      const workoutDate = new Date(w.date)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return workoutDate >= sevenDaysAgo
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const filteredWorkouts = getFilteredWorkouts()

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Получение иконки для типа тренировки
  const getWorkoutTypeIcon = (type) => {
    switch (type) {
      case "Бег":
        return <Activity className="h-4 w-4" />
      case "Силовая тренировка":
        return <Dumbbell className="h-4 w-4" />
      case "Велосипед":
        return <Activity className="h-4 w-4" />
      case "Плавание":
        return <Activity className="h-4 w-4" />
      case "Йога":
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
                <Activity className="h-8 w-8" />
                FitTrack Pro
              </h1>
              <p className="text-muted-foreground">Отслеживайте, анализируйте и улучшайте свой путь к фитнесу</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={() => setActiveTab("settings")}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Боковая навигация */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Панель
                  </Button>
                  <Button
                    variant={activeTab === "add" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("add")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить тренировку
                  </Button>
                  <Button
                    variant={activeTab === "timer" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("timer")}
                  >
                    <Timer className="mr-2 h-4 w-4" />
                    Таймер тренировки
                  </Button>
                  <Button
                    variant={activeTab === "history" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("history")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    История тренировок
                  </Button>
                  <Button
                    variant={activeTab === "goals" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("goals")}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Цели
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Профиль
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </Button>
                </nav>
              </CardContent>
            </Card>

            {/* Статистика пользователя */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{userProfile.name || "Пользователь"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {userProfile.gender === "male" ? "Мужчина" : userProfile.gender === "female" ? "Женщина" : ""}
                      {userProfile.age ? `, ${userProfile.age} лет` : ""}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Калории</span>
                    </div>
                    <span className="font-medium">{totalCalories}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Тренировки</span>
                    </div>
                    <span className="font-medium">{totalWorkouts}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Время</span>
                    </div>
                    <span className="font-medium">{totalDuration} мин</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("add")}
                >
                  <PlusCircle className="mr-2 h-3.5 w-3.5" />
                  Новая тренировка
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("timer")}
                >
                  <Timer className="mr-2 h-3.5 w-3.5" />
                  Запустить таймер
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <LineChart className="mr-2 h-3.5 w-3.5" />
                      Добавить вес
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Добавить вес</DialogTitle>
                      <DialogDescription>Введите свой вес и дату.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="weight" className="text-right">
                          Вес
                        </Label>
                        <Input
                          id="weight"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Дата
                        </Label>
                        <Input
                          type="date"
                          id="date"
                          value={newWeightDate}
                          onChange={(e) => setNewWeightDate(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddWeight}>
                        Сохранить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Основной контент */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    {/* Обзор статистики */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <BarChart4 className="h-5 w-5 text-primary" />
                          <CardTitle>Обзор активности</CardTitle>
                        </div>
                        <CardDescription>Краткая статистика вашей активности</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                          <div className="bg-primary/5 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">Сожжено калорий</span>
                            <span className="text-3xl font-semibold">{totalCalories}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              В среднем {averageCaloriesPerWorkout} кал/тренировка
                            </span>
                          </div>
                          <div className="bg-primary/5 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">Тренировок</span>
                            <span className="text-3xl font-semibold">{totalWorkouts}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {last7DaysWorkouts.length} за последние 7 дней
                            </span>
                          </div>
                          <div className="bg-primary/5 rounded-lg p-4 flex flex-col">
                            <span className="text-sm text-muted-foreground mb-1">Общая продолжительность</span>
                            <span className="text-3xl font-semibold">{totalDuration} мин</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              В среднем {totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0}{" "}
                              мин/тренировка
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Цели */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <CardTitle>Отслеживание целей</CardTitle>
                        </div>
                        <CardDescription>Ваши текущие цели и прогресс</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-primary/5 rounded-lg p-4">
                          <GoalTracker
                            goals={goals}
                            workouts={workouts}
                            handleToggleGoalCompletion={handleToggleGoalCompletion}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Последние тренировки */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <CardTitle>Последние тренировки</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() => setActiveTab("history")}
                          >
                            Показать все
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {workouts.slice(0, 3).map((workout) => (
                            <div
                              key={workout.id}
                              className="bg-primary/5 rounded-lg p-3 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-background rounded-full p-2">{getWorkoutTypeIcon(workout.type)}</div>
                                <div>
                                  <h4 className="font-medium">{workout.type}</h4>
                                  <p className="text-xs text-muted-foreground">{formatDate(workout.date)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm font-medium">{workout.duration} мин</p>
                                  <p className="text-xs text-muted-foreground">{workout.calories} кал</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditWorkout(workout)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {workouts.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>У вас пока нет тренировок</p>
                              <p className="text-sm">Добавьте свою первую тренировку, чтобы начать отслеживание</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "add" && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary" />
                        <CardTitle>Добавить тренировку</CardTitle>
                      </div>
                      <CardDescription>Запишите свою новую тренировку</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-primary/5 rounded-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="date">Дата</Label>
                            <Input
                              type="date"
                              id="date"
                              value={newWorkout.date}
                              onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="type">Тип тренировки</Label>
                            <Select
                              value={newWorkout.type}
                              onValueChange={(value) => setNewWorkout({ ...newWorkout, type: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите тип" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Бег">Бег</SelectItem>
                                <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                                <SelectItem value="Велосипед">Велосипед</SelectItem>
                                <SelectItem value="Плавание">Плавание</SelectItem>
                                <SelectItem value="Йога">Йога</SelectItem>
                                <SelectItem value="Другое">Другое</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="duration">Продолжительность (мин)</Label>
                            <Input
                              type="number"
                              id="duration"
                              value={newWorkout.duration}
                              onChange={(e) =>
                                setNewWorkout({ ...newWorkout, duration: Number.parseInt(e.target.value) })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="calories">Сожжено калорий</Label>
                            <Input
                              type="number"
                              id="calories"
                              value={newWorkout.calories}
                              onChange={(e) =>
                                setNewWorkout({ ...newWorkout, calories: Number.parseInt(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Заметки</Label>
                          <Input
                            type="text"
                            id="notes"
                            value={newWorkout.notes}
                            onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                            placeholder="Добавьте заметки о тренировке"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="completed"
                            checked={newWorkout.completed}
                            onCheckedChange={(checked) => setNewWorkout({ ...newWorkout, completed: checked })}
                          />
                          <Label htmlFor="completed">Выполнено</Label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleAddWorkout} className="w-full md:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        Добавить тренировку
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {activeTab === "timer" && <WorkoutTimer onSaveWorkout={handleSaveTimerWorkout} />}

                {activeTab === "edit" && editWorkout && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        <CardTitle>Редактировать тренировку</CardTitle>
                      </div>
                      <CardDescription>Измените детали тренировки</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-primary/5 rounded-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="date">Дата</Label>
                            <Input
                              type="date"
                              id="date"
                              value={editWorkout.date}
                              onChange={(e) => setEditWorkout({ ...editWorkout, date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="type">Тип тренировки</Label>
                            <Select
                              value={editWorkout.type}
                              onValueChange={(value) => setEditWorkout({ ...editWorkout, type: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите тип" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Бег">Бег</SelectItem>
                                <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                                <SelectItem value="Велосипед">Велосипед</SelectItem>
                                <SelectItem value="Плавание">Плавание</SelectItem>
                                <SelectItem value="Йога">Йога</SelectItem>
                                <SelectItem value="Другое">Другое</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="duration">Продолжительность (мин)</Label>
                            <Input
                              type="number"
                              id="duration"
                              value={editWorkout.duration}
                              onChange={(e) =>
                                setEditWorkout({ ...editWorkout, duration: Number.parseInt(e.target.value) })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="calories">Сожжено калорий</Label>
                            <Input
                              type="number"
                              id="calories"
                              value={editWorkout.calories}
                              onChange={(e) =>
                                setEditWorkout({ ...editWorkout, calories: Number.parseInt(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Заметки</Label>
                          <Input
                            type="text"
                            id="notes"
                            value={editWorkout.notes}
                            onChange={(e) => setEditWorkout({ ...editWorkout, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="completed"
                            checked={editWorkout.completed}
                            onCheckedChange={(checked) => setEditWorkout({ ...editWorkout, completed: checked })}
                          />
                          <Label htmlFor="completed">Выполнено</Label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("history")}>
                        <X className="mr-2 h-4 w-4" />
                        Отмена
                      </Button>
                      <Button onClick={handleUpdateWorkout}>
                        <Check className="mr-2 h-4 w-4" />
                        Сохранить изменения
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {activeTab === "history" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <CardTitle>История тренировок</CardTitle>
                        </div>
                        <CardDescription>Ваши прошлые тренировки</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-primary/5 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Filter className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="filter" className="text-sm">
                                Фильтр:
                              </Label>
                              <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Все типы" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Все типы</SelectItem>
                                  <SelectItem value="Бег">Бег</SelectItem>
                                  <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                                  <SelectItem value="Велосипед">Велосипед</SelectItem>
                                  <SelectItem value="Плавание">Плавание</SelectItem>
                                  <SelectItem value="Йога">Йога</SelectItem>
                                  <SelectItem value="Другое">Другое</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="search"
                                id="search"
                                placeholder="Поиск тренировок..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-[250px]"
                              />
                            </div>
                          </div>

                          {filteredWorkouts.length > 0 ? (
                            <div className="space-y-3">
                              {filteredWorkouts.map((workout) => (
                                <div
                                  key={workout.id}
                                  className="bg-background rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded-full p-2">
                                      {getWorkoutTypeIcon(workout.type)}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{workout.type}</h4>
                                      <p className="text-xs text-muted-foreground">{formatDate(workout.date)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{workout.duration} мин</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Flame className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{workout.calories} кал</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEditWorkout(workout)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive"
                                        onClick={() => handleDeleteWorkout(workout.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>Тренировки не найдены</p>
                              <p className="text-sm">
                                Попробуйте изменить параметры поиска или добавьте новую тренировку
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "goals" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <CardTitle>Управление целями</CardTitle>
                        </div>
                        <CardDescription>Установите и отслеживайте свои фитнес-цели</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-primary/5 rounded-lg p-6 space-y-6">
                          <h3 className="text-lg font-medium">Добавить новую цель</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Название цели</Label>
                              <Input
                                type="text"
                                id="title"
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                placeholder="Например: Пробежать 30 км за неделю"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="targetType">Тип цели</Label>
                              <Select
                                value={newGoal.targetType}
                                onValueChange={(value) => setNewGoal({ ...newGoal, targetType: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="calories">Калории</SelectItem>
                                  <SelectItem value="frequency">Частота</SelectItem>
                                  <SelectItem value="duration">Продолжительность</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="targetValue">Целевое значение</Label>
                              <Input
                                type="number"
                                id="targetValue"
                                value={newGoal.targetValue}
                                onChange={(e) =>
                                  setNewGoal({ ...newGoal, targetValue: Number.parseInt(e.target.value) })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="deadline">Срок выполнения</Label>
                            <Input
                              type="date"
                              id="deadline"
                              value={newGoal.deadline}
                              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />
                          </div>

                          <Button onClick={handleAddGoal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Добавить цель
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Текущие цели</h3>
                          {goals.length > 0 ? (
                            <div className="space-y-4">
                              {goals.map((goal) => (
                                <div key={goal.id} className="bg-primary/5 rounded-lg p-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-background rounded-full p-2">
                                        <Target className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">{goal.title}</h4>
                                          {goal.completed ? (
                                            <Badge variant="success" className="text-xs">
                                              Выполнено
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-xs">
                                              В процессе
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Срок: {formatDate(goal.deadline)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <div className="text-sm mb-1">
                                          {goal.targetType === "calories" && `${goal.targetValue} калорий`}
                                          {goal.targetType === "frequency" && `${goal.targetValue} тренировок`}
                                          {goal.targetType === "duration" && `${goal.targetValue} минут`}
                                        </div>
                                        <Progress value={goal.completed ? 100 : 50} className="h-2 w-[150px]" />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleToggleGoalCompletion(goal.id)}
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive"
                                          onClick={() => handleDeleteGoal(goal.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground bg-primary/5 rounded-lg">
                              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>У вас пока нет целей</p>
                              <p className="text-sm">Добавьте цель, чтобы отслеживать свой прогресс</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Профиль пользователя</CardTitle>
                      </div>
                      <CardDescription>Управляйте своими персональными данными</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProfileEditor userProfile={userProfile} setUserProfile={setUserProfile} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          <CardTitle>Настройки</CardTitle>
                        </div>
                        <CardDescription>Настройте ваш опыт использования приложения</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="app">
                          <TabsList className="grid grid-cols-2 mb-6">
                            <TabsTrigger value="app">Приложение</TabsTrigger>
                            <TabsTrigger value="weight">Вес</TabsTrigger>
                          </TabsList>

                          <TabsContent value="app" className="space-y-6">
                            <div className="bg-primary/5 rounded-lg p-6 space-y-6">
                              <h3 className="text-lg font-medium">Основные настройки</h3>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Темный режим</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Переключение между светлой и темной темой
                                    </p>
                                  </div>
                                  <div>
                                    <ThemeToggle />
                                  </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Уведомления</Label>
                                    <p className="text-sm text-muted-foreground">Включить напоминания о тренировках</p>
                                  </div>
                                  <div>
                                    <Switch defaultChecked />
                                  </div>
                                </div>

                                <div className="pt-4 border-t">
                                  <h3 className="text-sm font-medium mb-2">Управление данными</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start"
                                      onClick={handleExportData}
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Экспорт данных
                                    </Button>
                                    <div className="relative">
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => document.getElementById("import-file-settings").click()}
                                      >
                                        <FileUp className="mr-2 h-4 w-4" />
                                        Импорт данных
                                      </Button>
                                      <input
                                        id="import-file-settings"
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        onChange={handleImportData}
                                      />
                                    </div>
                                    <Button
                                      variant="destructive"
                                      className="w-full justify-start mt-2 md:col-span-2"
                                      onClick={handleClearAllData}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Удалить все данные
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="weight">
                            <WeightTracker userProfile={userProfile} setUserProfile={setUserProfile} />
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
