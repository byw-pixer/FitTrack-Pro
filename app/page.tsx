"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  Calendar,
  Download,
  FileUp,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
  SortAsc,
  Target,
  Trash2,
  User,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import WorkoutChart from "./components/workout-chart"
import CalorieChart from "./components/calorie-chart"
import GoalTracker from "./components/goal-tracker"
import { ThemeToggle } from "./components/theme-toggle"
import ProfileEditor from "./components/profile-editor"
import WeightTracker from "./components/weight-tracker"
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

// Добавьте импорт новых компонентов в начале файла
// import WeightTracker from "./components/weight-tracker" // Removed duplicate import

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

  // Загрузка данных из localStorage при монтировании компонента
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts")
    const savedGoals = localStorage.getItem("goals")
    const savedProfile = localStorage.getItem("userProfile")

    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts))
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

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
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

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
  }, [])

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts))
  }, [workouts])

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile))
  }, [userProfile])

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
            <Activity className="h-8 w-8" />
            ФитТрек Про
          </h1>
          <p className="text-slate-500">Отслеживайте, анализируйте и улучшайте свой путь к фитнесу</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          <div className="bg-card rounded-lg shadow-sm p-4 border">
            <nav className="space-y-2">
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
              <ThemeToggle className="w-full justify-start" />
            </nav>
          </div>

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Обзор</CardTitle>
                  <CardDescription>Краткая статистика вашей активности</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Сожжено калорий</span>
                    <span className="text-2xl font-semibold">{totalCalories}</span>
                    <span className="text-sm text-muted-foreground">Всего</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Тренировок</span>
                    <span className="text-2xl font-semibold">{totalWorkouts}</span>
                    <span className="text-sm text-muted-foreground">Всего</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Общая продолжительность</span>
                    <span className="text-2xl font-semibold">{totalDuration} мин</span>
                    <span className="text-sm text-muted-foreground">Всего</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>График калорий</CardTitle>
                    <CardDescription>Калории, сожженные за последние 7 дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CalorieChart workouts={last7DaysWorkouts} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>График тренировок</CardTitle>
                    <CardDescription>Количество тренировок по типам</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WorkoutChart workoutsByType={workoutsByType} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Отслеживание целей</CardTitle>
                  <CardDescription>Ваши текущие цели и прогресс</CardDescription>
                </CardHeader>
                <CardContent>
                  <GoalTracker
                    goals={goals}
                    workouts={workouts}
                    handleToggleGoalCompletion={handleToggleGoalCompletion}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "add" && (
            <Card>
              <CardHeader>
                <CardTitle>Добавить тренировку</CardTitle>
                <CardDescription>Запишите свою новую тренировку</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      type="date"
                      id="date"
                      value={newWorkout.date}
                      onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                    />
                  </div>
                  <div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Продолжительность (мин)</Label>
                    <Input
                      type="number"
                      id="duration"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="calories">Сожжено калорий</Label>
                    <Input
                      type="number"
                      id="calories"
                      value={newWorkout.calories}
                      onChange={(e) => setNewWorkout({ ...newWorkout, calories: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Заметки</Label>
                  <Input
                    type="text"
                    id="notes"
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
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
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddWorkout}>Добавить тренировку</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "edit" && editWorkout && (
            <Card>
              <CardHeader>
                <CardTitle>Редактировать тренировку</CardTitle>
                <CardDescription>Измените детали тренировки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      type="date"
                      id="date"
                      value={editWorkout.date}
                      onChange={(e) => setEditWorkout({ ...editWorkout, date: e.target.value })}
                    />
                  </div>
                  <div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Продолжительность (мин)</Label>
                    <Input
                      type="number"
                      id="duration"
                      value={editWorkout.duration}
                      onChange={(e) => setEditWorkout({ ...editWorkout, duration: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="calories">Сожжено калорий</Label>
                    <Input
                      type="number"
                      id="calories"
                      value={editWorkout.calories}
                      onChange={(e) => setEditWorkout({ ...editWorkout, calories: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
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
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateWorkout}>Обновить тренировку</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>История тренировок</CardTitle>
                  <CardDescription>Ваши прошлые тренировки</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="filter">Фильтр:</Label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
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
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="search">Поиск:</Label>
                      <Input
                        type="search"
                        id="search"
                        placeholder="Поиск тренировок..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">
                          Дата
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortField("date")
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                            }}
                          >
                            <SortAsc className="h-4 w-4 mr-2" />
                          </Button>
                        </TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>
                          Продолжительность
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortField("duration")
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                            }}
                          >
                            <SortAsc className="h-4 w-4 mr-2" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          Калории
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortField("calories")
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                            }}
                          >
                            <SortAsc className="h-4 w-4 mr-2" />
                          </Button>
                        </TableHead>
                        <TableHead>Заметки</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkouts.map((workout) => (
                        <TableRow key={workout.id}>
                          <TableCell className="font-medium">{workout.date}</TableCell>
                          <TableCell>{workout.type}</TableCell>
                          <TableCell>{workout.duration} мин</TableCell>
                          <TableCell>{workout.calories}</TableCell>
                          <TableCell>{workout.notes}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleEditWorkout(workout)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Редактировать
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkout(workout.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "goals" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Управление целями</CardTitle>
                  <CardDescription>Установите и отслеживайте свои фитнес-цели</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="title">Название цели</Label>
                        <Input
                          type="text"
                          id="title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        />
                      </div>
                      <div>
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
                      <div>
                        <Label htmlFor="targetValue">Целевое значение</Label>
                        <Input
                          type="number"
                          id="targetValue"
                          value={newGoal.targetValue}
                          onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number.parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline">Срок выполнения</Label>
                        <Input
                          type="date"
                          id="deadline"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddGoal}>Добавить цель</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Целевое значение</TableHead>
                        <TableHead>Срок выполнения</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {goals.map((goal) => (
                        <TableRow key={goal.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`goal-${goal.id}`}
                                checked={goal.completed}
                                onCheckedChange={() => handleToggleGoalCompletion(goal.id)}
                              />
                              <Label htmlFor={`goal-${goal.id}`} className="cursor-pointer">
                                {goal.title}
                              </Label>
                            </div>
                          </TableCell>
                          <TableCell>{goal.targetType}</TableCell>
                          <TableCell>{goal.targetValue}</TableCell>
                          <TableCell>{goal.deadline}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Редактировать профиль</CardTitle>
                <CardDescription>Измените свои личные данные</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditor userProfile={userProfile} setUserProfile={setUserProfile} />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Добавить вес</Button>
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
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Настройки</h2>

              <Tabs defaultValue="app">
                <TabsList>
                  <TabsTrigger value="weight">Вес</TabsTrigger>
                  <TabsTrigger value="app">Приложение</TabsTrigger>
                </TabsList>

                <TabsContent value="weight" className="mt-4">
                  <WeightTracker userProfile={userProfile} setUserProfile={setUserProfile} />
                </TabsContent>

                <TabsContent value="app" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Настройки приложения</CardTitle>
                      <CardDescription>Настройте ваш опыт использования приложения</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Темный режим</Label>
                          <p className="text-sm text-muted-foreground">Переключение между светлой и темной темой</p>
                        </div>
                        <div>
                          <ThemeToggle />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Уведомления</Label>
                          <p className="text-sm text-muted-foreground">Включить напоминания о тренировках</p>
                        </div>
                        <div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Единицы измерения</Label>
                          <p className="text-sm text-muted-foreground">Выберите предпочтительные единицы измерения</p>
                        </div>
                        <Select
                          value={userProfile.units || "metric"}
                          onValueChange={(value) => setUserProfile({ ...userProfile, units: value })}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Выберите единицы" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metric">Метрические (кг)</SelectItem>
                            <SelectItem value="imperial">Имперские (фунты)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">Управление данными</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
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
                            onClick={() => {
                              if (confirm("Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.")) {
                                localStorage.clear()
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
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить все данные
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        <Toaster />
      </div>
    </div>
  )
}
