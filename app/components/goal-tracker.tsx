"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Updated component to handle both single goal and array of goals
export default function GoalTracker({ goal, goals, workouts, handleToggleGoalCompletion }) {
  // If we're passed a single goal, use the original implementation
  if (goal) {
    return <SingleGoalTracker goal={goal} workouts={workouts} />
  }

  // If we're passed an array of goals, render multiple goal trackers
  if (goals && goals.length > 0) {
    return (
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{goal.title || "Цель тренировок"}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleToggleGoalCompletion(goal.id)}
                >
                  {goal.completed ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Выполнено
                    </Badge>
                  ) : (
                    <Badge variant="outline">В процессе</Badge>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {goal.targetType === "calories" && `${goal.targetValue} калорий`}
                      {goal.targetType === "duration" && `${goal.targetValue} минут`}
                      {goal.targetType === "frequency" &&
                        `${goal.targetValue} тренировок${goal.workoutType ? ` (${goal.workoutType})` : ""}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(goal.deadline) > new Date()
                        ? `До ${new Date(goal.deadline).toLocaleDateString()}`
                        : "Срок истек"}
                    </span>
                  </div>
                </div>

                <Progress value={goal.completed ? 100 : 50} className="h-2" />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{goal.completed ? "100%" : "В процессе"}</span>
                  <span>
                    {goal.targetType === "calories" && `${goal.targetValue} калорий`}
                    {goal.targetType === "duration" && `${goal.targetValue} минут`}
                    {goal.targetType === "frequency" &&
                      `${goal.targetValue} тренировок${goal.workoutType ? ` (${goal.workoutType})` : ""}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // If no goals are provided
  return (
    <div className="text-center py-6 text-muted-foreground">
      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>У вас пока нет целей</p>
      <p className="text-sm">Добавьте цель, чтобы отслеживать свой прогресс</p>
    </div>
  )
}

// Original implementation for a single goal
function SingleGoalTracker({ goal, workouts }) {
  // Расчет прогресса в зависимости от типа цели
  const calculateProgress = () => {
    if (!goal) return 0
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
    if (!goal) return 0
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
