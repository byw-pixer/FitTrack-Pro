"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  BarChart,
  Calendar,
  Clock,
  FlameIcon,
  Footprints,
  Heart,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Trash2,
  Weight,
} from "lucide-react"

export default function FitnessTracker() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [workouts, setWorkouts] = useState([
    { id: 1, date: "2024-05-10", type: "Бег", duration: 30, calories: 320, notes: "Утренняя пробежка в парке" },
    {
      id: 2,
      date: "2024-05-09",
      type: "Силовая тренировка",
      duration: 45,
      calories: 280,
      notes: "День верхней части тела",
    },
    { id: 3, date: "2024-05-08", type: "Велосипед", duration: 60, calories: 450, notes: "Холмистая местность" },
  ])

  const [newWorkout, setNewWorkout] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Бег",
    duration: 30,
    calories: 300,
    notes: "",
  })

  const [editWorkout, setEditWorkout] = useState(null)

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
    })
  }

  const handleDeleteWorkout = (id) => {
    setWorkouts(workouts.filter((workout) => workout.id !== id))
  }

  const handleEditWorkout = (workout) => {
    setEditWorkout(workout)
    setActiveTab("edit")
  }

  const handleUpdateWorkout = () => {
    setWorkouts(workouts.map((w) => (w.id === editWorkout.id ? editWorkout : w)))
    setEditWorkout(null)
    setActiveTab("history")
  }

  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0)
  const totalWorkouts = workouts.length
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0)

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-green-600">
            <Activity className="h-8 w-8" />
            FitTrack Pro
          </h1>
          <p className="text-slate-500">Отслеживайте, анализируйте и улучшайте свой путь к фитнесу</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
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
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Настройки
              </Button>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Панель управления</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Недавняя активность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-md">
                      <BarChart className="h-16 w-16 text-slate-300" />
                      <span className="ml-2 text-slate-400">Здесь будет отображаться график активности</span>
                    </div>
                  </CardContent>
                </Card>
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
                </div>

                <Button onClick={handleAddWorkout} className="w-full md:w-auto">
                  Добавить тренировку
                </Button>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">История тренировок</h2>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Продолжительность</TableHead>
                        <TableHead>Калории</TableHead>
                        <TableHead>Заметки</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workouts.map((workout) => (
                        <TableRow key={workout.id}>
                          <TableCell>{workout.date}</TableCell>
                          <TableCell>{workout.type}</TableCell>
                          <TableCell>{workout.duration} мин</TableCell>
                          <TableCell>{workout.calories}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{workout.notes}</TableCell>
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
                          <Input id="weight" type="number" placeholder="70" />
                          <Button variant="outline" size="icon" className="ml-2">
                            <Weight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Рост (см)</Label>
                        <div className="flex">
                          <Input id="height" type="number" placeholder="175" />
                          <Button variant="outline" size="icon" className="ml-2">
                            <Footprints className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target">Дневная цель калорий</Label>
                      <div className="flex">
                        <Input id="target" type="number" placeholder="2500" />
                        <Button variant="outline" size="icon" className="ml-2">
                          <FlameIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heart-rate">Пульс в покое (уд/мин)</Label>
                      <div className="flex">
                        <Input id="heart-rate" type="number" placeholder="65" />
                        <Button variant="outline" size="icon" className="ml-2">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Сохранить профиль</Button>
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
                        <Switch />
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
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Это просто макет компонента, так как мы импортируем его, но его нет в компонентах shadcn
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
