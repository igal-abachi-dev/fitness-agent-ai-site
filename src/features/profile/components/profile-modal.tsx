import { useEffect } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useCloseProfileModal,
  useOpenProfileModal,
  useProfile,
  useProfileModalOpen,
  useSetProfile,
} from '@/stores/useAppStore'

import { ProfileForm } from './profile-form'

/**
 * Profile modal, mounted once at the app shell.
 *
 * - First visit (no stored profile): opens automatically and is *blocking* —
 *   no close button, and escape / outside-click are ignored until saved.
 * - Later: opened via the "Edit profile" control; dismissable as normal.
 *
 * Persistence happens in the store (localStorage), so saving once is enough.
 */
export function ProfileModal() {
  const profile = useProfile()
  const isOpen = useProfileModalOpen()
  const openModal = useOpenProfileModal()
  const closeModal = useCloseProfileModal()
  const setProfile = useSetProfile()

  const hasProfile = profile !== null
  const blocking = !hasProfile

  useEffect(() => {
    if (!hasProfile) openModal()
  }, [hasProfile, openModal])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !blocking) closeModal()
      }}
    >
      <DialogContent
        showCloseButton={!blocking}
        className="max-h-[90svh] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(event) => {
          if (blocking) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (blocking) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {hasProfile ? 'Edit your profile' : 'Tell us about yourself'}
          </DialogTitle>
          <DialogDescription>
            {hasProfile
              ? 'Update the details the coach uses to tailor your plans and answers.'
              : 'The coach uses this to personalize plans and answers. You only set it once — you can change it anytime.'}
          </DialogDescription>
        </DialogHeader>

        <ProfileForm
          defaultValues={profile}
          submitLabel={hasProfile ? 'Save changes' : 'Save profile'}
          onCancel={blocking ? undefined : closeModal}
          onSubmit={(next) => {
            setProfile(next)
            closeModal()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
