"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  ChevronDown,
  Edit,
  User,
  Weight,
  ImagePlus,
  X,
  Check,
  Flame,
  Heart,
  Ruler,
  Target,
  Calendar,
  Settings,
  BarChart4,
  LineChart,
  Dumbbell,
  ArrowRight,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfileEditor({ userProfile, setUserProfile }) {
  const [editMode, setEditMode] = useState(false)
  const [tempProfile, setTempProfile] = useState({ ...userProfile })
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatar || "")
  const [activeTab, setActiveTab] = useState("overview")
  const fileInputRef = useRef(null)

  // Обновление временного профиля при изменении основного
  useEffect(() => {
    setTempProfile({ ...userProfile })
    setAvatarPreview(userProfile.avatar || "")
  }, [userProfile])

  // Расчет ИМТ (Индекс массы тела)
  const calculateBMI = () => {
    if (!tempProfile.weight || !tempProfile.height) return 0
    const heightInMeters = tempProfile.height / 100
    return (tempProfile.weight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  // Получение категории ИМТ
  const getBMICategory = (bmi) => {
    if (bmi < 18.5)
      return { category: "Недостаточный вес", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" }
    if (bmi < 25)
      return { category: "Нормальный вес", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" }
    if (bmi < 30)
      return { category: "Избыточный вес", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" }
    return { category: "Ожирение", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" }
  }

  // Расчет базового метаболизма (BMR) по формуле Миффлина-Сан Жеора
  const calculateBMR = () => {
    if (!tempProfile.weight || !tempProfile.height || !tempProfile.age || !tempProfile.gender) return 0

    // Формула Миффлина-Сан Жеора
    let bmr = 10 * tempProfile.weight + 6.25 * tempProfile.height - 5 * tempProfile.age
    if (tempProfile.gender === "male") {
      bmr += 5
    } else {
      bmr -= 161
    }
    return Math.round(bmr)
  }

  // Расчет дневной нормы калорий с учетом активности
  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const activityMultipliers = {
      sedentary: 1.2, // Малоподвижный образ жизни
      light: 1.375, // Легкие тренировки 1-3 раза в неделю
      moderate: 1.55, // Умеренные тренировки 3-5 раз в неделю
      active: 1.725, // Активные тренировки 6-7 раз в неделю
      veryActive: 1.9, // Очень активные тренировки 2 раза в день
    }
    return Math.round(bmr * activityMultipliers[tempProfile.activityLevel || "moderate"])
  }

  // Обработчик изменения аватара
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setTempProfile({ ...tempProfile, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Открытие диалога выбора файла
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // Сохранение изменений профиля
  const handleSaveProfile = () => {
    setUserProfile(tempProfile)
    setEditMode(false)
    toast({
      title: "Профиль обновлен",
      description: "Ваши данные профиля успешно сохранены",
    })
  }

  // Отмена изменений
  const handleCancelEdit = () => {
    setTempProfile({ ...userProfile })
    setAvatarPreview(userProfile.avatar || "")
    setEditMode(false)
  }

  // Получение идеального веса по формуле Devine
  const getIdealWeight = () => {
    if (!tempProfile.height || !tempProfile.gender) return 0

    // Формула Devine
    if (tempProfile.gender === "male") {
      return Math.round(50 + 0.91 * (tempProfile.height - 152.4))
    } else {
      return Math.round(45.5 + 0.91 * (tempProfile.height - 152.4))
    }
  }

  // Расчет процента жира в организме (приблизительно по ИМТ и возрасту)
  const estimateBodyFat = () => {
    if (!tempProfile.age || !tempProfile.gender) return 0

    const bmi = calculateBMI()
    let bodyFat = 0

    if (tempProfile.gender === "male") {
      bodyFat = 1.2 * bmi + 0.23 * tempProfile.age - 16.2
    } else {
      bodyFat = 1.2 * bmi + 0.23 * tempProfile.age - 5.4
    }

    return Math.max(3, Math.min(bodyFat, 45)).toFixed(1)
  }

  const bmi = calculateBMI()
  const bmiCategory = getBMICategory(bmi)
  const bmr = calculateBMR()
  const tdee = calculateTDEE()
  const idealWeight = getIdealWeight()
  const bodyFat = estimateBodyFat()

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Получение прогресса к целевому весу в процентах
  const getWeightProgress = () => {
    if (!tempProfile.initialWeight || !tempProfile.weightGoal || !tempProfile.weight) return 0

    const totalToLose = tempProfile.initialWeight - tempProfile.weightGoal
    const lost = tempProfile.initialWeight - tempProfile.weight

    return Math.min(100, Math.max(0, (lost / totalToLose) * 100))
  }

  // Получение оставшегося веса до цели
  const getRemainingWeight = () => {
    if (!tempProfile.weightGoal || !tempProfile.weight) return 0
    return Math.max(0, tempProfile.weight - tempProfile.weightGoal).toFixed(1)
  }

  // Получение дней до достижения цели
  const getDaysToGoal = () => {
    if (!tempProfile.weightGoalDate) return null

    const today = new Date()
    const goalDate = new Date(tempProfile.weightGoalDate)
    const diffTime = goalDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  // Получение последней записи веса
  const getLatestWeight = () => {
    if (!tempProfile.weightHistory || tempProfile.weightHistory.length === 0) return null

    const sortedHistory = [...tempProfile.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date))
    return sortedHistory[0]
  }

  // Получение изменения веса за последний месяц
  const getMonthlyWeightChange = () => {
    if (!tempProfile.weightHistory || tempProfile.weightHistory.length < 2) return null

    const sortedHistory = [...tempProfile.weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
    const latestWeight = sortedHistory[sortedHistory.length - 1].weight

    // Находим запись примерно месяц назад
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    let closestIndex = 0
    let minDiff = Number.POSITIVE_INFINITY

    for (let i = 0; i < sortedHistory.length; i++) {
      const recordDate = new Date(sortedHistory[i].date)
      const diff = Math.abs(recordDate - oneMonthAgo)

      if (diff < minDiff) {
        minDiff = diff
        closestIndex = i
      }
    }

    const monthAgoWeight = sortedHistory[closestIndex].weight
    return (latestWeight - monthAgoWeight).toFixed(1)
  }

  const latestWeight = getLatestWeight()
  const monthlyChange = getMonthlyWeightChange()
  const weightProgress = getWeightProgress()
  const remainingWeight = getRemainingWeight()
  const daysToGoal = getDaysToGoal()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Профиль пользователя</h2>
          <p className="text-muted-foreground">Управляйте своими персональными данными и настройками</p>
        </div>

        {!editMode ? (
          <Button onClick={() => setEditMode(true)} className="self-start">
            <Edit className="mr-2 h-4 w-4" />
            Редактировать профиль
          </Button>
        ) : (
          <div className="flex gap-2 self-start">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button onClick={handleSaveProfile}>
              <Check className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Левая колонка - основная информация */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4 group">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={avatarPreview || "/placeholder.svg?height=128&width=128"} alt="Фото профиля" />
                    <AvatarFallback className="text-4xl bg-primary/10">
                      <User className="w-12 h-12 text-primary" />
                    </AvatarFallback>
                  </Avatar>

                  {editMode && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <input
                        ref={fileInputRef}
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  {editMode ? (
                    <Input
                      value={tempProfile.name || ""}
                      onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                      placeholder="Ваше имя"
                      className="text-center text-lg font-medium mb-1"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold mb-1">{tempProfile.name || "Пользователь"}</h3>
                  )}

                  {!editMode && (
                    <div className="text-sm text-muted-foreground">
                      {tempProfile.gender === "male" ? "Мужчина" : tempProfile.gender === "female" ? "Женщина" : ""}
                      {tempProfile.age ? `, ${tempProfile.age} лет` : ""}
                    </div>
                  )}
                </div>

                {editMode && (
                  <div className="w-full space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Пол</Label>
                        <Select
                          value={tempProfile.gender || ""}
                          onValueChange={(value) => setTempProfile({ ...tempProfile, gender: value })}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Мужской</SelectItem>
                            <SelectItem value="female">Женский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Возраст</Label>
                        <Input
                          id="age"
                          type="number"
                          value={tempProfile.age || ""}
                          onChange={(e) => setTempProfile({ ...tempProfile, age: Number(e.target.value) })}
                          placeholder="Лет"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activity">Уровень активности</Label>
                      <Select
                        value={tempProfile.activityLevel || "moderate"}
                        onValueChange={(value) => setTempProfile({ ...tempProfile, activityLevel: value })}
                      >
                        <SelectTrigger id="activity">
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Малоподвижный</SelectItem>
                          <SelectItem value="light">Легкая активность (1-3 раза в неделю)</SelectItem>
                          <SelectItem value="moderate">Умеренная активность (3-5 раз в неделю)</SelectItem>
                          <SelectItem value="active">Высокая активность (6-7 раз в неделю)</SelectItem>
                          <SelectItem value="veryActive">Очень высокая активность</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {!editMode && (
                  <div className="w-full mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Текущий вес</span>
                      </div>
                      <span className="font-medium">{tempProfile.weight} кг</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Рост</span>
                      </div>
                      <span className="font-medium">{tempProfile.height} см</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Пульс в покое</span>
                      </div>
                      <span className="font-medium">{tempProfile.restingHeartRate} уд/мин</span>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart4 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">ИМТ</span>
                      </div>
                      <Badge className={`${bmiCategory.bgColor} ${bmiCategory.color} font-medium`}>
                        {bmi} - {bmiCategory.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Дневная норма</span>
                      </div>
                      <span className="font-medium">{tempProfile.calorieTarget || tdee} кал</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!editMode && tempProfile.weightGoal && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Цель по весу
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{tempProfile.weightGoal} кг</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Badge variant={remainingWeight > 0 ? "outline" : "success"}>
                      {remainingWeight > 0 ? `Осталось: ${remainingWeight} кг` : "Цель достигнута!"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Прогресс</span>
                      <span>{Math.round(weightProgress)}%</span>
                    </div>
                    <Progress value={weightProgress} className="h-2" />
                  </div>

                  {daysToGoal !== null && daysToGoal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Срок достижения</span>
                      </div>
                      <span>{formatDate(tempProfile.weightGoalDate)}</span>
                    </div>
                  )}

                  {latestWeight && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <LineChart className="h-3.5 w-3.5" />
                        <span>Последнее измерение</span>
                      </div>
                      <span>{formatDate(latestWeight.date)}</span>
                    </div>
                  )}

                  {monthlyChange && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Изменение за месяц</span>
                      <span
                        className={
                          Number(monthlyChange) < 0 ? "text-green-500" : Number(monthlyChange) > 0 ? "text-red-500" : ""
                        }
                      >
                        {Number(monthlyChange) > 0 ? "+" : ""}
                        {monthlyChange} кг
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Правая колонка - детальная информация и настройки */}
        <div>
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Редактирование профиля</CardTitle>
                <CardDescription>Обновите свои персональные данные и настройки</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="measurements" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="measurements">Измерения</TabsTrigger>
                    <TabsTrigger value="goals">Цели</TabsTrigger>
                    <TabsTrigger value="preferences">Настройки</TabsTrigger>
                  </TabsList>

                  <TabsContent value="measurements" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Основные параметры</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Вес (кг)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={tempProfile.weight || ""}
                            onChange={(e) => setTempProfile({ ...tempProfile, weight: Number(e.target.value) })}
                            placeholder="Ваш вес"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="height">Рост (см)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={tempProfile.height || ""}
                            onChange={(e) => setTempProfile({ ...tempProfile, height: Number(e.target.value) })}
                            placeholder="Ваш рост"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Дополнительные параметры</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="heart-rate">Пульс в покое (уд/мин)</Label>
                          <Input
                            id="heart-rate"
                            type="number"
                            value={tempProfile.restingHeartRate || ""}
                            onChange={(e) =>
                              setTempProfile({ ...tempProfile, restingHeartRate: Number(e.target.value) })
                            }
                            placeholder="Пульс в покое"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Дополнительные измерения тела</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="chest">Обхват груди (см)</Label>
                              <Input
                                id="chest"
                                type="number"
                                value={tempProfile.measurements?.chest || ""}
                                onChange={(e) =>
                                  setTempProfile({
                                    ...tempProfile,
                                    measurements: {
                                      ...tempProfile.measurements,
                                      chest: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="waist">Обхват талии (см)</Label>
                              <Input
                                id="waist"
                                type="number"
                                value={tempProfile.measurements?.waist || ""}
                                onChange={(e) =>
                                  setTempProfile({
                                    ...tempProfile,
                                    measurements: {
                                      ...tempProfile.measurements,
                                      waist: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="hips">Обхват бедер (см)</Label>
                              <Input
                                id="hips"
                                type="number"
                                value={tempProfile.measurements?.hips || ""}
                                onChange={(e) =>
                                  setTempProfile({
                                    ...tempProfile,
                                    measurements: {
                                      ...tempProfile.measurements,
                                      hips: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="biceps">Обхват бицепса (см)</Label>
                              <Input
                                id="biceps"
                                type="number"
                                value={tempProfile.measurements?.biceps || ""}
                                onChange={(e) =>
                                  setTempProfile({
                                    ...tempProfile,
                                    measurements: {
                                      ...tempProfile.measurements,
                                      biceps: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Цели по питанию</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="calorie-target">Дневная цель калорий</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="calorie-target"
                              type="number"
                              value={tempProfile.calorieTarget || ""}
                              onChange={(e) =>
                                setTempProfile({ ...tempProfile, calorieTarget: Number(e.target.value) })
                              }
                              placeholder="Целевое количество калорий"
                            />
                            <Button
                              variant="outline"
                              onClick={() => setTempProfile({ ...tempProfile, calorieTarget: tdee })}
                              className="whitespace-nowrap"
                            >
                              Расчетное ({tdee})
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Рекомендуемая дневная норма калорий на основе вашего метаболизма и уровня активности
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Цели по весу</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight-goal">Целевой вес (кг)</Label>
                          <Input
                            id="weight-goal"
                            type="number"
                            value={tempProfile.weightGoal || ""}
                            onChange={(e) => setTempProfile({ ...tempProfile, weightGoal: Number(e.target.value) })}
                            placeholder="Ваш целевой вес"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Идеальный вес для вашего роста и пола: {idealWeight} кг
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="initial-weight">Начальный вес (кг)</Label>
                          <Input
                            id="initial-weight"
                            type="number"
                            value={tempProfile.initialWeight || tempProfile.weight || ""}
                            onChange={(e) => setTempProfile({ ...tempProfile, initialWeight: Number(e.target.value) })}
                            placeholder="Ваш начальный вес"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Вес, с которого вы начали отслеживание прогресса
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight-goal-date">Дата достижения цели</Label>
                          <Input
                            id="weight-goal-date"
                            type="date"
                            value={tempProfile.weightGoalDate || ""}
                            onChange={(e) => setTempProfile({ ...tempProfile, weightGoalDate: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Дата, к которой вы планируете достичь целевого веса
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Настройки приложения</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="units">Единицы измерения</Label>
                          <Select
                            value={tempProfile.units || "metric"}
                            onValueChange={(value) => setTempProfile({ ...tempProfile, units: value })}
                          >
                            <SelectTrigger id="units">
                              <SelectValue placeholder="Выберите единицы измерения" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="metric">Метрические (кг, см)</SelectItem>
                              <SelectItem value="imperial">Имперские (фунты, дюймы)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="language">Язык</Label>
                          <Select
                            value={tempProfile.language || "ru"}
                            onValueChange={(value) => setTempProfile({ ...tempProfile, language: value })}
                          >
                            <SelectTrigger id="language">
                              <SelectValue placeholder="Выберите язык" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ru">Русский</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Настройки приватности</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="privacy">Видимость профиля</Label>
                          <Select
                            value={tempProfile.privacy || "private"}
                            onValueChange={(value) => setTempProfile({ ...tempProfile, privacy: value })}
                          >
                            <SelectTrigger id="privacy">
                              <SelectValue placeholder="Настройки приватности" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Приватный профиль</SelectItem>
                              <SelectItem value="friends">Только для друзей</SelectItem>
                              <SelectItem value="public">Публичный профиль</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="share-workouts">Делиться тренировками</Label>
                            <p className="text-xs text-muted-foreground">
                              Разрешить публиковать ваши тренировки в ленте
                            </p>
                          </div>
                          <Switch
                            id="share-workouts"
                            checked={tempProfile.shareWorkouts || false}
                            onCheckedChange={(checked) => setTempProfile({ ...tempProfile, shareWorkouts: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="share-goals">Делиться целями</Label>
                            <p className="text-xs text-muted-foreground">
                              Разрешить публиковать ваши цели и достижения
                            </p>
                          </div>
                          <Switch
                            id="share-goals"
                            checked={tempProfile.shareGoals || false}
                            onCheckedChange={(checked) => setTempProfile({ ...tempProfile, shareGoals: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="stats">Статистика</TabsTrigger>
                    <TabsTrigger value="measurements">Измерения</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Flame className="h-5 w-5 text-primary" />
                              <h3 className="font-medium">Метаболизм</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-muted-foreground">Базовый метаболизм (BMR)</span>
                                  <span className="font-medium">{bmr} кал/день</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Калории, необходимые для поддержания жизни в покое
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-muted-foreground">Суточная норма (TDEE)</span>
                                  <span className="font-medium">{tdee} кал/день</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Калории с учетом вашего уровня активности
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="h-5 w-5 text-primary" />
                              <h3 className="font-medium">Состав тела</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-muted-foreground">Процент жира</span>
                                  <span className="font-medium">{bodyFat}%</span>
                                </div>
                                <Progress value={bodyFat} max={40} className="h-1.5" />
                                <div className="text-xs text-muted-foreground mt-1">
                                  {tempProfile.gender === "male"
                                    ? "Норма для мужчин: 10-20%"
                                    : "Норма для женщин: 18-28%"}
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-muted-foreground">Мышечная масса</span>
                                  <span className="font-medium">
                                    {tempProfile.weight
                                      ? Math.round(tempProfile.weight * (1 - bodyFat / 100) * 0.8)
                                      : 0}{" "}
                                    кг
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Приблизительная оценка мышечной массы
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Рекомендации</h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            {bmi < 18.5 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-500 p-1 rounded-full mt-0.5">
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                                <p>
                                  У вас недостаточный вес. Рекомендуется увеличить потребление калорий и включить
                                  силовые тренировки для набора мышечной массы.
                                </p>
                              </div>
                            )}
                            {bmi >= 18.5 && bmi < 25 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-500 p-1 rounded-full mt-0.5">
                                  <Check className="h-3 w-3" />
                                </div>
                                <p>
                                  У вас нормальный вес. Продолжайте поддерживать здоровый образ жизни с регулярными
                                  тренировками и сбалансированным питанием.
                                </p>
                              </div>
                            )}
                            {bmi >= 25 && bmi < 30 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 p-1 rounded-full mt-0.5">
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                                <p>
                                  У вас избыточный вес. Рекомендуется умеренный дефицит калорий (300-500 кал/день) и
                                  регулярные кардио и силовые тренировки.
                                </p>
                              </div>
                            )}
                            {bmi >= 30 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-red-100 dark:bg-red-900/30 text-red-500 p-1 rounded-full mt-0.5">
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                                <p>
                                  У вас ожирение. Рекомендуется проконсультироваться с врачом для разработки плана
                                  снижения веса, включающего диету и физические упражнения.
                                </p>
                              </div>
                            )}

                            {tempProfile.gender === "male" && Number(bodyFat) > 25 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 p-1 rounded-full mt-0.5">
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                                <p>
                                  Процент жира в организме выше нормы. Рекомендуется сосредоточиться на снижении жировой
                                  массы через кардио тренировки и дефицит калорий.
                                </p>
                              </div>
                            )}
                            {tempProfile.gender === "female" && Number(bodyFat) > 32 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 p-1 rounded-full mt-0.5">
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                                <p>
                                  Процент жира в организме выше нормы. Рекомендуется сосредоточиться на снижении жировой
                                  массы через кардио тренировки и дефицит калорий.
                                </p>
                              </div>
                            )}

                            {tempProfile.restingHeartRate > 80 && (
                              <div className="flex gap-2 items-start">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 p-1 rounded-full mt-0.5">
                                  <Heart className="h-3 w-3" />
                                </div>
                                <p>
                                  Ваш пульс в покое повышен. Регулярные кардио тренировки помогут улучшить работу
                                  сердечно-сосудистой системы.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "stats" && (
                      <div className="space-y-6">
                        <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <BarChart4 className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Индекс массы тела (ИМТ)</h3>
                          </div>

                          <div className="flex items-center gap-4 mb-2">
                            <div className="text-4xl font-bold">{bmi}</div>
                            <div>
                              <div className={`font-medium ${bmiCategory.color}`}>{bmiCategory.category}</div>
                              <div className="text-sm text-muted-foreground">Норма: 18.5 - 24.9</div>
                            </div>
                          </div>

                          <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: "100%",
                                background: "linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #ef4444)",
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>16</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>40</span>
                          </div>
                          <div
                            className="relative h-0"
                            style={{
                              left: `${Math.min(100, Math.max(0, ((bmi - 16) / 24) * 100))}%`,
                              top: "-28px",
                            }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                            <h3 className="font-medium">Метаболизм</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Базовый метаболизм (BMR)</span>
                                  <span className="font-medium">{bmr} кал/день</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Количество калорий, необходимое для поддержания жизни в состоянии покоя
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Суточная норма (TDEE)</span>
                                  <span className="font-medium">{tdee} кал/день</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Количество калорий с учетом вашего уровня активности
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Идеальный вес</span>
                                  <span className="font-medium">{idealWeight} кг</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Рекомендуемый вес для вашего роста и пола
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                            <h3 className="font-medium">Состав тела</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Процент жира (приблизительно)</span>
                                  <span className="font-medium">{bodyFat}%</span>
                                </div>
                                <Progress value={bodyFat} max={40} className="h-2" />
                                <div className="text-xs text-muted-foreground mt-1">
                                  {tempProfile.gender === "male"
                                    ? "Норма для мужчин: 10-20%"
                                    : "Норма для женщин: 18-28%"}
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Мышечная масса (приблизительно)</span>
                                  <span className="font-medium">
                                    {tempProfile.weight
                                      ? Math.round(tempProfile.weight * (1 - bodyFat / 100) * 0.8)
                                      : 0}{" "}
                                    кг
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Приблизительная оценка мышечной массы
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "measurements" && (
                      <div className="space-y-6">
                        <div className="bg-primary/5 rounded-lg p-4">
                          <h3 className="font-medium mb-4">Измерения тела</h3>
                          {tempProfile.measurements ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                {tempProfile.measurements.chest && (
                                  <div>
                                    <div className="text-sm text-muted-foreground">Обхват груди</div>
                                    <div className="font-medium text-lg">{tempProfile.measurements.chest} см</div>
                                  </div>
                                )}
                                {tempProfile.measurements.waist && (
                                  <div>
                                    <div className="text-sm text-muted-foreground">Обхват талии</div>
                                    <div className="font-medium text-lg">{tempProfile.measurements.waist} см</div>
                                  </div>
                                )}
                                {tempProfile.measurements.hips && (
                                  <div>
                                    <div className="text-sm text-muted-foreground">Обхват бедер</div>
                                    <div className="font-medium text-lg">{tempProfile.measurements.hips} см</div>
                                  </div>
                                )}
                                {tempProfile.measurements.biceps && (
                                  <div>
                                    <div className="text-sm text-muted-foreground">Обхват бицепса</div>
                                    <div className="font-medium text-lg">{tempProfile.measurements.biceps} см</div>
                                  </div>
                                )}
                              </div>

                              {tempProfile.measurements.waist && tempProfile.measurements.hips && (
                                <div className="pt-2 border-t border-border">
                                  <div className="text-sm text-muted-foreground">Соотношение талия/бедра</div>
                                  <div className="font-medium text-lg">
                                    {(tempProfile.measurements.waist / tempProfile.measurements.hips).toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {tempProfile.gender === "male"
                                      ? "Рекомендуемое значение для мужчин: < 0.95"
                                      : "Рекомендуемое значение для женщин: < 0.85"}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              <p>Измерения тела пока не добавлены</p>
                              <p className="text-sm">Нажмите "Редактировать" для добавления измерений</p>
                            </div>
                          )}
                        </div>

                        {tempProfile.weightHistory && tempProfile.weightHistory.length > 0 && (
                          <div className="bg-primary/5 rounded-lg p-4">
                            <h3 className="font-medium mb-4">История веса</h3>
                            <div className="h-64">
                              <WeightHistoryChart weightHistory={tempProfile.weightHistory} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Компонент для отображения графика истории веса
function WeightHistoryChart({ weightHistory }) {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current || !weightHistory || weightHistory.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Определяем цвета в зависимости от темы
    const textColor = theme === "dark" ? "#e2e8f0" : "#64748b"
    const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"
    const lineColor = "#10b981"

    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Сортировка истории веса по дате
    const sortedHistory = [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Получение значений для графика
    const dates = sortedHistory.map((entry) => new Date(entry.date))
    const weights = sortedHistory.map((entry) => entry.weight)

    // Находим минимальное и максимальное значения для масштабирования
    const minWeight = Math.min(...weights) - 1
    const maxWeight = Math.max(...weights) + 1

    // Настройка графика
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Рисуем оси
    ctx.beginPath()
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1

    // Ось X
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)

    // Ось Y
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()

    // Рисуем подписи осей
    ctx.fillStyle = textColor
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"

    // Подписи по оси X (даты)
    const dateStep = Math.max(1, Math.floor(dates.length / 5))
    for (let i = 0; i < dates.length; i += dateStep) {
      const x = padding + (i / (dates.length - 1)) * chartWidth
      const date = dates[i]
      ctx.fillText(`${date.getDate()}.${date.getMonth() + 1}`, x, canvas.height - padding + 15)
    }

    // Подписи по оси Y (вес)
    ctx.textAlign = "right"
    const weightRange = maxWeight - minWeight
    const weightStep = weightRange / 5
    for (let i = 0; i <= 5; i++) {
      const weight = minWeight + i * weightStep
      const y = canvas.height - padding - (i / 5) * chartHeight
      ctx.fillText(`${weight.toFixed(1)}`, padding - 5, y + 3)
    }

    // Рисуем линию графика
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 2

    for (let i = 0; i < dates.length; i++) {
      const x = padding + (i / (dates.length - 1)) * chartWidth
      const y = canvas.height - padding - ((weights[i] - minWeight) / weightRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Рисуем точки на графике
    for (let i = 0; i < dates.length; i++) {
      const x = padding + (i / (dates.length - 1)) * chartWidth
      const y = canvas.height - padding - ((weights[i] - minWeight) / weightRange) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = lineColor
      ctx.fill()
    }
  }, [weightHistory, theme])

  return (
    <div className="w-full h-full">
      {weightHistory && weightHistory.length > 0 ? (
        <canvas ref={canvasRef} width={500} height={250} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Нет данных для отображения</p>
        </div>
      )}
    </div>
  )
}
