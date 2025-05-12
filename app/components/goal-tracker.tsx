"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar } from "lucide-react"

export default function GoalTracker({ goal, workouts }) {
  // Расчет прогресса в зависимости от типа цели
  const calculateProgress = () => {
    if (goal.completed) return 100

    let current = 0
    const target = goal.targetValue

    if (goal.targetType === "calories") {
      // Сумма всех калорий
      current = workouts.reduce((sum, workout) => sum + workout.calories, 0)
    } else if (goal.targetType === "duration") {
      // Сумма всей продолжительности
      current = workouts.reduce((sum, workout) => sum + workout.duration, 0)
    } else if (goal.targetType === "frequency") {
      // Количество тренировок определенного типа
      current = workouts.filter((w) => (goal.workoutType ? w.type === goal.workoutType : true)).length
    }

    // Ограничиваем прогресс до 100%
    return Math.min(Math.round((current / target) * 100), 100)
  }

  // Расчет оставшихся дней до дедлайна
  const calculateDaysLeft = () => {
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const diffTime = deadline - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const progress = calculateProgress()
  const daysLeft = calculateDaysLeft()

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{goal.title || "Цель тренировок"}</span>
        </div>
        {goal.completed ? (
          <Badge variant="success">Выполнено</Badge>
        ) : (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{daysLeft > 0 ? `Осталось ${daysLeft} дн.` : daysLeft === 0 ? "Последний день!" : "Срок истек"}</span>
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{progress}%</span>
        <span>
          {goal.targetType === "calories" && `${goal.targetValue} калорий`}
          {goal.targetType === "duration" && `${goal.targetValue} минут`}
          {goal.targetType === "frequency" &&
            `${goal.targetValue} тренировок${goal.workoutType ? ` (${goal.workoutType})` : ""}`}
        </span>
      </div>
    </div>
  )
}
