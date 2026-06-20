import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type DefaultValues } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

import {
  EQUIPMENT_VALUES,
  EXPERIENCE_VALUES,
  PRIMARY_GOAL_VALUES,
  PROFILE_LABELS,
  SEX_VALUES,
  profileSchema,
  type Profile,
} from '../profile.schema'

const EMPTY_DEFAULTS: DefaultValues<Profile> = {
  age: undefined,
  sex: undefined,
  heightCm: undefined,
  weightKg: undefined,
  bodyFatPct: undefined,
  primaryGoal: undefined,
  experienceLevel: undefined,
  trainingDaysPerWeek: undefined,
  equipment: [],
  limitationsOrInjuries: [],
  currentDietStyle: undefined,
}

interface ProfileFormProps {
  /** Existing profile to edit; omit/null for a fresh form. */
  defaultValues?: Profile | null
  onSubmit: (profile: Profile) => void
  submitLabel?: string
  isSubmitting?: boolean
  /** Optional cancel action (e.g. close modal). Hidden when not provided. */
  onCancel?: () => void
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save profile',
  isSubmitting = false,
  onCancel,
}: ProfileFormProps) {
  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      limitationsOrInjuries: values.limitationsOrInjuries
        .map((line) => line.trim())
        .filter(Boolean),
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="30"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEX_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PROFILE_LABELS.sex[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="heightCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="178"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="78"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bodyFatPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body fat %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="15"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary goal</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIMARY_GOAL_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PROFILE_LABELS.primaryGoal[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPERIENCE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PROFILE_LABELS.experienceLevel[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="trainingDaysPerWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training days per week</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={7}
                  placeholder="4"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? undefined : e.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available equipment</FormLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EQUIPMENT_VALUES.map((value) => {
                  const checked = field.value?.includes(value) ?? false
                  return (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-lg border border-input px-2.5 py-2 text-sm transition-colors select-none',
                        checked && 'border-primary bg-primary/5',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          const current = field.value ?? []
                          field.onChange(
                            isChecked
                              ? [...current, value]
                              : current.filter((item) => item !== value),
                          )
                        }}
                      />
                      {PROFILE_LABELS.equipment[value]}
                    </label>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="limitationsOrInjuries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limitations or injuries</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={'e.g. Left shoulder impingement\nLower back sensitivity'}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={(field.value ?? []).join('\n')}
                  onChange={(e) => field.onChange(e.target.value.split('\n'))}
                />
              </FormControl>
              <FormDescription>One per line — optional.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentDietStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current diet style</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. High-protein, mostly home-cooked"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : e.target.value)
                  }
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
