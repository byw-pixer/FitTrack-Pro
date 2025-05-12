"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function WeightTracker({ userProfile, setUserProfile }) {
  const [newWeight, setNewWeight] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])

  // Добавление новой записи веса
  const handleAddWeight = () => {
    if (!newWeight || isNaN(Number(newWeight)) || Number(newWeight) <= 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректное значение веса",
        variant: "destructive",
      })
      return
    }

    const weightEntry = {
      date: newDate,
      weight: Number(newWeight),
    }

    // Инициализация истории веса, если она еще не существует
    const weightHistory = userProfile.weightHistory || []

    // Проверка на дубликат даты
    const existingEntryIndex = weightHistory.findIndex((entry) => entry.date === newDate)

    let updatedHistory
    if (existingEntryIndex >= 0) {
      // Обновляем существующую запись
      updatedHistory = [...weightHistory]
      updatedHistory[existingEntryIndex] = weightEntry
      toast({
        title: "Запись обновлена",
        description: `Вес на ${newDate} обновлен до ${newWeight} кг`,
      })
    } else {
      // Добавляем новую запись
      updatedHistory = [...weightHistory, weightEntry]
      toast({
        title: "Запись добавлена",
        description: `Вес ${newWeight} кг добавлен`,
      })
    }

    // Сортировка по дате (от новых к старым)
    updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Обновление профиля пользователя
    const updatedProfile = {
      ...userProfile,
      weightHistory: updatedHistory,
      // Обновляем текущий вес, если запись сегодняшняя
      weight: newDate === new Date().toISOString().split("T")[0] ? Number(newWeight) : userProfile.weight,
    }

    // Если это первая запись, устанавливаем начальный вес
    if (!userProfile.initialWeight && updatedHistory.length === 1) {
      updatedProfile.initialWeight = Number(newWeight)
    }

    setUserProfile(updatedProfile)
    setNewWeight("")
  }

  // Удаление записи веса
  const handleDeleteWeight = (date) => {
    const weightHistory = userProfile.weightHistory || []
    const updatedHistory = weightHistory.filter((entry) => entry.date !== date)

    // Обновление профиля пользователя
    setUserProfile({
      ...userProfile,
      weightHistory: updatedHistory,
    })

    toast({
      title: "Запись удалена",
      description: `Запись веса за ${date} удалена`,
      variant: "destructive",
    })
  }

  // Расчет изменения веса
  const calculateWeightChange = () => {
    const weightHistory = userProfile.weightHistory || []
    if (weightHistory.length < 2) return { value: 0, isPositive: false }

    // Сортировка по дате (от старых к новым)
    const sortedHistory = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const oldestWeight = sortedHistory[0].weight
    const latestWeight = sortedHistory[sortedHistory.length - 1].weight

    const change = latestWeight - oldestWeight
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
    }
  }

  // Расчет среднего изменения веса в неделю
  const calculateWeeklyChange = () => {
    const weightHistory = userProfile.weightHistory || []
    if (weightHistory.length < 2) return { value: 0, isPositive: false }

    // Сортировка по дате (от старых к новым)
    const sortedHistory = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const oldestEntry = sortedHistory[0]
    const latestEntry = sortedHistory[sortedHistory.length - 1]

    const oldestDate = new Date(oldestEntry.date)
    const latestDate = new Date(latestEntry.date)

    // Разница в днях
    const daysDiff = Math.max(1, Math.round((latestDate - oldestDate) / (1000 * 60 * 60 * 24)))

    // Разница в весе
    const weightDiff = latestEntry.weight - oldestEntry.weight

    // Среднее изменение в неделю
    const weeklyChange = (weightDiff / daysDiff) * 7

    return {
      value: Math.abs(weeklyChange).toFixed(1),
      isPositive: weeklyChange > 0,
    }
  }

  const weightChange = calculateWeightChange()
  const weeklyChange = calculateWeeklyChange()
  const weightHistory = userProfile.weightHistory || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Отслеживание веса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="weight-date">Дата</Label>
                  <Input id="weight-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="weight-value">Вес (кг)</Label>
                  <Input
                    id="weight-value"
                    type="number"
                    step="0.1"
                    placeholder="Введите ваш вес"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddWeight} className="w-full">
                Добавить запись
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Статистика</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Текущий вес:</span>
                  <span className="font-medium">{userProfile.weight} кг</span>
                </div>
                {weightHistory.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Начальный вес:</span>
                      <span className="font-medium">
                        {userProfile.initialWeight || weightHistory[weightHistory.length - 1].weight} кг
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Изменение:</span>
                      <span className={`font-medium ${weightChange.isPositive ? "text-red-500" : "text-green-500"}`}>
                        {weightChange.isPositive ? "+" : "-"}
                        {weightChange.value} кг
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">В среднем за неделю:</span>
                      <span className={`font-medium ${weeklyChange.isPositive ? "text-red-500" : "text-green-500"}`}>
                        {weeklyChange.isPositive ? "+" : "-"}
                        {weeklyChange.value} кг/нед
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {weightHistory.length > 0 ? (
            <div className="mt-6 border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Вес (кг)</TableHead>
                    <TableHead>Изменение</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weightHistory.map((entry, index) => {
                    // Расчет изменения веса по сравнению с предыдущей записью
                    let change = null
                    if (index < weightHistory.length - 1) {
                      change = entry.weight - weightHistory[index + 1].weight
                    }

                    return (
                      <TableRow key={entry.date}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.weight} кг</TableCell>
                        <TableCell>
                          {change !== null && (
                            <span className={change > 0 ? "text-red-500" : change < 0 ? "text-green-500" : ""}>
                              {change > 0 ? "+" : ""}
                              {change.toFixed(1)} кг
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteWeight(entry.date)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-6 text-center py-8 border rounded-md">
              <p className="text-muted-foreground">У вас пока нет записей веса</p>
              <p className="text-sm text-muted-foreground">Добавьте первую запись, чтобы начать отслеживание</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
