'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import Image from 'next/image'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    if (password === 'enitec2026') {
      localStorage.setItem('auth', 'true')
      router.push('/dashboard')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(160deg, #0a1628 0%, #0f2040 50%, #0a1a2e 100%)'}}>

      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">

        {/* Suelo */}
        <rect x="0" y="820" width="1440" height="80" fill="#0d1f35" opacity="0.8"/>
        <line x1="0" y1="820" x2="1440" y2="820" stroke="#1e3a5f" strokeWidth="1.5"/>

        {/* Torre izquierda */}
        <g stroke="#4a9eca" strokeWidth="1.2" fill="none" opacity="0.4">
          <line x1="100" y1="820" x2="118" y2="350" />
          <line x1="175" y1="820" x2="157" y2="350" />
          <line x1="96"  y1="720" x2="179" y2="720" />
          <line x1="99"  y1="610" x2="176" y2="610" />
          <line x1="103" y1="500" x2="172" y2="500" />
          <line x1="106" y1="420" x2="169" y2="420" />
          <line x1="96"  y1="720" x2="137" y2="610" /><line x1="179" y1="720" x2="137" y2="610" />
          <line x1="99"  y1="610" x2="137" y2="500" /><line x1="176" y1="610" x2="137" y2="500" />
          <line x1="103" y1="500" x2="137" y2="420" /><line x1="172" y1="500" x2="137" y2="420" />
          <line x1="80"  y1="350" x2="195" y2="350" />
          <line x1="80"  y1="350" x2="80"  y2="380" />
          <line x1="137" y1="350" x2="137" y2="380" />
          <line x1="195" y1="350" x2="195" y2="380" />
          <circle cx="80"  cy="385" r="4" />
          <circle cx="137" cy="385" r="4" />
          <circle cx="195" cy="385" r="4" />
        </g>

        {/* Torre derecha */}
        <g stroke="#4a9eca" strokeWidth="1.2" fill="none" opacity="0.4">
          <line x1="1265" y1="820" x2="1283" y2="320" />
          <line x1="1340" y1="820" x2="1322" y2="320" />
          <line x1="1261" y1="720" x2="1344" y2="720" />
          <line x1="1264" y1="610" x2="1341" y2="610" />
          <line x1="1268" y1="500" x2="1337" y2="500" />
          <line x1="1271" y1="410" x2="1334" y2="410" />
          <line x1="1261" y1="720" x2="1302" y2="610" /><line x1="1344" y1="720" x2="1302" y2="610" />
          <line x1="1264" y1="610" x2="1302" y2="500" /><line x1="1341" y1="610" x2="1302" y2="500" />
          <line x1="1268" y1="500" x2="1302" y2="410" /><line x1="1337" y1="500" x2="1302" y2="410" />
          <line x1="1245" y1="320" x2="1360" y2="320" />
          <line x1="1245" y1="320" x2="1245" y2="350" />
          <line x1="1302" y1="320" x2="1302" y2="350" />
          <line x1="1360" y1="320" x2="1360" y2="350" />
          <circle cx="1245" cy="355" r="4" />
          <circle cx="1302" cy="355" r="4" />
          <circle cx="1360" cy="355" r="4" />
        </g>

        {/* Líneas de alta tensión */}
        <g stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.3">
          <path d="M80,380  Q400,450 720,430 Q1040,410 1245,355" />
          <path d="M137,380 Q400,470 720,450 Q1040,430 1302,355" />
          <path d="M195,380 Q400,490 720,470 Q1040,450 1360,355" />
        </g>

        {/* Subestación central sutil */}
        <g stroke="#2a5a7a" strokeWidth="1" fill="none" opacity="0.4">
          <rect x="600" y="680" width="240" height="140" />
          <line x1="600" y1="680" x2="720" y2="640" /><line x1="840" y1="680" x2="720" y2="640" />
          <rect x="618" y="700" width="45" height="80" />
          <rect x="678" y="700" width="45" height="80" />
          <rect x="738" y="700" width="45" height="80" />
          <rect x="798" y="700" width="28" height="80" />
        </g>

        {/* Transformadores laterales */}
        <g stroke="#3a7a5a" strokeWidth="1" fill="none" opacity="0.35">
          <ellipse cx="240" cy="740" rx="28" ry="8" />
          <rect x="212" y="740" width="56" height="45" />
          <ellipse cx="240" cy="785" rx="28" ry="8" />
          <line x1="240" y1="732" x2="240" y2="710" />

          <ellipse cx="1200" cy="740" rx="28" ry="8" />
          <rect x="1172" y="740" width="56" height="45" />
          <ellipse cx="1200" cy="785" rx="28" ry="8" />
          <line x1="1200" y1="732" x2="1200" y2="710" />
        </g>


      </svg>

      {/* Glow inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-40 opacity-15" style={{background: 'linear-gradient(to top, #1d4ed8, transparent)'}} />

      <Card className="w-full max-w-sm shadow-2xl relative z-10 border-white/10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex justify-center">
            <Image src="/enitecsl-2 (1).png" alt="Logo" width={64} height={64} className="object-contain" />
          </div>
          <CardTitle className="text-xl">Subestaciones</CardTitle>
          <CardDescription>Introduce la contraseña para acceder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="pl-9"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={handleLogin} className="w-full">
            Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
