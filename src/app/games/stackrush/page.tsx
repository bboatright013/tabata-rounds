'use client'

import {useEffect, useRef, useState} from 'react'

// Helper: always get a non-null 2D context
function must2D(el: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = el.getContext('2d')
  if (!ctx) throw new Error('2D canvas not supported')
  return ctx
}

export default function StackRushPage(){
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const [gameState, setGameState] = useState<'menu'|'playing'|'over'>('menu')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState<number>(0)
  const [phaseLabel, setPhaseLabel] = useState('—')
  const [soundOn, setSoundOn] = useState(false)
  const audioRef = useRef<{ac: AudioContext | null; enabled: boolean}>({ ac: null, enabled: false })
  const scoreRef = useRef(0)

  // Load 'best' after mount to avoid SSR/CSR mismatch
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem('stackrush_best') || 0)
      if (Number.isFinite(v)) setBest(v)
    } catch {}
  }, [])

  // Keep a live reference to score for gameOver (avoid stale closure)
  useEffect(() => {
    scoreRef.current = score
    if (score > best) setBest(score) // show Best immediately when surpassed
  }, [score, best])

  // Persist best whenever it changes
  useEffect(() => {
    try { localStorage.setItem('stackrush_best', String(best)) } catch {}
  }, [best])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = must2D(c)

    let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    let W = 0, H = 0

    function resize(){
      const el = canvasRef.current
      if (!el) return
      const rect = el.parentElement?.getBoundingClientRect()
      W = Math.floor(rect?.width ?? 800)
      H = Math.floor(rect?.height ?? 600)
      DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      el.width  = Math.floor(W * DPR)
      el.height = Math.floor(H * DPR)
      ctx.setTransform(DPR,0,0,DPR,0,0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (c.parentElement) ro.observe(c.parentElement)

    // ---- Audio ----
    function ensureAudio(){ if(!audioRef.current.enabled) return; if(!audioRef.current.ac){ audioRef.current.ac = new (window.AudioContext || (window as any).webkitAudioContext)() } }
    function beep(freq=880, dur=0.06, type: OscillatorType='sine', gain=0.05){
      if(!audioRef.current.enabled) return
      ensureAudio()
      const ac = audioRef.current.ac
      if(!ac) return
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = type; o.frequency.setValueAtTime(freq, ac.currentTime)
      g.gain.setValueAtTime(gain, ac.currentTime)
      o.connect(g); g.connect(ac.destination)
      o.start()
      o.stop(ac.currentTime + dur)
    }
    function touchAudio(){ try{ ensureAudio(); const ac = audioRef.current.ac; ac && (ac as any).resume?.() }catch{} }
    function haptic(ms=10){ try { (navigator as any).vibrate?.(ms) } catch {} }

    // ---- Game model ----
    const WORK = 0, REST = 1 as const
    const PHASES = [ {kind:WORK, label:'Work 20s', secs:20}, {kind:REST, label:'Rest 10s', secs:10} ] as const
    let phaseIndex = 0, phaseElapsed = 0

    type Slab = {x:number,y:number,w:number,dir?:1|-1}
    let baseWidth = 0, slabHeight = 0, speedBase = 0, speedWorkBoost = 1.35, speed = 0
    let tower: Slab[] = []
    let mover: Slab | null = null
    let dir: 1|-1 = 1
    let combo = 0
    let cameraY = 0

    function currentPhase(){ return PHASES[phaseIndex] }
    function nextPhase(){ phaseIndex = (phaseIndex+1)%PHASES.length; phaseElapsed = 0; setPhaseLabel(currentPhase().label) }

    function reset(){
      phaseIndex=0; phaseElapsed=0; combo=0; cameraY=0; dir=1
      setScore(0)
      baseWidth = Math.min(W*0.7, 360)
      slabHeight = Math.max(16, Math.floor(H*0.03))
      speedBase = Math.max(100, Math.min(260, W*0.35))
      speed = speedBase
      const startX = (W - baseWidth)/2
      const baseY = H - slabHeight*2
      tower = [{x:startX,y:baseY,w:baseWidth}]
      mover = makeMover()
      setPhaseLabel(currentPhase().label)
    }

    function makeMover(): Slab{
      const last = tower[tower.length-1]
      const y = last.y - slabHeight
      const w = last.w
      const startX = dir>0 ? Math.max(-w, -W*0.6) : Math.min(W, W*1.6)
      return {x:startX,y,w,dir}
    }

    function gameOver(){
      setGameState('over')
      const finalScore = scoreRef.current
      setBest(prev => {
        const b = Math.max(prev, finalScore)
        try { localStorage.setItem('stackrush_best', String(b)) } catch {}
        return b
      })
    }

    function drop(){
      if(gameState!=='playing' || !mover) return
      const last = tower[tower.length-1]
      const overlapLeft = Math.max(last.x, mover.x)
      const overlapRight = Math.min(last.x + last.w, mover.x + mover.w)
      const overlap = overlapRight - overlapLeft
      if(overlap <= 1){ beep(160,.12,'sawtooth',.08); haptic(50); gameOver(); return }
      const offset = (mover.x - last.x)
      const perfect = Math.abs(offset) < 2
      if(perfect) { combo++; beep(1200,.05,'triangle',.05); haptic(20) } else { combo=0; beep(760,.03,'sine',.04) }
      const newW = overlap
      const newX = overlapLeft
      tower.push({x:newX,y:mover.y,w:newW})
      const basePts = 10 + Math.floor(newW/10)
      const mult = (currentPhase().kind===WORK?1.5:1) * (1 + combo*0.1)
      setScore(s=> s + Math.floor(basePts*mult))
      dir *= -1
      mover = makeMover()
      // camera follows in update()
      if(tower.length % 6 === 0){ speedBase += 10 }
    }

    function update(dt:number){
      if(gameState!=='playing' || !mover) return
      phaseElapsed += dt
      if(phaseElapsed >= currentPhase().secs){ nextPhase() }
      const phaseBoost = currentPhase().kind===WORK ? speedWorkBoost : 1
      speed = speedBase * phaseBoost
      mover.x += (mover.dir as number) * speed * dt
      if((mover.dir as number)>0 && mover.x + mover.w >= W) mover.dir = -1
      if((mover.dir as number)<0 && mover.x <= 0) mover.dir = 1

      // Smooth camera: keep the active layer near mid-screen (a bit below center)
      const activeY = mover ? mover.y : (tower.length ? tower[tower.length-1].y : H - slabHeight*2)
      const desiredY = H * 0.55
      const targetCam = Math.max(0, desiredY - activeY)
      cameraY += (targetCam - cameraY) * Math.min(1, 8 * dt)
    }

    function roundRect(c:CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number){
      const rr = Math.min(r, h/2, w/2)
      c.beginPath()
      c.moveTo(x+rr, y)
      c.arcTo(x+w, y, x+w, y+h, rr)
      c.arcTo(x+w, y+h, x, y+h, rr)
      c.arcTo(x, y+h, x, y, rr)
      c.arcTo(x, y, x+w, y, rr)
      c.closePath()
    }

    function draw(){
      const work = (PHASES[phaseIndex].kind===WORK)
      const t = phaseElapsed / PHASES[phaseIndex].secs
      const g1 = work ? '#0b162e' : '#081a12'
      const g2 = work ? '#14386b' : '#0f3a24'
      const grd = ctx.createLinearGradient(0,0,0,H)
      grd.addColorStop(0,g1); grd.addColorStop(1,g2)
      ctx.fillStyle = grd
      ctx.fillRect(0,0,W,H)

      const ribbonH = 8
      ctx.fillStyle = work ? '#ff6b8a' : '#65f2a0'
      ctx.fillRect(0,0,W,ribbonH)
      ctx.fillStyle = work ? '#ffc6d1' : '#b5ffd3'
      ctx.fillRect(0,0,W*t,ribbonH)

      ctx.save()
      ctx.translate(0, cameraY)
      for(let i=0;i<tower.length;i++){
        const s = tower[i]
        const hue = 200 + (i*11)%100
        ctx.fillStyle = `hsl(${hue} 80% 60%)`
        roundRect(ctx, s.x, s.y, s.w, slabHeight, 6)
        ctx.fill()
      }
      if(mover){
        ctx.globalAlpha = .15
        ctx.fillStyle = '#000'
        roundRect(ctx, mover.x, mover.y+slabHeight+6, mover.w, 6, 3)
        ctx.fill()
        ctx.globalAlpha = 1
        const hue = 200 + (tower.length*11)%100
        ctx.fillStyle = `hsl(${hue} 90% 70%)`
        roundRect(ctx, mover.x, mover.y, mover.w, slabHeight, 6)
        ctx.fill()
        ctx.globalAlpha = .12
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, mover.y+slabHeight, W, 1)
        ctx.globalAlpha = 1
      }
      ctx.restore()

      if(combo>0 && gameState==='playing'){
        ctx.font = '600 16px Inter, system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,.9)'
        ctx.fillText(`Combo x${(1+combo*0.1).toFixed(1)}`, 12, 28)
      }
    }

    // ---- Loop ----
    let last = 0, rafId = 0
    function frame(ts:number){
      if(!last) last = ts
      const dt = Math.min(.033, (ts - last)/1000)
      last = ts
      if(gameState==='playing') update(dt)
      draw()
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    // ---- Input ----
    function onPress(){
      touchAudio(); haptic(10); beep(520,.02,'square',.02)
      if (gameState !== 'playing') { setGameState('playing'); return }
      drop()
    }
    function keyHandler(e:KeyboardEvent){ if(e.code==='Space' || e.code==='Enter'){ e.preventDefault(); onPress() } }
    c.addEventListener('pointerdown', onPress)
    window.addEventListener('keydown', keyHandler)

    // Initialize playfield when in 'playing'
    if (gameState === 'playing') {
      reset()
      beep(900,.08,'sine',.05)
    }

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      c.removeEventListener('pointerdown', onPress)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [gameState])

  const toggleSound = () => {
    setSoundOn(s => {
      const next = !s
      audioRef.current.enabled = next
      try { (audioRef.current.ac as any)?.resume?.() } catch {}
      return next
    })
  }

  const share = async () => {
    const msg = `I scored ${score} in StackRush 20/10! Can you beat me?`
    try {
      if(navigator.share){ await navigator.share({title:'StackRush 20/10', text:msg, url:location.href}) }
      else { await navigator.clipboard.writeText(`${msg} ${location.href}`) }
    } catch {}
  }

  return (
    <div style={{position:'relative',flex:1,blockSize:'100%',background:'#0b1020',color:'#e7f0ff'}}>
      <div style={{position:'relative',inset:0,blockSize:'100%'}}>
        <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block',imageRendering:'-webkit-optimize-contrast'}} />

        {/* HUD */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'8px 12px'}}>
            <div className="chip" style={chipStyle}>Phase: <strong suppressHydrationWarning style={{color:'#fff',marginLeft:6}}>{phaseLabel}</strong></div>
            <div className="chip" style={chipStyle}>Score: <strong suppressHydrationWarning style={{color:'#fff',marginLeft:6}}>{score}</strong></div>
            <div className="chip" style={chipStyle}>Best: <strong suppressHydrationWarning style={{color:'#fff',marginLeft:6}}>{best}</strong></div>
            <button onClick={toggleSound} style={{...chipStyle,cursor:'pointer',pointerEvents:'auto'}} aria-label="Toggle sound">{soundOn?'🔊 Sound':'🔇 Sound'}</button>
          </div>
          {gameState !== 'playing' && (
            <div style={{marginTop:'auto',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:16}}>
              <button onClick={()=> setGameState('playing')} style={btnBigStyle}>▶️ Play</button>
            </div>
          )}
        </div>

        {/* Menu modal */}
        {gameState==='menu' && (
          <Modal>
            <h2>StackRush <span style={{color:'#9fb3c8'}}>20/10</span></h2>
            <p>One‑button tower builder with Tabata intervals: <strong>20s Work</strong>, <strong>10s Rest</strong>.</p>
            <p><strong>How to play:</strong> When the moving slab is above the stack, <kbd className="kbd">Click/Tap/Space</kbd> to drop it. Overhang is sliced off. Miss entirely and it’s over.</p>
            <div id="ad-interstitial" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:120,background:'#0f172a',color:'#a8c0ff',border:'1px dashed #334155',borderRadius:12,margin:'10px 0 16px'}}>Interstitial ad spot (menu)</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
              <button onClick={()=> setGameState('playing')} style={btnBigStyle}>🚀 Start</button>
            </div>
          </Modal>
        )}

        {/* Game over modal */}
        {gameState==='over' && (
          <Modal>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2>Game Over</h2>
              <span style={tagStyle}>Ad break</span>
            </div>
            <div id="ad-interstitial-over" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:180,background:'#0f172a',color:'#a8c0ff',border:'1px dashed #334155',borderRadius:12,margin:'10px 0 16px'}}>Your interstitial ad goes here</div>
            <p>Score: <strong>{score}</strong> — Best: <strong>{best}</strong></p>
            <p style={{color:'#9fb3c8'}}>Tip: Perfect drops grow your <strong>combo</strong> and boost points.</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
              <button onClick={()=> setGameState('playing')} style={btnStyle}>🔁 Play Again</button>
              <button onClick={share} style={btnStyle} title="Copy a shareable message">🔗 Share</button>
            </div>
          </Modal>
        )}
      </div>

      <style>{globalCss}</style>
    </div>
  )
}

// UI bits
const chipStyle: React.CSSProperties = {userSelect:'none',border:'1px solid #1e293b',background:'#0f172a99',color:'#cbd5e1',padding:'6px 10px',borderRadius:999,fontSize:12,display:'inline-flex',alignItems:'center',gap:6,backdropFilter:'blur(6px)',pointerEvents:'auto'}
const btnStyle: React.CSSProperties = {cursor:'pointer',border:'none',borderRadius:14,padding:'10px 12px',fontWeight:700,fontSize:15,letterSpacing:.3 as any,color:'#0b1020',background:'linear-gradient(180deg,#e2f3ff,#a7e8ff)',boxShadow:'0 8px 30px #00b1ff22, inset 0 1px 0 #fff'}
const btnBigStyle: React.CSSProperties = {...btnStyle, fontSize:18, padding:'14px 16px'}
const tagStyle: React.CSSProperties = {fontSize:12,fontWeight:700,color:'#111827',background:'#ffd86b',borderRadius:999,padding:'2px 8px'}

function Modal({children}:{children:React.ReactNode}){
  return (
    <div role="dialog" aria-modal="true" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#0b1020cc',backdropFilter:'blur(6px)'}}>
      <div style={{width:'min(520px,94vw)',border:'1px solid #1f2a44',background:'#0b1228',color:'#e7f0ff',borderRadius:18,boxShadow:'0 10px 40px #0008',padding:20}}>
        {children}
      </div>
    </div>
  )
}

const globalCss = `
  .kbd{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; background:#0f172a; border:1px solid #1f2a44; padding:.05rem .35rem; border-radius:6px; color:#cbd5e1; }
`