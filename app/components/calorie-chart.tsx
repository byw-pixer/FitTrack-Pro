"use client"

import { useEffect, useRef } from "react"
import { PieChart } from "lucide-react"
import { useTheme } from "../components/theme-provider"

export default function CalorieChart({ workouts }) {
  const canvasRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current || workouts.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Группировка калорий по типам тренировок
    const caloriesByType = workouts.reduce((acc, workout) => {
      const type = workout.type
      if (!acc[type]) {
        acc[type] = 0
      }
      acc[type] += workout.calories
      return acc
    }, {})

    // Преобразование в массив для отрисовки
    const types = Object.keys(caloriesByType)
    const caloriesData = types.map((type) => caloriesByType[type])
    const totalCalories = caloriesData.reduce((sum, calories) => sum + calories, 0)

    // Цвета для секторов
    const colors = [
      "rgba(249, 115, 22, 0.7)", // оранжевый
      "rgba(59, 130, 246, 0.7)", // синий
      "rgba(16, 185, 129, 0.7)", // зеленый
      "rgba(139, 92, 246, 0.7)", // фиолетовый
      "rgba(236, 72, 153, 0.7)", // розовый
      "rgba(234, 179, 8, 0.7)", // желтый
      "rgba(239, 68, 68, 0.7)", // красный
      "rgba(20, 184, 166, 0.7)", // бирюзовый
    ]

    // Рисуем круговую диаграмму
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    let startAngle = 0

    caloriesData.forEach((calories, i) => {
      const sliceAngle = (calories / totalCalories) * 2 * Math.PI

      ctx.beginPath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Добавляем метки с процентами
      const middleAngle = startAngle + sliceAngle / 2
      const percentText = Math.round((calories / totalCalories) * 100) + "%"

      // Позиционируем текст на секторе
      const textX = centerX + Math.cos(middleAngle) * (radius * 0.7)
      const textY = centerY + Math.sin(middleAngle) * (radius * 0.7)

      ctx.fillStyle = "white"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(percentText, textX, textY)

      startAngle += sliceAngle
    })

    // Добавляем легенду
    const legendX = 10
    let legendY = canvas.height - 20 * types.length - 10

    types.forEach((type, i) => {
      const calories = caloriesByType[type]
      const percent = Math.round((calories / totalCalories) * 100)

      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(legendX, legendY, 15, 15)

      // Определяем цвета в зависимости от темы
      const textColor = theme === "dark" ? "#e2e8f0" : "#64748b"

      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(`${type} - ${calories} кал (${percent}%)`, legendX + 25, legendY + 7)

      legendY += 20
    })
  }, [workouts, theme])

  return (
    <div className="w-full h-[300px] relative">
      {workouts.length > 0 ? (
        <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <PieChart className="h-16 w-16 text-muted mb-2" />
          <p>Нет данных для отображения</p>
        </div>
      )}
    </div>
  )
}
