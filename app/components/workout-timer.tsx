"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Volume2, VolumeX, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function WorkoutTimer({ onSaveWorkout }) {
  // Состояния для таймера
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [timerMode, setTimerMode] = useState("countdown") // countdown или stopwatch
  const [initialTime, setInitialTime] = useState(300) // 5 минут по умолчанию
  const [rounds, setRounds] = useState(1)
  const [currentRound, setCurrentRound] = useState(1)
  const [restTime, setRestTime] = useState(60) // 1 минута отдыха по умолчанию
  const [isResting, setIsResting] = useState(false)
  const [muted, setMuted] = useState(false)
  const [workoutType, setWorkoutType] = useState("Силовая тренировка")
  const [caloriesBurned, setCaloriesBurned] = useState(0)
  const [notes, setNotes] = useState("")

  // Рефы для аудио
  const startSoundRef = useRef(null)
  const endSoundRef = useRef(null)
  const tickSoundRef = useRef(null)

  // Инициализация аудио при монтировании компонента
  useEffect(() => {
    // Создаем аудио элементы с обработкой ошибок
    try {
      startSoundRef.current = new Audio()
      endSoundRef.current = new Audio()
      tickSoundRef.current = new Audio()

      // Устанавливаем обработчики ошибок
      const handleError = (e) => {
        console.warn("Audio error:", e)
        // Отключаем звук при ошибках
        setMuted(true)
      }

      if (startSoundRef.current) {
        startSoundRef.current.addEventListener("error", handleError)
      }
      if (endSoundRef.current) {
        endSoundRef.current.addEventListener("error", handleError)
      }
      if (tickSoundRef.current) {
        tickSoundRef.current.addEventListener("error", handleError)
      }
    } catch (error) {
      console.warn("Failed to initialize audio:", error)
      setMuted(true)
    }

    return () => {
      // Очистка ресурсов при размонтировании
      try {
        if (startSoundRef.current) {
          startSoundRef.current.pause()
          startSoundRef.current.removeEventListener("error", () => {})
        }
        if (endSoundRef.current) {
          endSoundRef.current.pause()
          endSoundRef.current.removeEventListener("error", () => {})
        }
        if (tickSoundRef.current) {
          tickSoundRef.current.pause()
          tickSoundRef.current.removeEventListener("error", () => {})
        }
      } catch (error) {
        console.warn("Error cleaning up audio resources:", error)
      }
    }
  }, [])

  // Эффект для таймера
  useEffect(() => {
    let interval = null

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          // Для обратного отсчета
          if (timerMode === "countdown") {
            // Если время закончилось
            if (prevTime <= 1) {
              if (!muted && endSoundRef.current) {
                try {
                  // Создаем новый экземпляр Audio для каждого воспроизведения
                  const endSound = new Audio()
                  endSound.play().catch((error) => {
                    console.warn("Failed to play end sound:", error)
                  })
                } catch (error) {
                  console.warn("Error playing end sound:", error)
                }
              }

              // Если есть еще раунды и сейчас не отдых
              if (currentRound < rounds && !isResting) {
                setIsResting(true)
                return restTime
              }
              // Если сейчас отдых, переходим к следующему раунду
              else if (isResting) {
                setIsResting(false)
                setCurrentRound((prev) => prev + 1)
                return initialTime
              }
              // Если все раунды завершены
              else {
                setIsRunning(false)
                completeWorkout()
                return 0
              }
            }
            // Обычное уменьшение времени
            return prevTime - 1
          }
          // Для секундомера
          else {
            return prevTime + 1
          }
        })
      }, 1000)
    } else if (!isRunning && time !== 0) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isRunning, timerMode, time, currentRound, rounds, isResting, restTime, initialTime, muted])

  // Функция для запуска/паузы таймера
  const toggleTimer = () => {
    if (!isRunning) {
      // Если таймер запускается
      if (!muted && startSoundRef.current) {
        try {
          // Создаем новый экземпляр Audio для каждого воспроизведения
          const startSound = new Audio()
          startSound.play().catch((error) => {
            console.warn("Failed to play start sound:", error)
          })
        } catch (error) {
          console.warn("Error playing start sound:", error)
        }
      }
    }
    setIsRunning(!isRunning)
  }

  // Функция для сброса таймера
  const resetTimer = () => {
    setIsRunning(false)
    setTime(timerMode === "countdown" ? initialTime : 0)
    setCurrentRound(1)
    setIsResting(false)
  }

  // Функция для изменения режима таймера
  const handleTimerModeChange = (mode) => {
    setTimerMode(mode)
    resetTimer()
  }

  // Функция для изменения начального времени
  const handleInitialTimeChange = (value) => {
    setInitialTime(value)
    if (!isRunning && timerMode === "countdown") {
      setTime(value)
    }
  }

  // Функция для завершения тренировки
  const completeWorkout = () => {
    // Расчет примерного количества сожженных калорий
    // Это очень приблизительный расчет, в реальности зависит от многих факторов
    const duration =
      timerMode === "countdown"
        ? (initialTime * rounds) / 60 // в минутах
        : time / 60 // в минутах

    let caloriesPerMinute = 0
    switch (workoutType) {
      case "Бег":
        caloriesPerMinute = 10 // ~600 калорий в час
        break
      case "Силовая тренировка":
        caloriesPerMinute = 8 // ~480 калорий в час
        break
      case "Велосипед":
        caloriesPerMinute = 7 // ~420 калорий в час
        break
      case "Плавание":
        caloriesPerMinute = 9 // ~540 калорий в час
        break
      case "Йога":
        caloriesPerMinute = 4 // ~240 калорий в час
        break
      default:
        caloriesPerMinute = 6 // ~360 калорий в час
    }

    const estimatedCalories = Math.round(duration * caloriesPerMinute)
    setCaloriesBurned(estimatedCalories)

    toast({
      title: "Тренировка завершена!",
      description: `Вы тренировались ${Math.round(duration)} минут и сожгли примерно ${estimatedCalories} калорий.`,
    })
  }

  // Функция для сохранения тренировки
  const saveWorkout = () => {
    const duration =
      timerMode === "countdown"
        ? (initialTime * rounds) / 60 // в минутах
        : time / 60 // в минутах

    const workout = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: workoutType,
      duration: Math.round(duration),
      calories: caloriesBurned,
      notes: notes,
      completed: true,
    }

    onSaveWorkout(workout)

    toast({
      title: "Тренировка сохранена",
      description: `${workout.type} - ${workout.duration} мин`,
    })

    // Сброс формы
    resetTimer()
    setNotes("")
  }

  // Форматирование времени для отображения
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Таймер тренировки</CardTitle>
          <CardDescription>Отслеживайте время вашей тренировки</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="countdown" onValueChange={handleTimerModeChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="countdown">Обратный отсчет</TabsTrigger>
              <TabsTrigger value="stopwatch">Секундомер</TabsTrigger>
            </TabsList>
            <TabsContent value="countdown" className="space-y-4">
              <div className="space-y-2">
                <Label>Продолжительность (минуты)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[initialTime / 60]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={(value) => handleInitialTimeChange(value[0] * 60)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{initialTime / 60}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Количество раундов</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[rounds]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setRounds(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{rounds}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Время отдыха (секунды)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[restTime]}
                    min={0}
                    max={180}
                    step={5}
                    onValueChange={(value) => setRestTime(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{restTime}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-7xl font-bold tabular-nums mb-4">{formatTime(time)}</div>

            <div className="text-sm text-muted-foreground mb-6">
              {timerMode === "countdown" && (
                <>
                  {isResting ? "Отдых" : "Работа"} • Раунд {currentRound} из {rounds}
                </>
              )}
            </div>

            <div className="flex gap-4">
              <Button size="lg" onClick={toggleTimer}>
                {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isRunning ? "Пауза" : "Старт"}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="mr-2 h-5 w-5" />
                Сброс
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="workout-type">Тип тренировки</Label>
              <Select value={workoutType} onValueChange={setWorkoutType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите тип тренировки" />
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

            <div>
              <Label htmlFor="notes">Заметки</Label>
              <Input
                id="notes"
                placeholder="Добавьте заметки о тренировке"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveWorkout} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Сохранить тренировку
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
