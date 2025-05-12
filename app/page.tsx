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
  Clock,
  Download,
  FileUp,
  Filter,
  FlameIcon,
  Footprints,
  Heart,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
  SortAsc,
  Target,
  Trash2,
  Upload,
  Weight,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import WorkoutChart from "./components/workout-chart"
import CalorieChart from "./components/calorie-chart"
import GoalTracker from "./components/goal-tracker"
import { ThemeToggle } from "./components/theme-toggle"

export default function FitnessTracker() {
  // Основные состояния
  const [activeTab, setActiveTab] = useState("dashboard")
  const [workouts, setWorkouts] = useState([])
  const [goals, setGoals] = useState([])
  const [userProfile, setUserProfile] = useState({
    weight: 70,
    height: 175,
    calorieTarget: 2500,
    restingHeartRate: 65,
  })

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
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Настройки
              </Button>
            </nav>

            <div className="mt-8 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Быстрые действия</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт данных
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => document.getElementById("import-file").click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Импорт данных
                  </Button>
                  <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImportData} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Панель управления</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Всего тренировок</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {totalWorkouts}
                        <Activity className="ml-2 h-4 w-4 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Общая продолжительность
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {totalDuration} мин
                        <Clock className="ml-2 h-4 w-4 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Сожжено калорий</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {totalCalories}
                        <FlameIcon className="ml-2 h-4 w-4 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Ср. калорий за тренировку
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {averageCaloriesPerWorkout}
                        <FlameIcon className="ml-2 h-4 w-4 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Активность за 7 дней</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WorkoutChart workouts={last7DaysWorkouts} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Калории по типам тренировок</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CalorieChart workouts={workouts} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Цели</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {goals.length > 0 ? (
                        <div className="space-y-4">
                          {goals.slice(0, 3).map((goal) => (
                            <GoalTracker key={goal.id} goal={goal} workouts={workouts} />
                          ))}
                          {goals.length > 3 && (
                            <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("goals")}>
                              Показать все цели ({goals.length})
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>У вас пока нет целей</p>
                          <Button variant="link" className="mt-2" onClick={() => setActiveTab("goals")}>
                            Добавить цель
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Последние тренировки</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {workouts.length > 0 ? (
                        <div className="space-y-3">
                          {workouts.slice(0, 5).map((workout) => (
                            <div key={workout.id} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <div className="font-medium">{workout.type}</div>
                                <div className="text-sm text-muted-foreground">{workout.date}</div>
                              </div>
                              <div className="text-right">
                                <div>{workout.duration} мин</div>
                                <div className="text-sm text-muted-foreground">{workout.calories} кал</div>
                              </div>
                            </div>
                          ))}
                          {workouts.length > 5 && (
                            <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("history")}>
                              Показать все тренировки ({workouts.length})
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>У вас пока нет тренировок</p>
                          <Button variant="link" className="mt-2" onClick={() => setActiveTab("add")}>
                            Добавить тренировку
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "add" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Добавить новую тренировку</h2>

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Дата</Label>
                      <Input
                        id="date"
                        type="date"
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
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Выберите тип тренировки" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Бег">Бег</SelectItem>
                          <SelectItem value="Ходьба">Ходьба</SelectItem>
                          <SelectItem value="Велосипед">Велосипед</SelectItem>
                          <SelectItem value="Плавание">Плавание</SelectItem>
                          <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                          <SelectItem value="Йога">Йога</SelectItem>
                          <SelectItem value="ВИИТ">ВИИТ</SelectItem>
                          <SelectItem value="Кроссфит">Кроссфит</SelectItem>
                          <SelectItem value="Танцы">Танцы</SelectItem>
                          <SelectItem value="Другое">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Продолжительность (минуты)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newWorkout.duration}
                        onChange={(e) => setNewWorkout({ ...newWorkout, duration: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calories">Сожжено калорий</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newWorkout.calories}
                        onChange={(e) => setNewWorkout({ ...newWorkout, calories: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Заметки</Label>
                    <Input
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
                    <label
                      htmlFor="completed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Тренировка завершена
                    </label>
                  </div>
                </div>

                <Button onClick={handleAddWorkout} className="w-full md:w-auto">
                  Добавить тренировку
                </Button>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">История тренировок</h2>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск тренировок..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Фильтр по типу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="Бег">Бег</SelectItem>
                        <SelectItem value="Ходьба">Ходьба</SelectItem>
                        <SelectItem value="Велосипед">Велосипед</SelectItem>
                        <SelectItem value="Плавание">Плавание</SelectItem>
                        <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                        <SelectItem value="Йога">Йога</SelectItem>
                        <SelectItem value="ВИИТ">ВИИТ</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={`${sortField}-${sortDirection}`}
                      onValueChange={(value) => {
                        const [field, direction] = value.split("-")
                        setSortField(field)
                        setSortDirection(direction)
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SortAsc className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Сортировка" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Дата (новые сначала)</SelectItem>
                        <SelectItem value="date-asc">Дата (старые сначала)</SelectItem>
                        <SelectItem value="duration-desc">Длительность (макс)</SelectItem>
                        <SelectItem value="duration-asc">Длительность (мин)</SelectItem>
                        <SelectItem value="calories-desc">Калории (макс)</SelectItem>
                        <SelectItem value="calories-asc">Калории (мин)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredWorkouts.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Дата</TableHead>
                          <TableHead>Тип</TableHead>
                          <TableHead>Продолжительность</TableHead>
                          <TableHead>Калории</TableHead>
                          <TableHead>Заметки</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWorkouts.map((workout) => (
                          <TableRow key={workout.id}>
                            <TableCell>{workout.date}</TableCell>
                            <TableCell>{workout.type}</TableCell>
                            <TableCell>{workout.duration} мин</TableCell>
                            <TableCell>{workout.calories}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{workout.notes}</TableCell>
                            <TableCell>
                              {workout.completed ? (
                                <Badge variant="success">Завершена</Badge>
                              ) : (
                                <Badge variant="outline">Запланирована</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEditWorkout(workout)}>
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkout(workout.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">Нет тренировок, соответствующих фильтрам</p>
                    {filterType !== "all" || searchQuery ? (
                      <Button
                        variant="link"
                        onClick={() => {
                          setFilterType("all")
                          setSearchQuery("")
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                    ) : (
                      <Button variant="link" onClick={() => setActiveTab("add")}>
                        Добавить первую тренировку
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "goals" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Цели тренировок</h2>

                <Tabs defaultValue="active">
                  <TabsList>
                    <TabsTrigger value="active">Активные цели</TabsTrigger>
                    <TabsTrigger value="add">Добавить цель</TabsTrigger>
                    <TabsTrigger value="completed">Достигнутые цели</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-4 mt-4">
                    {goals.filter((g) => !g.completed).length > 0 ? (
                      <div className="space-y-4">
                        {goals
                          .filter((g) => !g.completed)
                          .map((goal) => (
                            <Card key={goal.id}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                  <CardTitle>{goal.title}</CardTitle>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <CardDescription>Срок: {goal.deadline}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <GoalTracker goal={goal} workouts={workouts} />

                                <div className="flex justify-end mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleGoalCompletion(goal.id)}
                                  >
                                    Отметить как выполненную
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-muted-foreground">У вас пока нет активных целей</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="add" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Новая цель</CardTitle>
                        <CardDescription>Создайте новую цель для тренировок</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="goal-title">Название цели</Label>
                          <Input
                            id="goal-title"
                            value={newGoal.title}
                            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                            placeholder="Например: Пробежать 20 км за неделю"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal-type">Тип цели</Label>
                          <Select
                            value={newGoal.targetType}
                            onValueChange={(value) => setNewGoal({ ...newGoal, targetType: value })}
                          >
                            <SelectTrigger id="goal-type">
                              <SelectValue placeholder="Выберите тип цели" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="calories">Сжечь калории</SelectItem>
                              <SelectItem value="duration">Общая продолжительность</SelectItem>
                              <SelectItem value="frequency">Количество тренировок</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal-value">
                            {newGoal.targetType === "calories" && "Целевое количество калорий"}
                            {newGoal.targetType === "duration" && "Целевая продолжительность (мин)"}
                            {newGoal.targetType === "frequency" && "Целевое количество тренировок"}
                          </Label>
                          <Input
                            id="goal-value"
                            type="number"
                            value={newGoal.targetValue}
                            onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number.parseInt(e.target.value) })}
                          />
                        </div>

                        {newGoal.targetType === "frequency" && (
                          <div className="space-y-2">
                            <Label htmlFor="workout-type">Тип тренировки (опционально)</Label>
                            <Select
                              value={newGoal.workoutType || ""}
                              onValueChange={(value) => setNewGoal({ ...newGoal, workoutType: value || undefined })}
                            >
                              <SelectTrigger id="workout-type">
                                <SelectValue placeholder="Любой тип тренировки" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">Любой тип</SelectItem>
                                <SelectItem value="Бег">Бег</SelectItem>
                                <SelectItem value="Ходьба">Ходьба</SelectItem>
                                <SelectItem value="Велосипед">Велосипед</SelectItem>
                                <SelectItem value="Плавание">Плавание</SelectItem>
                                <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                                <SelectItem value="Йога">Йога</SelectItem>
                                <SelectItem value="ВИИТ">ВИИТ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="goal-deadline">Срок выполнения</Label>
                          <Input
                            id="goal-deadline"
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddGoal} disabled={!newGoal.title}>
                          Добавить цель
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4 mt-4">
                    {goals.filter((g) => g.completed).length > 0 ? (
                      <div className="space-y-4">
                        {goals
                          .filter((g) => g.completed)
                          .map((goal) => (
                            <Card key={goal.id}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                  <CardTitle>{goal.title}</CardTitle>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <CardDescription>Выполнено</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Progress value={100} className="h-2" />

                                <div className="flex justify-end mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleGoalCompletion(goal.id)}
                                  >
                                    Отметить как активную
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-muted-foreground">У вас пока нет достигнутых целей</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "edit" && editWorkout && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Редактировать тренировку</h2>

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-date">Дата</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editWorkout.date}
                        onChange={(e) => setEditWorkout({ ...editWorkout, date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Тип тренировки</Label>
                      <Select
                        value={editWorkout.type}
                        onValueChange={(value) => setEditWorkout({ ...editWorkout, type: value })}
                      >
                        <SelectTrigger id="edit-type">
                          <SelectValue placeholder="Выберите тип тренировки" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Бег">Бег</SelectItem>
                          <SelectItem value="Ходьба">Ходьба</SelectItem>
                          <SelectItem value="Велосипед">Велосипед</SelectItem>
                          <SelectItem value="Плавание">Плавание</SelectItem>
                          <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                          <SelectItem value="Йога">Йога</SelectItem>
                          <SelectItem value="ВИИТ">ВИИТ</SelectItem>
                          <SelectItem value="Кроссфит">Кроссфит</SelectItem>
                          <SelectItem value="Танцы">Танцы</SelectItem>
                          <SelectItem value="Другое">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Продолжительность (минуты)</Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={editWorkout.duration}
                        onChange={(e) => setEditWorkout({ ...editWorkout, duration: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-calories">Сожжено калорий</Label>
                      <Input
                        id="edit-calories"
                        type="number"
                        value={editWorkout.calories}
                        onChange={(e) => setEditWorkout({ ...editWorkout, calories: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Заметки</Label>
                    <Input
                      id="edit-notes"
                      value={editWorkout.notes}
                      onChange={(e) => setEditWorkout({ ...editWorkout, notes: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-completed"
                      checked={editWorkout.completed}
                      onCheckedChange={(checked) => setEditWorkout({ ...editWorkout, completed: checked })}
                    />
                    <label
                      htmlFor="edit-completed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Тренировка завершена
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateWorkout}>Сохранить изменения</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditWorkout(null)
                      setActiveTab("history")
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Настройки</h2>

                <Card>
                  <CardHeader>
                    <CardTitle>Настройки профиля</CardTitle>
                    <CardDescription>Обновите информацию вашего фитнес-профиля</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Вес (кг)</Label>
                        <div className="flex">
                          <Input
                            id="weight"
                            type="number"
                            value={userProfile.weight}
                            onChange={(e) => setUserProfile({ ...userProfile, weight: Number(e.target.value) })}
                            placeholder="70"
                          />
                          <Button variant="outline" size="icon" className="ml-2">
                            <Weight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Рост (см)</Label>
                        <div className="flex">
                          <Input
                            id="height"
                            type="number"
                            value={userProfile.height}
                            onChange={(e) => setUserProfile({ ...userProfile, height: Number(e.target.value) })}
                            placeholder="175"
                          />
                          <Button variant="outline" size="icon" className="ml-2">
                            <Footprints className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target">Дневная цель калорий</Label>
                      <div className="flex">
                        <Input
                          id="target"
                          type="number"
                          value={userProfile.calorieTarget}
                          onChange={(e) => setUserProfile({ ...userProfile, calorieTarget: Number(e.target.value) })}
                          placeholder="2500"
                        />
                        <Button variant="outline" size="icon" className="ml-2">
                          <FlameIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heart-rate">Пульс в покое (уд/мин)</Label>
                      <div className="flex">
                        <Input
                          id="heart-rate"
                          type="number"
                          value={userProfile.restingHeartRate}
                          onChange={(e) => setUserProfile({ ...userProfile, restingHeartRate: Number(e.target.value) })}
                          placeholder="65"
                        />
                        <Button variant="outline" size="icon" className="ml-2">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Профиль сохранен",
                          description: "Ваши настройки профиля успешно обновлены",
                        })
                      }}
                    >
                      Сохранить профиль
                    </Button>
                  </CardFooter>
                </Card>

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
                      <Select defaultValue="metric">
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
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

// Компонент переключателя
function Switch({ defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked || false)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${checked ? "bg-green-600" : "bg-gray-200"}`}
      onClick={() => setChecked(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  )
}
