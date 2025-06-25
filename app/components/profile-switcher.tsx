"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, ChevronDown, Trash2, UserPlus, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ProfileSwitcher({
  profiles,
  currentProfileId,
  onSwitchProfile,
  onCreateProfile,
  onDeleteProfile,
}) {
  const [newProfileName, setNewProfileName] = useState("")
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState(null)

  const currentProfile = profiles.find((p) => p.id === currentProfileId) || profiles[0]

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) {
      toast({
        title: "Ошибка",
        description: "Имя профиля не может быть пустым",
        variant: "destructive",
      })
      return
    }

    onCreateProfile(newProfileName)
    setNewProfileName("")
    setShowNewProfileDialog(false)

    toast({
      title: "Профиль создан",
      description: `Профиль "${newProfileName}" успешно создан`,
    })
  }

  const confirmDeleteProfile = (profile) => {
    setProfileToDelete(profile)
    setShowDeleteConfirmation(true)
  }

  const handleDeleteProfile = () => {
    if (!profileToDelete) return

    onDeleteProfile(profileToDelete.id)
    setShowDeleteConfirmation(false)
    setProfileToDelete(null)

    toast({
      title: "Профиль удален",
      description: `Профиль "${profileToDelete.name}" успешно удален`,
      variant: "destructive",
    })
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentProfile?.avatar || ""} alt={currentProfile?.name} />
                <AvatarFallback className="text-xs">
                  {currentProfile?.name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{currentProfile?.name || "Выберите профиль"}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Профили</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => onSwitchProfile(profile.id)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile.avatar || ""} alt={profile.name} />
                  <AvatarFallback className="text-xs">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{profile.name}</span>
              </div>
              {profile.id === currentProfileId && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowNewProfileDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>Создать профиль</span>
          </DropdownMenuItem>
          {profiles.length > 1 && currentProfile && (
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive cursor-pointer"
              onClick={() => confirmDeleteProfile(currentProfile)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Удалить профиль</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Диалог создания нового профиля */}
      <Dialog open={showNewProfileDialog} onOpenChange={setShowNewProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый профиль</DialogTitle>
            <DialogDescription>Введите имя для нового профиля</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя профиля</Label>
              <Input
                id="name"
                placeholder="Введите имя"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProfileDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateProfile}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления профиля */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить профиль</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить профиль "{profileToDelete?.name}"? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
