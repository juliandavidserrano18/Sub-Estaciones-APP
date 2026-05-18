'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Folder, MoreVertical, Pencil, Trash2, LogOut, ChevronRight, Download } from 'lucide-react'
import Image from 'next/image'
import JSZip from 'jszip'

type Carpeta = { id: string; nombre: string; created_at: string }
type Proyecto = { id: string; nombre: string }

export default function ProyectoPage() {
  const router = useRouter()
  const { proyectoId } = useParams()
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [creando, setCreando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoNombre, setEditandoNombre] = useState('')
  const [descargandoId, setDescargandoId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (localStorage.getItem('auth') !== 'true') { router.push('/'); return }
    cargarDatos()
  }, [])

  useEffect(() => {
    if (creando && inputRef.current) inputRef.current.focus()
  }, [creando])

  const cargarDatos = async () => {
    const { data: p } = await supabase.from('proyectos').select('*').eq('id', proyectoId).single()
    setProyecto(p)
    const { data: c } = await supabase.from('carpetas').select('*').eq('proyecto_id', proyectoId).order('created_at', { ascending: true })
    setCarpetas(c || [])
  }

  const descargarCarpeta = async (carpeta: Carpeta) => {
    setDescargandoId(carpeta.id)
    const { data: archivos } = await supabase.from('archivos').select('*').eq('carpeta_id', carpeta.id)
    if (!archivos || archivos.length === 0) { alert('La carpeta está vacía'); setDescargandoId(null); return }
    const zip = new JSZip()
    for (const archivo of archivos) {
      const res = await fetch(archivo.url)
      const blob = await res.blob()
      zip.file(archivo.nombre, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${carpeta.nombre}.zip`
    a.click()
    URL.revokeObjectURL(url)
    setDescargandoId(null)
  }

  const crearCarpeta = async () => {
    if (!nuevoNombre.trim()) { setCreando(false); return }
    await supabase.from('carpetas').insert({ nombre: nuevoNombre, proyecto_id: proyectoId })
    setNuevoNombre('')
    setCreando(false)
    cargarDatos()
  }

  const guardarEdicion = async (id: string) => {
    if (!editandoNombre.trim()) { setEditandoId(null); return }
    await supabase.from('carpetas').update({ nombre: editandoNombre }).eq('id', id)
    setEditandoId(null)
    cargarDatos()
  }

  const eliminarCarpeta = async (id: string) => {
    if (!confirm('¿Eliminar esta sección y todos sus archivos?')) return
    await supabase.from('carpetas').delete().eq('id', id)
    cargarDatos()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm">
            <Image src="/enitecsl-2 (1).png" alt="Logo" width={28} height={28} className="object-contain" />
            <div className="w-px h-5 bg-border" />
            <button onClick={() => router.push('/dashboard')} className="font-semibold text-foreground hover:text-primary transition-colors">
              Subestaciones
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">{proyecto?.nombre}</span>
          </div>
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
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{proyecto?.nombre}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{carpetas.length} sección{carpetas.length !== 1 ? 'es' : ''}</p>
          </div>
          <Button onClick={() => setCreando(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva sección
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {carpetas.map((c) => (
            <Card
              key={c.id}
              className="group relative cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200"
              onClick={() => editandoId !== c.id && router.push(`/dashboard/${proyectoId}/${c.id}`)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Folder className="w-6 h-6 text-primary" />
                </div>

                {editandoId === c.id ? (
                  <Input
                    autoFocus
                    value={editandoNombre}
                    onChange={(e) => setEditandoNombre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') guardarEdicion(c.id)
                      if (e.key === 'Escape') setEditandoId(null)
                    }}
                    onBlur={() => guardarEdicion(c.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-center text-sm h-7 px-2"
                  />
                ) : (
                  <p
                    className="text-sm text-center font-medium leading-tight line-clamp-2 text-foreground"
                    onDoubleClick={(e) => { e.stopPropagation(); setEditandoId(c.id); setEditandoNombre(c.nombre) }}
                  >
                    {c.nombre}
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
                    <DropdownMenuItem onClick={() => { setEditandoId(c.id); setEditandoNombre(c.nombre) }}>
                      <Pencil className="w-4 h-4 mr-2" /> Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => descargarCarpeta(c)} disabled={descargandoId === c.id}>
                      <Download className="w-4 h-4 mr-2" /> {descargandoId === c.id ? 'Descargando...' : 'Descargar todo'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => eliminarCarpeta(c.id)}>
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
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-primary" />
                </div>
                <Input
                  ref={inputRef}
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') crearCarpeta(); if (e.key === 'Escape') setCreando(false) }}
                  onBlur={crearCarpeta}
                  placeholder="Nombre de la sección"
                  className="text-center text-sm h-7 px-2"
                />
              </CardContent>
            </Card>
          )}

          {carpetas.length === 0 && !creando && (
            <div className="col-span-full text-center py-16">
              <Folder className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No hay secciones todavía.</p>
              <p className="text-muted-foreground text-sm">Crea la primera con el botón de arriba.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
