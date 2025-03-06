'use client'
import { useState, useEffect, useRef } from "react"

// Helper function for speech synthesis.
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  window.speechSynthesis.speak(utterance)
}

type Phase = "setup" | "work" | "rest"

export default function Home() {
  // Timer settings.
  const [setupTime, setSetupTime] = useState<number>(5)
  const [workTime, setWorkTime] = useState<number>(20)
  const [restTime, setRestTime] = useState<number>(10)
  const [rounds, setRounds] = useState<number>(8)

  // Timer state.
  const [phase, setPhase] = useState<Phase>("setup")
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [circuitComplete, setCircuitComplete] = useState<boolean>(false)

  // Refs for immediate updates.
  const currentTimeRef = useRef<number>(0)
  const phaseRef = useRef<Phase>("setup") // Mirrors phase.
  const roundRef = useRef<number>(0) // Immediate round value.
  const announced10Ref = useRef<boolean>(false) // For "10 Seconds left".
  const announcedCircuitCompleteRef = useRef<boolean>(false) // For final circuit announcement.
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
        roundRef.current === rounds &&
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
        currentTimeRef.current = workTime
        setRemainingTime(workTime)
        announced10Ref.current = false
      } else if (phaseRef.current === "work") {
        // End of work phase → announce "Time" and move to rest.
        speak("Time")
        setPhase("rest")
        phaseRef.current = "rest"
        currentTimeRef.current = restTime
        setRemainingTime(restTime)
      } else if (phaseRef.current === "rest") {
        // End of rest phase.
        if (roundRef.current < rounds) {
          // More rounds remain → start next work phase.
          const nextRound = roundRef.current + 1
          roundRef.current = nextRound
          setCurrentRound(nextRound)
          speak(`Round ${nextRound} Begin`)
          setPhase("work")
          phaseRef.current = "work"
          currentTimeRef.current = workTime
          setRemainingTime(workTime)
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

  const startTimer = () => {
    if (isRunning) return
    // Initialize timer to setup phase.
    setPhase("setup")
    phaseRef.current = "setup"
    roundRef.current = 0
    setCurrentRound(0)
    currentTimeRef.current = setupTime
    setRemainingTime(setupTime)
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
    setCircuitComplete(false)
    setPhase("setup")
    phaseRef.current = "setup"
    roundRef.current = 0
    setCurrentRound(0)
    currentTimeRef.current = setupTime
    setRemainingTime(setupTime)
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white p-4">
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-bold">Tabata Rounds</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        {(!isRunning && currentRound === 0) ? (
          <div className="w-full max-w-md mx-auto bg-gray-800 rounded shadow p-6 space-y-4">
            <div className="flex flex-col gap-4">
              <label className="text-lg">
                Setup Time (seconds):
                <input
                  type="number"
                  value={setupTime}
                  onChange={(e) => setSetupTime(Number(e.target.value))}
                  className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
                />
              </label>
              <label className="text-lg">
                Work Time (seconds):
                <input
                  type="number"
                  value={workTime}
                  onChange={(e) => setWorkTime(Number(e.target.value))}
                  className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
                />
              </label>
              <label className="text-lg">
                Rest Time (seconds):
                <input
                  type="number"
                  value={restTime}
                  onChange={(e) => setRestTime(Number(e.target.value))}
                  className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
                />
              </label>
              <label className="text-lg">
                Rounds:
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
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
            {/* Time display container to avoid layout shifting */}
            <div className="min-w-[200px] flex items-center justify-center">
              <div className="text-6xl md:text-9xl font-mono mb-4">
                {formatTime(remainingTime)}
              </div>
            </div>
            <div className="text-2xl mb-4">
              {phase === "setup" && "Setup"}
              {phase === "work" && `Work — Round ${currentRound} of ${rounds}`}
              {phase === "rest" && `Rest — Round ${currentRound} of ${rounds}`}
            </div>
            {/* Buttons container with dark background */}
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
                  {remainingTime > 0 ? (
                    <button
                      onClick={resumeTimer}
                      className="bg-green-500 hover:bg-green-600 text-white rounded px-6 py-3 text-lg"
                    >
                      Resume
                    </button>
                  ) : null}
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
      </main>
      <footer className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} tabatarounds.com
      </footer>
    </div>
  )
}
