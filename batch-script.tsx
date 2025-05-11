"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileCode, Copy, Check } from "lucide-react"

export default function BatchScriptGenerator() {
  const [copied, setCopied] = useState(false)

  const windowsBatchScript = `@echo off
echo ===================================
echo FitTrack Pro - Установка приложения
echo ===================================
echo.

echo Проверка наличия .NET Runtime...
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
  echo .NET Runtime не найден. Установка необходимых компонентов...
  start https://dotnet.microsoft.com/download/dotnet/7.0/runtime
  echo Пожалуйста, установите .NET Desktop Runtime и перезапустите установку.
  pause
  exit
)

echo .NET Runtime найден.
echo.

echo Распаковка файлов приложения...
if not exist "%LOCALAPPDATA%\\FitTrackPro" mkdir "%LOCALAPPDATA%\\FitTrackPro"
xcopy /E /Y "app\\*" "%LOCALAPPDATA%\\FitTrackPro\\"

echo Создание ярлыка на рабочем столе...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%userprofile%\\Desktop\\FitTrack Pro.lnk');$s.TargetPath='%LOCALAPPDATA%\\FitTrackPro\\FitTrackPro.exe';$s.Save()"

echo Регистрация приложения...
reg add "HKCU\\Software\\FitTrackPro" /v "InstallPath" /t REG_SZ /d "%LOCALAPPDATA%\\FitTrackPro" /f

echo.
echo Установка завершена успешно!
echo Запустите приложение с рабочего стола или из меню Пуск.
echo.

pause`

  const handleCopy = () => {
    navigator.clipboard.writeText(windowsBatchScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-500" />
            Пакетный файл для быстрой установки (Windows)
          </h3>
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Скопировано
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Копировать
              </>
            )}
          </Button>
        </div>

        <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
          <pre>{windowsBatchScript}</pre>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Сохраните этот скрипт как <code className="bg-gray-100 px-1 rounded">install.bat</code> и поместите его в
          корневую папку с вашим приложением. Пользователи смогут запустить его для быстрой установки приложения.
        </p>
      </CardContent>
    </Card>
  )
}
