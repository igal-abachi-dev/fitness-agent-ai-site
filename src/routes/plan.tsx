import {
  Activity,
  Beef,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  Droplets,
  Flame,
  Loader2,
  Pencil,
  Scale,
  ShieldAlert,
  Sparkles,
  Wheat,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useGenerateCoachPlan,
  type CoachPlanError,
  type CoachPlanResponse,
} from '@/features/coach'
import {
  PROFILE_LABELS,
  useOpenProfileModal,
  useProfile,
  type Profile,
} from '@/features/profile'
import { ApiError } from '@/lib/api/http'
import { cn } from '@/lib/utils'

type WeeklyDay = CoachPlanResponse['trainingProgram']['weeklyLayout'][number]
type Exercise = WeeklyDay['exercises'][number]

function ReasoningSection({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 rounded-md text-xs transition-colors">
        <Sparkles className="size-3.5" />
        <span>{open ? 'Hide reasoning' : 'Show reasoning'}</span>
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="bg-muted/50 text-muted-foreground rounded-lg border px-3 py-2.5 text-xs whitespace-pre-wrap">
          {text}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function PlanMetadata({ data }: { data: CoachPlanResponse }) {
  const usageParts: string[] = []

  if (data.reasoningTokens != null) {
    usageParts.push(`${data.reasoningTokens} reasoning tokens`)
  }

  if (usageParts.length === 0) return null

  return (
    <p className="text-muted-foreground text-xs">{usageParts.join(' · ')}</p>
  )
}

function TextSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  )
}

function PlanSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function MacroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="bg-muted/40 flex flex-col gap-1.5 rounded-lg border px-3 py-2.5">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className="size-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function PlanLoading({ dayCount }: { dayCount: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-muted-foreground">Building your plan…</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-8 w-64 rounded-lg" />
      <div className="flex flex-col gap-6">
        {Array.from({ length: dayCount }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <div className="bg-muted/30 flex flex-col gap-1.5 rounded-lg border px-3 py-2.5">
      <p className="text-sm font-medium">{exercise.name}</p>
      <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums">
        <span>{exercise.sets} sets</span>
        <span>{exercise.reps} reps</span>
        <span>RIR {exercise.rirTarget}</span>
        <span>{exercise.restSeconds}s rest</span>
      </div>
      {exercise.coachingCue && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {exercise.coachingCue}
        </p>
      )}
    </div>
  )
}

function TrainingDayPanel({ day }: { day: WeeklyDay }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold">
        Day {day.dayNumber} — {day.focus}
      </h4>
      <div className="flex flex-col gap-2">
        {day.exercises.map((exercise, index) => (
          <ExerciseRow key={index} exercise={exercise} />
        ))}
      </div>
    </div>
  )
}

function PlanView({ plan }: { plan: CoachPlanResponse }) {
  const {
    physiologicalProfile,
    periodizedNutrition,
    trainingProgram,
    gymnasticsAndSkillWork,
    evidenceCitations,
    safetyNotes,
    reasoningText,
    reasoningTokens,
  } = plan
  const macros = periodizedNutrition.macronutrientTargets

  return (
    <div className="select-text flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold leading-snug">
          {trainingProgram.splitName}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {trainingProgram.frequencyRationale}
        </p>
      </div>

      <Separator />

      <PlanSection title="Training">
        <div className="flex flex-col gap-6">
          {trainingProgram.weeklyLayout.map((day) => (
            <TrainingDayPanel key={day.dayNumber} day={day} />
          ))}
        </div>
      </PlanSection>

      <Separator />

      <PlanSection title="Nutrition">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MacroStat
              icon={Activity}
              label="Est. TDEE"
              value={`${physiologicalProfile.estimatedTdee} kcal`}
            />
            <MacroStat
              icon={Flame}
              label="Target calories"
              value={`${macros.calories} kcal`}
            />
            <MacroStat
              icon={Beef}
              label="Protein"
              value={`${macros.proteinGrams} g`}
            />
            <MacroStat
              icon={Wheat}
              label="Carbs"
              value={`${macros.carbohydratesGrams} g`}
            />
            <MacroStat
              icon={Droplets}
              label="Fats"
              value={`${macros.fatsGrams} g`}
            />
            <MacroStat
              icon={Scale}
              label="Lean mass"
              value={
                physiologicalProfile.leanBodyMassKg != null
                  ? `${physiologicalProfile.leanBodyMassKg} kg`
                  : 'Not calculated'
              }
            />
          </div>

          <TextSection
            label="Biomechanical observations"
            text={physiologicalProfile.biomechanicalObservations}
          />

          <TextSection
            label="Diet philosophy"
            text={periodizedNutrition.generalStanceOnNamedDiets}
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Peri-workout nutrition</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="bg-muted/30 rounded-lg border px-3 py-2.5">
                <p className="text-muted-foreground mb-1 text-xs">Pre-workout</p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {periodizedNutrition.periWorkoutProtocol.preWorkoutMeal}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg border px-3 py-2.5">
                <p className="text-muted-foreground mb-1 text-xs">Intra-workout</p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {
                    periodizedNutrition.periWorkoutProtocol
                      .intraWorkoutHydrationAndNutrition
                  }
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg border px-3 py-2.5">
                <p className="text-muted-foreground mb-1 text-xs">Post-workout</p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {periodizedNutrition.periWorkoutProtocol.postWorkoutMeal}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg border px-3 py-2.5">
            <p className="text-muted-foreground mb-1 text-xs">Rest days</p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">
              {periodizedNutrition.nonTrainingDayAdjustments}
            </p>
          </div>
        </div>
      </PlanSection>

      <Separator />

      <PlanSection title="Gymnastics & skill work">
        {gymnasticsAndSkillWork ? (
          <div className="flex flex-col gap-3">
            <div className="bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground mb-1 text-xs">Straight-arm prep</p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {gymnasticsAndSkillWork.straightArmPrep}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg border px-3 py-2.5">
              <p className="text-muted-foreground mb-1 text-xs">Progressions</p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {gymnasticsAndSkillWork.progressionAdvice}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">None included in this plan.</p>
        )}
      </PlanSection>

      <Separator />

      <PlanSection title="Evidence & sources">
        {evidenceCitations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {evidenceCitations.map((citation, index) => (
              <div
                key={index}
                className="bg-muted/30 rounded-lg border px-3 py-2.5"
              >
                <p className="text-sm font-medium">{citation.topic}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed whitespace-pre-wrap">
                  {citation.scientificMechanism}
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {citation.leadingReference}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No citations returned.</p>
        )}
      </PlanSection>

      <Separator />

      <PlanSection title="Safety notes">
        {safetyNotes.length > 0 ? (
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {safetyNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No safety flags raised.</p>
        )}
      </PlanSection>

      {(reasoningText || reasoningTokens != null) && (
        <>
          <Separator />
          <div className="flex items-start gap-3">
            <Avatar size="sm" className="mt-0.5">
              <AvatarFallback>
                <Sparkles className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col gap-3 rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
              {reasoningText && <ReasoningSection text={reasoningText} />}
              <PlanMetadata data={plan} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProfileSummary({
  profile,
  onEdit,
}: {
  profile: Profile
  onEdit: () => void
}) {
  const facts = [
    `${profile.age} yrs`,
    PROFILE_LABELS.sex[profile.sex],
    `${profile.heightCm} cm`,
    `${profile.weightKg} kg`,
    PROFILE_LABELS.primaryGoal[profile.primaryGoal],
    PROFILE_LABELS.experienceLevel[profile.experienceLevel],
    `${profile.trainingDaysPerWeek} days/wk`,
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your profile</CardTitle>
        <CardDescription>{facts.join(' · ')}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {profile.equipment.map((item) => (
          <Badge key={item} variant="secondary">
            {PROFILE_LABELS.equipment[item]}
          </Badge>
        ))}
      </CardContent>
    </Card>
  )
}

/** Structured plan generation (`POST /v1/coach/plan`) from the saved profile. */
export function Component() {
  const profile = useProfile()
  const openProfileModal = useOpenProfileModal()
  const plan = useGenerateCoachPlan()
  const planRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (plan.isPending && planRef.current) {
      planRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [plan.isPending])

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
        <ClipboardList className="text-muted-foreground size-10" />
        <h1 className="text-2xl font-semibold">Build a plan</h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          Your profile is the assessment used to generate a plan. Set it up once
          and you can regenerate anytime.
        </p>
        <Button onClick={openProfileModal}>Set up your profile</Button>
      </div>
    )
  }

  const planError = plan.error instanceof ApiError ? plan.error : null
  const issues =
    planError?.status === 502
      ? (planError.body as CoachPlanError).issues
      : null

  const showPlanArea = plan.isPending || plan.data != null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ClipboardList className="size-6" />
          Build a plan
        </h1>
        <p className="text-muted-foreground text-sm">
          Generated from your saved profile via a server-side safety pipeline.
        </p>
      </header>

      <ProfileSummary profile={profile} onEdit={openProfileModal} />

      <div className="flex justify-end">
        <Button onClick={() => plan.mutate(profile)} disabled={plan.isPending}>
          {plan.isPending && <Loader2 className="size-4 animate-spin" />}
          {plan.isPending
            ? 'Generating…'
            : plan.data
              ? 'Regenerate plan'
              : 'Generate plan'}
        </Button>
      </div>

      {plan.isError && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Could not generate plan</AlertTitle>
          <AlertDescription>
            <p>{planError?.message ?? plan.error.message}</p>
            {issues && (
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!showPlanArea && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Dumbbell className="text-muted-foreground size-10" />
            <p className="text-muted-foreground max-w-sm text-sm">
              Your profile is ready. Generate a personalized training and nutrition
              plan tailored to your goals and equipment.
            </p>
          </CardContent>
        </Card>
      )}

      {showPlanArea && (
        <div ref={planRef} className="flex flex-col gap-4">
          {(plan.isPending || plan.data) && <Separator />}
          {plan.isPending ? (
            <PlanLoading dayCount={profile.trainingDaysPerWeek} />
          ) : plan.data ? (
            <PlanView plan={plan.data} />
          ) : null}
        </div>
      )}
    </div>
  )
}
