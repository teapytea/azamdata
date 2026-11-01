"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowUpRight01Icon,
  BubbleChatIcon,
  DiscordIcon,
  Mail01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import { cn } from "@/lib/utils"
import { LogoIcon } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { enterItem, staggerContainer, inView } from "@/lib/motion"

type ChatSender = "user" | "team"

type ChatMessageData = {
  id: string
  sender: ChatSender
  time: string
  text: string
  reaction?: boolean
}

const chatMessages: ChatMessageData[] = [
  {
    id: "1",
    sender: "user",
    time: "10:31 AM",
    text: "I need help theming my components",
  },
  {
    id: "2",
    sender: "team",
    time: "10:31 AM",
    text: "Sure! Are you using our Figma UI kit or React code?",
  },
  {
    id: "3",
    sender: "user",
    time: "10:32 AM",
    text: "Both actually, I love the workflow! 🔥",
  },
  {
    id: "4",
    sender: "team",
    time: "10:32 AM",
    text: "Great taste 😄 Let me walk you through it",
  },
  {
    id: "5",
    sender: "user",
    time: "10:33 AM",
    text: "Thanks, you're the best! 🙌",
    reaction: true,
  },
]

const USER_TYPING_MS = 900
const TEAM_TYPING_MS = 1400
const PAUSE_AFTER_REVEAL_MS = 500
const REACTION_DELAY_MS = 400

const messageEnter = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(2px)" },
  transition: { duration: 0.4, ease: [0, 0.55, 0.45, 1] as const },
}

const typingEnter = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(2px)" },
  transition: { duration: 0.15, ease: "easeIn" as const },
}

function useChatReveal({
  reduced,
  enabled,
}: {
  reduced: boolean
  enabled: boolean
}) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [typingSender, setTypingSender] = useState<ChatSender | null>(null)
  const [showReaction, setShowReaction] = useState(false)

  useEffect(() => {
    if (!enabled) return

    if (reduced) {
      setRevealedCount(chatMessages.length)
      setShowReaction(true)
      return
    }

    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) fn()
        }, ms)
      )
    }

    let index = 0

    const playNext = () => {
      if (cancelled || index >= chatMessages.length) {
        if (!cancelled && index >= chatMessages.length) {
          schedule(() => setShowReaction(true), REACTION_DELAY_MS)
        }
        return
      }

      const msg = chatMessages[index]
      const typingDuration =
        msg.sender === "user" ? USER_TYPING_MS : TEAM_TYPING_MS

      setTypingSender(msg.sender)

      schedule(() => {
        setTypingSender(null)
        setRevealedCount(index + 1)
        index += 1

        schedule(playNext, PAUSE_AFTER_REVEAL_MS)
      }, typingDuration)
    }

    playNext()

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [enabled, reduced])

  return { revealedCount, typingSender, showReaction }
}

function TeamAvatar() {
  return (
    <div className="relative size-6">
      <LogoIcon className="size-full rounded-full border bg-neutral-950 p-1" />
      <span className="absolute bottom-0 right-0 size-1.5 rounded-full bg-emerald-500 ring-1 ring-background" />
    </div>
  )
}

function TypingDots({ variant }: { variant: ChatSender }) {
  const dotClass =
    variant === "user"
      ? "bg-white/80 dark:bg-neutral-950/60"
      : "bg-muted-foreground/50"

  return (
    <span className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("size-1.5 rounded-full", dotClass)}
          style={{
            animation: "chat-dot-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </span>
  )
}

function ChatTypingIndicator({ sender }: { sender: ChatSender }) {
  const isUser = sender === "user"

  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}
      {...typingEnter}
    >
      {!isUser && (
        <div className="flex items-center gap-2 text-caption">
          <TeamAvatar />
          <span className="font-semibold text-foreground/80">Faiz UI</span>
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 shadow-xs",
          isUser
            ? "rounded-tr-none bg-neutral-900 dark:bg-white"
            : "rounded-tl-none border border-neutral-200/40 bg-white dark:border-neutral-700/50 dark:bg-neutral-800"
        )}
      >
        <TypingDots variant={sender} />
      </div>
    </motion.div>
  )
}

function HeartReaction({
  clicked,
  onToggle,
}: {
  clicked: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      className={cn(
        "absolute -bottom-1.5 right-3 flex items-center gap-0.5 rounded-full border px-1.5 py-px text-[10px] leading-none shadow-xs select-none cursor-pointer",
        "before:pointer-events-none before:absolute before:inset-0 before:-m-2.5 before:min-h-10 before:min-w-10",
        "transition-[background-color,border-color,color] duration-150 active:scale-[0.96]",
        clicked
          ? "border-red-200/80 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30"
          : "border-neutral-200/80 bg-background text-muted-foreground hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
      )}
      title="Like message"
    >
      <span className="text-[11px] leading-none">❤️</span>
      <span
        className={cn(
          "tabular-nums text-[10px] font-medium leading-none",
          clicked ? "text-red-600" : "text-muted-foreground"
        )}
      >
        {clicked ? 2 : 1}
      </span>
    </motion.button>
  )
}

function ChatMessage({
  message,
  showReaction,
  heartClicked,
  onHeartToggle,
}: {
  message: ChatMessageData
  showReaction: boolean
  heartClicked: boolean
  onHeartToggle: () => void
}) {
  const isUser = message.sender === "user"

  return (
    <motion.div
      layout
      className={cn(
        "relative flex flex-col gap-1",
        isUser ? "items-end" : "items-start",
        message.reaction && "pb-2"
      )}
      {...messageEnter}
    >
      <div className="flex items-center gap-2 text-caption">
        {!isUser && <TeamAvatar />}
        <span className="font-semibold text-foreground/80">
          {isUser ? "You" : "Faiz UI"}
        </span>
        <span>{message.time}</span>
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-body shadow-xs",
          isUser
            ? "rounded-tr-none bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
            : "rounded-tl-none border border-neutral-200/40 bg-white text-foreground dark:border-neutral-700/50 dark:bg-neutral-800"
        )}
      >
        {message.text}
      </div>
      {message.reaction && showReaction && (
        <HeartReaction clicked={heartClicked} onToggle={onHeartToggle} />
      )}
    </motion.div>
  )
}

function SupportChatMockup({ reduced }: { reduced: boolean }) {
  const chatRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(chatRef, { once: true, amount: 0.4 })
  const [heartClicked, setHeartClicked] = useState(false)
  const { revealedCount, typingSender, showReaction } = useChatReveal({
    reduced,
    enabled: isInView,
  })

  const revealedMessages = chatMessages.slice(0, revealedCount)

  return (
    <Card className="relative flex min-h-[440px] w-full flex-col justify-center gap-6 overflow-hidden border bg-linear-to-b from-card to-muted/10 p-6 shadow-sm sm:p-8">
      <style>{`
        @keyframes chat-dot-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.025] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] dark:opacity-[0.045]">
        <div className="grid rotate-12 scale-110 grid-cols-6 gap-x-12 gap-y-16">
          {Array.from({ length: 42 }).map((_, i) => (
            <LogoIcon key={i} className="size-10" />
          ))}
        </div>
      </div>

      <div
        ref={chatRef}
        className="relative z-10 flex min-h-[320px] flex-col gap-5"
      >
        <AnimatePresence initial={false}>
          {revealedMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              showReaction={showReaction}
              heartClicked={heartClicked}
              onHeartToggle={() => setHeartClicked((prev) => !prev)}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {typingSender ? (
            <ChatTypingIndicator key="typing" sender={typingSender} />
          ) : null}
        </AnimatePresence>
      </div>
    </Card>
  )
}

export function SupportSection() {
  const reduced = useReducedMotion() ?? false

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <div className="mb-12 flex flex-col items-center justify-center gap-3 text-center md:mb-16">
        <h2 className="text-display text-foreground">
          Real support from the
          <br />
          team behind Faiz UI
        </h2>
        <p className="text-lead text-muted-foreground max-w-2xl">
          Get help within 24 hours from the people who build and maintain the
          system.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8"
        variants={staggerContainer(reduced)}
        {...inView}
      >
        <motion.div className="flex lg:col-span-7" variants={enterItem(reduced)}>
          <SupportChatMockup reduced={reduced} />
        </motion.div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <motion.div variants={enterItem(reduced)} className="flex flex-1">
            <Card className="relative flex w-full flex-col justify-between gap-4 border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      strokeWidth={2}
                      className="size-5"
                    />
                  </div>
                  <h3 className="text-subtitle font-semibold text-foreground">
                    Email
                  </h3>
                </div>
                <p className="text-body text-muted-foreground">
                  Prefer a direct line? Send us a message and we'll get back to
                  you as soon as possible.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5"
                  render={<a href="mailto:support@faizui.com" />}
                >
                  Contact
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={enterItem(reduced)} className="flex flex-1">
            <Card className="relative flex w-full flex-col justify-between gap-4 border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                    <HugeiconsIcon
                      icon={DiscordIcon}
                      strokeWidth={2}
                      className="size-5"
                    />
                  </div>
                  <h3 className="text-subtitle font-semibold text-foreground">
                    Discord
                  </h3>
                </div>
                <p className="text-body text-muted-foreground">
                  Get quick support, share feedback, or connect with other
                  builders.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5"
                  render={
                    <a
                      href="https://discord.gg/faizui"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Join
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    data-icon="inline-end"
                    strokeWidth={2}
                  />
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={enterItem(reduced)} className="flex flex-1">
            <Card className="relative flex w-full flex-col justify-between gap-4 border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                    <HugeiconsIcon
                      icon={BubbleChatIcon}
                      strokeWidth={2}
                      className="size-5"
                    />
                  </div>
                  <h3 className="text-subtitle font-semibold text-foreground">
                    Feedback
                  </h3>
                </div>
                <p className="text-body text-muted-foreground">
                  Got something to say about anything Faiz UI? We'd love to hear
                  it.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5"
                  render={<a href="/feedback" />}
                >
                  Send feedback
                  <HugeiconsIcon
                    icon={SentIcon}
                    data-icon="inline-end"
                    strokeWidth={2}
                  />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
