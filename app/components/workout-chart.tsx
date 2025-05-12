"use client"

import { useEffect, useRef } from "react"
import { BarChartIcon } from "lucide-react"
import { useTheme } from "../components/theme-provider"

export default function WorkoutChart({ workouts }) {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current || workouts.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Определяем цвета в зависимости от темы
    const textColor = theme === "dark" ? "#e2e8f0" : "#64748b"
    const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"

    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Группировка тренировок по дате
    const workoutsByDate = workouts.reduce((acc, workout) => {
      const date = workout.date
      if (!acc[date]) {
        acc[date] = {
          calories: 0,
          duration: 0,
          count: 0,
        }
      }
      acc[date].calories += workout.calories
      acc[date].duration += workout.duration
      acc[date].count += 1
      return acc
    }, {})

    // Преобразование в массив для отрисовки
    const dates = Object.keys(workoutsByDate).sort((a, b) => new Date(a) - new Date(b))
    const caloriesData = dates.map((date) => workoutsByDate[date].calories)
    const durationData = dates.map((date) => workoutsByDate[date].duration)

    // Форматирование дат для отображения
    const formattedDates = dates.map((date) => {
      const d = new Date(date)
      return `${d.getDate()}.${d.getMonth() + 1}`
    })

    // Настройка графика
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Находим максимальные значения для масштабирования
    const maxCalories = Math.max(...caloriesData, 100)
    const maxDuration = Math.max(...durationData, 30)

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
    const barWidth = chartWidth / dates.length
    formattedDates.forEach((date, i) => {
      const x = padding + i * barWidth + barWidth / 2
      ctx.fillText(date, x, canvas.height - padding + 15)
    })

    // Подписи по оси Y (калории)
    ctx.textAlign = "right"
    ctx.fillStyle = "#f97316"
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxCalories * i) / 5)
      const y = canvas.height - padding - (i / 5) * chartHeight
      ctx.fillText(`${value} кал`, padding - 5, y + 3)
    }

    // Подписи по оси Y справа (продолжительность)
    ctx.textAlign = "left"
    ctx.fillStyle = "#3b82f6"
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxDuration * i) / 5)
      const y = canvas.height - padding - (i / 5) * chartHeight
      ctx.fillText(`${value} мин`, canvas.width - padding + 5, y + 3)
    }

    // Рисуем столбцы для калорий
    caloriesData.forEach((calories, i) => {
      const barHeight = (calories / maxCalories) * chartHeight
      const x = padding + i * barWidth + barWidth * 0.2
      const y = canvas.height - padding - barHeight

      ctx.fillStyle = "rgba(249, 115, 22, 0.7)"
      ctx.fillRect(x, y, barWidth * 0.3, barHeight)
    })

    // Рисуем столбцы для продолжительности
    durationData.forEach((duration, i) => {
      const barHeight = (duration / maxDuration) * chartHeight
      const x = padding + i * barWidth + barWidth * 0.5
      const y = canvas.height - padding - barHeight

      ctx.fillStyle = "rgba(59, 130, 246, 0.7)"
      ctx.fillRect(x, y, barWidth * 0.3, barHeight)
    })

    // Добавляем легенду
    ctx.fillStyle = textColor
    ctx.font = "12px sans-serif"

    // Легенда для калорий
    ctx.fillStyle = "rgba(249, 115, 22, 0.7)"
    ctx.fillRect(padding, padding - 20, 15, 10)
    ctx.fillStyle = textColor
    ctx.textAlign = "left"
    ctx.fillText("Калории", padding + 20, padding - 12)

    // Легенда для продолжительности
    ctx.fillStyle = "rgba(59, 130, 246, 0.7)"
    ctx.fillRect(padding + 100, padding - 20, 15, 10)
    ctx.fillStyle = textColor
    ctx.fillText("Продолжительность", padding + 120, padding - 12)
  }, [workouts, theme])

  return (
    <div className="w-full h-[300px] relative">
      {workouts.length > 0 ? (
        <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <BarChartIcon className="h-16 w-16 text-muted mb-2" />
          <p>Нет данных для отображения</p>
        </div>
      )}
    </div>
  )
}
