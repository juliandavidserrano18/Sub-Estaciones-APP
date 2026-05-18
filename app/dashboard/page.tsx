'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, FolderOpen, MoreVertical, Pencil, Trash2, LogOut, Download } from 'lucide-react'
import Image from 'next/image'
import JSZip from 'jszip'

type Proyecto = {
  id: string
  nombre: string
  descripcion: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [creando, setCreando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoNombre, setEditandoNombre] = useState('')
  const [descargandoId, setDescargandoId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (localStorage.getItem('auth') !== 'true') { router.push('/'); return }
    cargarProyectos()
  }, [])

  useEffect(() => {
    if (creando && inputRef.current) inputRef.current.focus()
  }, [creando])

  const cargarProyectos = async () => {
    const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false })
    setProyectos(data || [])
    setLoading(false)
  }

  const crearProyecto = async () => {
    if (!nuevoNombre.trim()) { setCreando(false); return }
    await supabase.from('proyectos').insert({ nombre: nuevoNombre })
    setNuevoNombre('')
    setCreando(false)
    cargarProyectos()
  }

  const guardarEdicion = async (id: string) => {
    if (!editandoNombre.trim()) { setEditandoId(null); return }
    await supabase.from('proyectos').update({ nombre: editandoNombre }).eq('id', id)
    setEditandoId(null)
    cargarProyectos()
  }

  const descargarProyecto = async (p: Proyecto) => {
    setDescargandoId(p.id)
    const { data: carpetas } = await supabase.from('carpetas').select('*').eq('proyecto_id', p.id)
    if (!carpetas || carpetas.length === 0) { alert('El proyecto está vacío'); setDescargandoId(null); return }
    const zip = new JSZip()
    for (const carpeta of carpetas) {
      const { data: archivos } = await supabase.from('archivos').select('*').eq('carpeta_id', carpeta.id)
      if (!archivos || archivos.length === 0) continue
      const folder = zip.folder(carpeta.nombre)!
      for (const archivo of archivos) {
        const res = await fetch(archivo.url)
        const blob = await res.blob()
        folder.file(archivo.nombre, blob)
      }
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${p.nombre}.zip`
    a.click()
    URL.revokeObjectURL(url)
    setDescargandoId(null)
  }

  const eliminarProyecto = async (id: string) => {
    if (!confirm('¿Eliminar este proyecto y todo su contenido?')) return
    await supabase.from('proyectos').delete().eq('id', id)
    cargarProyectos()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/enitecsl-2 (1).png" alt="Logo" width={28} height={28} className="object-contain" />
            <div className="w-px h-5 bg-border" />
            <span className="font-semibold text-foreground tracking-tight">Subestaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://trello.com/b/dkdbWv43/mantenimiento-enitec-naves-2026"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="default" className="gap-2 text-sm font-medium px-4">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V5.82c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v12.36zm10.44-6c0 .795-.645 1.44-1.44 1.44H15c-.795 0-1.44-.645-1.44-1.44V5.82c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v6.36z"/>
                </svg>
                Trello Subestaciones
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { localStorage.removeItem('auth'); router.push('/') }}
              className="text-muted-foreground gap-2"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setCreando(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {proyectos.map((p) => (
              <Card
                key={p.id}
                className="group relative cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200"
                onClick={() => editandoId !== p.id && router.push(`/dashboard/${p.id}`)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>

                  {editandoId === p.id ? (
                    <Input
                      autoFocus
                      value={editandoNombre}
                      onChange={(e) => setEditandoNombre(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') guardarEdicion(p.id)
                        if (e.key === 'Escape') setEditandoId(null)
                      }}
                      onBlur={() => guardarEdicion(p.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-center text-sm h-7 px-2"
                    />
                  ) : (
                    <p
                      className="text-sm text-center font-medium leading-tight line-clamp-2 text-foreground"
                      onDoubleClick={(e) => { e.stopPropagation(); setEditandoId(p.id); setEditandoNombre(p.nombre) }}
                    >
                      {p.nombre}
                    </p>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => { setEditandoId(p.id); setEditandoNombre(p.nombre) }}>
                        <Pencil className="w-4 h-4 mr-2" /> Renombrar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => descargarProyecto(p)} disabled={descargandoId === p.id}>
                        <Download className="w-4 h-4 mr-2" /> {descargandoId === p.id ? 'Descargando...' : 'Descargar todo'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => eliminarProyecto(p.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}

            {creando && (
              <Card className="border-primary/50 border-dashed">
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <Input
                    ref={inputRef}
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') crearProyecto(); if (e.key === 'Escape') setCreando(false) }}
                    onBlur={crearProyecto}
                    placeholder="Nombre del proyecto"
                    className="text-center text-sm h-7 px-2"
                  />
                </CardContent>
              </Card>
            )}

            {proyectos.length === 0 && !creando && (
              <div className="col-span-full text-center py-16">
                <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No hay proyectos todavía.</p>
                <p className="text-muted-foreground text-sm">Crea el primero con el botón de arriba.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
