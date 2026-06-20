import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfileForm } from './profile-form'

describe('ProfileForm (RHF + Zod)', () => {
  it('blocks submit and shows validation errors when empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProfileForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(await screen.findByText('Age is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
