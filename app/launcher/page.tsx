"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, FileDown, FileUp, Package, Archive } from "lucide-react"
import BatchScriptGenerator from "../../batch-script"

export default function LaunchFilesGuide() {
  const [activeTab, setActiveTab] = useState("windows")

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-green-600">
            <Package className="h-8 w-8" />
            Создание запускных файлов FitTrack Pro
          </h1>
          <p className="text-slate-500">Инструкции по созданию установочных файлов для Windows и Android</p>
        </header>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === "windows" ? "default" : "outline"}
              onClick={() => setActiveTab("windows")}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Windows (.exe)
            </Button>
            <Button
              variant={activeTab === "android" ? "default" : "outline"}
              onClick={() => setActiveTab("android")}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Android (.apk)
            </Button>
          </div>

          {activeTab === "windows" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Создание установщика для Windows</h2>

              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-500" />
                    Предварительные требования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Visual Studio 2022 с рабочей нагрузкой .NET MAUI</li>
                    <li>Windows 10/11</li>
                    <li>Проект .NET MAUI с вашим приложением</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Шаги для создания .exe файла:</h3>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">1. Настройка проекта для публикации</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Откройте ваш проект в Visual Studio и выполните следующие шаги:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Щелкните правой кнопкой мыши на проекте в Solution Explorer</li>
                    <li>Выберите "Свойства"</li>
                    <li>Перейдите на вкладку "Публикация"</li>
                    <li>Нажмите "Создать профиль публикации"</li>
                    <li>Выберите "Папка" как цель публикации</li>
                    <li>Выберите папку для сохранения файлов</li>
                    <li>Нажмите "Готово"</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">2. Настройка параметров сборки</h4>
                  <p className="text-sm text-gray-700 mb-2">Настройте параметры сборки для Windows:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>В свойствах проекта перейдите на вкладку "Сборка"</li>
                    <li>Выберите конфигурацию "Release"</li>
                    <li>Выберите платформу "Windows"</li>
                    <li>Убедитесь, что выбран "x64" или "Any CPU" в качестве целевой архитектуры</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">3. Создание установщика Windows</h4>
                  <p className="text-sm text-gray-700 mb-2">Для создания полноценного установщика:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>В меню выберите "Сборка" {"->"} "Опубликовать [Имя вашего проекта]"</li>
                    <li>Нажмите "Опубликовать" в открывшемся окне</li>
                    <li>После завершения публикации перейдите в указанную папку</li>
                    <li>Вы найдете там файл .msix (пакет установки Windows) или папку с .exe файлом</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">4. Создание автономного исполняемого файла</h4>
                  <p className="text-sm text-gray-700 mb-2">Для создания единого .exe файла:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Откройте командную строку разработчика Visual Studio</li>
                    <li>Перейдите в папку с вашим проектом</li>
                    <li>Выполните команду:</li>
                    <li>
                      <code className="bg-gray-200 px-2 py-1 rounded">
                        dotnet publish -f net7.0-windows10.0.19041.0 -c Release -p:WindowsPackageType=None
                        -p:RuntimeIdentifier=win-x64 --self-contained true
                      </code>
                    </li>
                    <li>
                      Исполняемый файл будет создан в папке bin\Release\net7.0-windows10.0.19041.0\win-x64\publish
                    </li>
                  </ol>
                </div>
              </div>

              <BatchScriptGenerator />
            </div>
          )}

          {activeTab === "android" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Создание APK для Android</h2>

              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-500" />
                    Предварительные требования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Visual Studio 2022 с рабочей нагрузкой .NET MAUI</li>
                    <li>Android SDK (устанавливается с Visual Studio)</li>
                    <li>Проект .NET MAUI с вашим приложением</li>
                    <li>Ключ подписи для Android (для релизной версии)</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Шаги для создания .apk файла:</h3>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">1. Создание ключа подписи (если его нет)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Для публикации в Google Play или установки на устройства:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Откройте командную строку</li>
                    <li>
                      Перейдите в папку, где установлен JDK (обычно C:\Program
                      Files\Android\jdk\microsoft_dist_openjdk_[version]\bin)
                    </li>
                    <li>Выполните команду:</li>
                    <li>
                      <code className="bg-gray-200 px-2 py-1 rounded">
                        keytool -genkey -v -keystore myapp.keystore -alias myapp -keyalg RSA -keysize 2048 -validity
                        10000
                      </code>
                    </li>
                    <li>Следуйте инструкциям для создания ключа</li>
                    <li>Сохраните keystore файл и пароль в надежном месте</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">2. Настройка подписи приложения</h4>
                  <p className="text-sm text-gray-700 mb-2">Настройте подпись APK в проекте:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Щелкните правой кнопкой мыши на проекте в Solution Explorer</li>
                    <li>Выберите "Свойства"</li>
                    <li>Перейдите на вкладку "Android Manifest"</li>
                    <li>В разделе "Package" настройте имя пакета (например, com.yourcompany.fittrackpro)</li>
                    <li>Перейдите на вкладку "Android Options"</li>
                    <li>В разделе "Packaging" выберите "Sign the .APK file using the following keystore"</li>
                    <li>Укажите путь к вашему keystore файлу и введите пароль</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">3. Создание APK файла</h4>
                  <p className="text-sm text-gray-700 mb-2">Для создания APK файла:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>В Visual Studio выберите конфигурацию "Release" в выпадающем меню</li>
                    <li>Выберите "Android" в качестве целевой платформы</li>
                    <li>В меню выберите "Сборка" {"->"} "Архивировать для публикации"</li>
                    <li>В открывшемся окне "Archive Manager" выберите созданный архив</li>
                    <li>Нажмите "Distribute"</li>
                    <li>Выберите "Ad Hoc" для создания APK файла</li>
                    <li>Следуйте инструкциям мастера</li>
                    <li>Выберите папку для сохранения APK файла</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">4. Альтернативный способ через командную строку</h4>
                  <p className="text-sm text-gray-700 mb-2">Для создания APK через командную строку:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Откройте командную строку разработчика Visual Studio</li>
                    <li>Перейдите в папку с вашим проектом</li>
                    <li>Выполните команду:</li>
                    <li>
                      <code className="bg-gray-200 px-2 py-1 rounded">dotnet publish -f net7.0-android -c Release</code>
                    </li>
                    <li>APK файл будет создан в папке bin\Release\net7.0-android\[arch]\publish</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Распространение приложения</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-blue-500" />
                  Распространение для Windows
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">После создания установщика Windows (.msix или .exe):</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Загрузите его на ваш веб-сайт для скачивания</li>
                  <li>Опубликуйте в Microsoft Store (требуется аккаунт разработчика)</li>
                  <li>Используйте сервисы распространения программного обеспечения</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-green-500" />
                  Распространение для Android
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">После создания APK файла:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Опубликуйте в Google Play Store (требуется аккаунт разработчика)</li>
                  <li>Загрузите на ваш веб-сайт для прямого скачивания</li>
                  <li>Используйте альтернативные магазины приложений</li>
                  <li>Отправьте APK файл пользователям для ручной установки</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
