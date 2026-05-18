'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Upload, MoreVertical, Trash2, Download, Eye, FolderOpen, ChevronRight, LogOut, FileText, FileSpreadsheet, Presentation, File, Archive } from 'lucide-react'
import Image from 'next/image'

type Archivo = { id: string; nombre: string; url: string; tipo: string; created_at: string }
type Carpeta = { id: string; nombre: string }
type Proyecto = { id: string; nombre: string }

function FileIcon({ tipo, nombre }: { tipo: string; nombre: string }) {
  const ext = nombre?.split('.').pop()?.toLowerCase() || ''
  const isPdf = tipo?.includes('pdf') || ext === 'pdf'
  const isExcel = tipo?.includes('sheet') || tipo?.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)
  const isWord = tipo?.includes('word') || tipo?.includes('document') || ['doc', 'docx'].includes(ext)
  const isPpt = tipo?.includes('presentation') || tipo?.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)
  const isZip = tipo?.includes('zip') || tipo?.includes('rar') || ['zip', 'rar', '7z'].includes(ext)

  if (isPdf) return (
    <div className="w-14 h-16 bg-red-500 rounded-lg flex flex-col items-center justify-center shadow-sm gap-1">
      <FileText className="w-5 h-5 text-white" />
      <span className="text-white text-[10px] font-bold tracking-wide">PDF</span>
    </div>
  )
  if (isExcel) return (
    <div className="w-14 h-16 bg-green-600 rounded-lg flex flex-col items-center justify-center shadow-sm gap-1">
      <FileSpreadsheet className="w-5 h-5 text-white" />
      <span className="text-white text-[10px] font-bold tracking-wide">EXCEL</span>
    </div>
  )
  if (isWord) return (
    <div className="w-14 h-16 bg-blue-600 rounded-lg flex flex-col items-center justify-center shadow-sm gap-1">
      <FileText className="w-5 h-5 text-white" />
      <span className="text-white text-[10px] font-bold tracking-wide">WORD</span>
    </div>
  )
  if (isPpt) return (
    <div className="w-14 h-16 bg-orange-500 rounded-lg flex flex-col items-center justify-center shadow-sm gap-1">
      <Presentation className="w-5 h-5 text-white" />
      <span className="text-white text-[10px] font-bold tracking-wide">PPOINT</span>
    </div>
  )
  if (isZip) return (
    <div className="w-14 h-16 bg-yellow-500 rounded-lg flex flex-col items-center justify-center shadow-sm gap-1">
      <Archive className="w-5 h-5 text-white" />
      <span className="text-white text-[10px] font-bold tracking-wide">ZIP</span>
    </div>
  )
  return (
    <div className="w-14 h-16 bg-slate-400 rounded-lg flex flex-col items-center justify-center shadow-sm gap-1">
      <File className="w-5 h-5 text-white" />
      <span className="text-white text-[10px] font-bold tracking-wide">{ext.toUpperCase() || 'FILE'}</span>
    </div>
  )
}

export default function CarpetaPage() {
  const router = useRouter()
  const { proyectoId, carpetaId } = useParams()
  const [carpeta, setCarpeta] = useState<Carpeta | null>(null)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [inputKey, setInputKey] = useState(0)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<Archivo | null>(null)

  useEffect(() => {
    if (localStorage.getItem('auth') !== 'true') { router.push('/'); return }
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: p } = await supabase.from('proyectos').select('*').eq('id', proyectoId).single()
    setProyecto(p)
    const { data: c } = await supabase.from('carpetas').select('*').eq('id', carpetaId).single()
    setCarpeta(c)
    const { data: a } = await supabase.from('archivos').select('*').eq('carpeta_id', carpetaId).order('created_at', { ascending: false })
    setArchivos(a || [])
  }

  const subirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setSubiendo(true)
    for (const file of Array.from(files)) {
      const nombreUnico = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error } = await supabase.storage.from('archivos').upload(nombreUnico, file)
      if (error) { alert(`Error al subir "${file.name}": ${error.message}`); continue }
      const { data: urlData } = supabase.storage.from('archivos').getPublicUrl(nombreUnico)
      await supabase.from('archivos').insert({ nombre: file.name, url: urlData.publicUrl, tipo: file.type, carpeta_id: carpetaId })
    }
    setSubiendo(false)
    setInputKey(k => k + 1)
    cargarDatos()
  }

  const eliminarArchivo = async (id: string, url: string) => {
    if (!confirm('¿Eliminar este archivo?')) return
    const nombreArchivo = url.split('/').pop()
    await supabase.storage.from('archivos').remove([nombreArchivo!])
    await supabase.from('archivos').delete().eq('id', id)
    cargarDatos()
  }

  const getVisorUrl = (a: Archivo) => {
    const nombre = a.nombre?.toLowerCase()
    const tipo = a.tipo
    const isPdf = tipo?.includes('pdf') || nombre?.endsWith('.pdf')
    const isOffice = tipo?.includes('sheet') || tipo?.includes('excel') || tipo?.includes('word') || tipo?.includes('document') || tipo?.includes('presentation') || tipo?.includes('powerpoint') || ['xls', 'xlsx', 'csv', 'doc', 'docx', 'ppt', 'pptx'].some(e => nombre?.endsWith(e))
    if (isPdf) return { url: a.url, label: 'Visualizar PDF' }
    if (isOffice) return { url: `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(a.url)}`, label: 'Visualizar' }
    return null
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
            <button onClick={() => router.push(`/dashboard/${proyectoId}`)} className="text-muted-foreground hover:text-primary transition-colors">
              {proyecto?.nombre}
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">{carpeta?.nombre}</span>
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
            <h1 className="text-2xl font-bold text-foreground">{carpeta?.nombre}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{archivos.length} archivo{archivos.length !== 1 ? 's' : ''}</p>
          </div>
          <label className={`inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition cursor-pointer ${subiendo ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            {subiendo ? 'Subiendo...' : 'Subir archivos'}
            <input key={inputKey} type="file" onChange={subirArchivo} className="hidden" multiple disabled={subiendo} />
          </label>
        </div>

        {archivos.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-20 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Esta sección está vacía</p>
            <p className="text-primary text-sm mt-1">Sube archivos con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {archivos.map((a) => (
              <Card
                key={a.id}
                className="group relative cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200"
                onDoubleClick={() => setArchivoSeleccionado(a)}
              >
                <CardContent className="p-3 flex flex-col items-center gap-2">
                  {a.tipo?.startsWith('image/') ? (
                    <img src={a.url} alt={a.nombre} className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-24 bg-muted/50 rounded-lg flex items-center justify-center">
                      <FileIcon tipo={a.tipo} nombre={a.nombre} />
                    </div>
                  )}
                  <p className="text-xs text-center text-foreground font-medium leading-tight line-clamp-2 w-full">{a.nombre}</p>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {getVisorUrl(a) && (
                        <>
                          <DropdownMenuItem asChild>
                            <a href={getVisorUrl(a)!.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" /> {getVisorUrl(a)!.label}
                            </a>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <a href={a.url} download={a.nombre}>
                          <Download className="w-4 h-4 mr-2" /> Descargar
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => eliminarArchivo(a.id, a.url)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!archivoSeleccionado} onOpenChange={() => setArchivoSeleccionado(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold line-clamp-2 pr-4">
              {archivoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {archivoSeleccionado && getVisorUrl(archivoSeleccionado) && (
              <Button asChild className="w-full">
                <a href={getVisorUrl(archivoSeleccionado)!.url} target="_blank" rel="noopener noreferrer" onClick={() => setArchivoSeleccionado(null)}>
                  <Eye className="w-4 h-4 mr-2" /> {getVisorUrl(archivoSeleccionado)!.label}
                </a>
              </Button>
            )}
            {archivoSeleccionado && (
              <Button variant="outline" asChild className="w-full">
                <a href={archivoSeleccionado.url} download={archivoSeleccionado.nombre} onClick={() => setArchivoSeleccionado(null)}>
                  <Download className="w-4 h-4 mr-2" /> Descargar
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
