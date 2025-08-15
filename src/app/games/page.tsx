import Link from 'next/link'

export default function GamesMenu() {
  return (
    <main style={{minHeight:'100dvh',background:'#0b1020',color:'#e7f0ff',display:'grid',placeItems:'center',padding:'40px'}}>
      <div style={{maxWidth:720,width:'min(92vw,720px)',border:'1px solid #1f2a44',borderRadius:18,padding:20,background:'#0b1228',boxShadow:'0 10px 40px #0008'}}>
        <h1 style={{margin:'0 0 8px'}}>Games</h1>
        <p style={{marginTop:0,color:'#bcd1f7'}}>Pick a quick-play arcade. Adds nicely to a Tabata session between rounds.</p>
        <ul style={{listStyle:'none',padding:0,margin:'16px 0',display:'grid',gap:12}}>
          <li style={{border:'1px solid #1f2a44',borderRadius:14}}>
            <Link href="/games/stackrush" style={{display:'flex',gap:12,alignItems:'center',padding:14,textDecoration:'none',color:'#e7f0ff'}}>
              <span style={{fontSize:24}}>🗼</span>
              <span>
                <strong style={{display:'block'}}>StackRush 20/10</strong>
                <small style={{color:'#9fb3c8'}}>One-button tower builder with 20s Work / 10s Rest twist</small>
              </span>
            </Link>
          </li>
        </ul>
        <p style={{color:'#9fb3c8',fontSize:12}}>Add more games by creating folders under <code>/app/games/*</code>.</p>
      </div>
    </main>
  )
}