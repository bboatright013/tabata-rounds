'use client'
import { useState, useEffect, useRef } from "react"
import { Drawer } from '@/components'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

// Helper function for speech synthesis.
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  window.speechSynthesis.speak(utterance)
}

type Phase = "setup" | "work" | "rest"

export default function Timer() {
  // Timer settings stored as strings to allow empty fields.
  const [setupTime, setSetupTime] = useState<string>("5")
  const [workTime, setWorkTime] = useState<string>("20")
  const [restTime, setRestTime] = useState<string>("10")
  const [rounds, setRounds] = useState<string>("8")

  const [activeField, setActiveField] = useState<"setupTime" | "workTime" | "restTime" | "rounds" | null>(null)
  const [suppressFocus, setSuppressFocus] = useState<boolean>(false)

  // Timer state.
  const [phase, setPhase] = useState<Phase>("setup")
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [circuitComplete, setCircuitComplete] = useState<boolean>(false)

  // Refs for immediate updates.
  const currentTimeRef = useRef<number>(0)
  const phaseRef = useRef<Phase>("setup")
  const roundRef = useRef<number>(0)
  const announced10Ref = useRef<boolean>(false)
  const announcedCircuitCompleteRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // A ref to hold the actual numeric configuration once the timer starts.
  const configRef = useRef({
    setupTime: 0,
    workTime: 0,
    restTime: 0,
    rounds: 0,
  })

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // The tick function runs once per second.
  const tick = () => {
    if (currentTimeRef.current > 0) {
      currentTimeRef.current -= 1

      // In work phase: announce "10 Seconds left" when countdown hits 10.
      if (phaseRef.current === "work" && currentTimeRef.current === 10 && !announced10Ref.current) {
        speak("10 Seconds")
        announced10Ref.current = true
      }

      // In final round's rest phase: when remaining time equals 2, speak "Circuit Complete"
      if (
        phaseRef.current === "rest" &&
        roundRef.current === configRef.current.rounds &&
        !announcedCircuitCompleteRef.current
      ) {
        speak("Circuit Complete")
        announcedCircuitCompleteRef.current = true
      }

      setRemainingTime(currentTimeRef.current)
    } else {
      // When countdown reaches 0, transition to next phase.
      if (phaseRef.current === "setup") {
        // Setup complete → start first work phase.
        setPhase("work")
        phaseRef.current = "work"
        roundRef.current = 1
        setCurrentRound(1)
        speak("Round 1 Begin")
        currentTimeRef.current = configRef.current.workTime
        setRemainingTime(configRef.current.workTime)
        announced10Ref.current = false
      } else if (phaseRef.current === "work") {
        // End of work phase → announce "Time" and move to rest.
        speak("Time")
        setPhase("rest")
        phaseRef.current = "rest"
        currentTimeRef.current = configRef.current.restTime
        setRemainingTime(configRef.current.restTime)
      } else if (phaseRef.current === "rest") {
        // End of rest phase.
        if (roundRef.current < configRef.current.rounds) {
          // More rounds remain → start next work phase.
          const nextRound = roundRef.current + 1
          roundRef.current = nextRound
          setCurrentRound(nextRound)
          speak(`Round ${nextRound} Begin`)
          setPhase("work")
          phaseRef.current = "work"
          currentTimeRef.current = configRef.current.workTime
          setRemainingTime(configRef.current.workTime)
          announced10Ref.current = false
          announcedCircuitCompleteRef.current = false
        } else {
          // Final round completed → circuit is done.
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setIsRunning(false)
          setCircuitComplete(true)
        }
      }
    }
  }

  // Helper to parse the current input values, defaulting blank to 0.
  const getConfigValues = () => ({
    setupTime: setupTime === "" ? 0 : Number(setupTime),
    workTime: workTime === "" ? 0 : Number(workTime),
    restTime: restTime === "" ? 0 : Number(restTime),
    rounds: rounds === "" ? 0 : Number(rounds),
  })

  const startTimer = () => {
    if (isRunning) return

    // Update configRef with the latest settings.
    configRef.current = getConfigValues()

    setPhase("setup")
    phaseRef.current = "setup"
    roundRef.current = 0
    setCurrentRound(0)
    currentTimeRef.current = configRef.current.setupTime
    setRemainingTime(configRef.current.setupTime)
    setIsRunning(true)
    setCircuitComplete(false)
    announced10Ref.current = false
    announcedCircuitCompleteRef.current = false
    speak("Get Ready")
    intervalRef.current = setInterval(tick, 1000)
  }

  // Restart the current circuit from the beginning (keeping current settings).
  const restartCircuit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Update config in case settings have changed.
    configRef.current = getConfigValues()
    setCircuitComplete(false)
    setPhase("setup")
    phaseRef.current = "setup"
    roundRef.current = 0
    setCurrentRound(0)
    currentTimeRef.current = configRef.current.setupTime
    setRemainingTime(configRef.current.setupTime)
    announced10Ref.current = false
    announcedCircuitCompleteRef.current = false
    setIsRunning(true)
    speak("Get Ready")
    intervalRef.current = setInterval(tick, 1000)
  }

  // "New Circuit" resets all state and returns to settings.
  const newCircuit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setCircuitComplete(false)
    setPhase("setup")
    phaseRef.current = "setup"
    roundRef.current = 0
    setCurrentRound(0)
    currentTimeRef.current = 0
    setRemainingTime(0)
    announced10Ref.current = false
    announcedCircuitCompleteRef.current = false
  }

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsRunning(false)
    }
  }

  const resumeTimer = () => {
    if (!isRunning && remainingTime > 0) {
      setIsRunning(true)
      intervalRef.current = setInterval(tick, 1000)
    }
  }

  // Format seconds into MM:SS.
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Helper for onChange to handle empty string and prevent negatives.
  const handleInputChange = (value: string, setter: (val: string) => void) => {
    if (value === "") {
      setter("")
    } else {
      const num = Number(value)
      if (num < 0) {
        setter("0")
      } else {
        setter(value)
      }
    }
  }

  // Increment function for custom controls based on active field.
  const increment = () => {
    if (!activeField) return
    switch (activeField) {
      case "setupTime":
        setSetupTime(String(Number(setupTime || "0") + 1))
        break
      case "workTime":
        setWorkTime(String(Number(workTime || "0") + 1))
        break
      case "restTime":
        setRestTime(String(Number(restTime || "0") + 1))
        break
      case "rounds":
        setRounds(String(Number(rounds || "0") + 1))
        break
    }
  }

  // Decrement function for custom controls based on active field.
  const decrement = () => {
    if (!activeField) return
    switch (activeField) {
      case "setupTime":
        setSetupTime(String(Math.max(0, Number(setupTime || "0") - 1)))
        break
      case "workTime":
        setWorkTime(String(Math.max(0, Number(workTime || "0") - 1)))
        break
      case "restTime":
        setRestTime(String(Math.max(0, Number(restTime || "0") - 1)))
        break
      case "rounds":
        setRounds(String(Math.max(0, Number(rounds || "0") - 1)))
        break
    }
  }

  // Close handler for the drawer that also blurs the active element.
  const handleCloseDrawer = () => {
    setActiveField(null)
    // Blur the currently focused element (if any) to avoid re-triggering onFocus.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setSuppressFocus(true)
    setTimeout(() => setSuppressFocus(false), 900) // Adjust timeout as needed
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {(!isRunning && currentRound === 0) ? (
        <div className="w-full max-w-md mx-auto bg-gray-800 rounded shadow p-6 space-y-4">
          <div className="flex flex-col gap-4">
            <label className="text-lg">
              Setup Time (seconds):
              <input
                type="number"
                value={setupTime}
                onChange={(e) => handleInputChange(e.target.value, setSetupTime)}
                onFocus={() => {
                  if (!suppressFocus) setActiveField("setupTime")
                }}
                className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            </label>
            <label className="text-lg">
              Work Time (seconds):
              <input
                type="number"
                value={workTime}
                onChange={(e) => handleInputChange(e.target.value, setWorkTime)}
                onFocus={() => {
                  if (!suppressFocus) setActiveField("workTime")
                }}
                className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            </label>
            <label className="text-lg">
              Rest Time (seconds):
              <input
                type="number"
                value={restTime}
                onChange={(e) => handleInputChange(e.target.value, setRestTime)}
                onFocus={() => {
                  if (!suppressFocus) setActiveField("restTime")
                }}
                className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            </label>
            <label className="text-lg">
              Rounds:
              <input
                type="number"
                value={rounds}
                onChange={(e) => handleInputChange(e.target.value, setRounds)}
                onFocus={() => {
                  if (!suppressFocus) setActiveField("rounds")
                }}
                className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            </label>
          </div>
          <button
            onClick={startTimer}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-3 mt-4 text-xl"
          >
            Start Timer
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="min-w-[200px] flex items-center justify-center">
            <div className="text-6xl md:text-9xl font-mono mb-4">
              {formatTime(remainingTime)}
            </div>
          </div>
          <div className="text-2xl mb-4">
            {phase === "setup" && "Setup"}
            {phase === "work" && `Work — Round ${currentRound} of ${configRef.current.rounds}`}
            {phase === "rest" && `Rest — Round ${currentRound} of ${configRef.current.rounds}`}
          </div>
          <div className="bg-gray-800 rounded shadow p-4 flex gap-4">
            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded px-6 py-3 text-lg"
              >
                Pause
              </button>
            ) : (
              <>
                {remainingTime > 0 && (
                  <button
                    onClick={resumeTimer}
                    className="bg-green-500 hover:bg-green-600 text-white rounded px-6 py-3 text-lg"
                  >
                    Resume
                  </button>
                )}
              </>
            )}
            {currentRound > 0 && (
              <button
                onClick={restartCircuit}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded px-6 py-3 text-lg"
              >
                Reset
              </button>
            )}
            {circuitComplete && (
              <button
                onClick={newCircuit}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded px-6 py-3 text-lg"
              >
                New Circuit
              </button>
            )}
          </div>
        </div>
      )}
      {/* Render the custom Drawer when an input is active */}
      <Drawer isOpen={activeField !== null} onClose={handleCloseDrawer}>
        <ArrowUpwardIcon fontSize="large" onClick={increment} className="text-white cursor-pointer" />
        <ArrowDownwardIcon fontSize="large" onClick={decrement} className="text-white mt-4 cursor-pointer" />
      </Drawer>
    </div>
  )
}
