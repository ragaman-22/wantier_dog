import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { STATIC_EVENTS } from '../data/events'

export type Event = {
  id: string
  title: string
  date: string
  end_date?: string
  time?: string
  location: string
  prefecture?: string
  category: string
  image?: string
  description?: string
  price?: number
  capacity?: number
  instagram?: string
  website?: string
  owner_id?: string
  is_public?: boolean
  popularity?: number
  latitude?: number
  longitude?: number
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data }) => {
        const dbEvents: Event[] = data ?? []
        const dbIds = new Set(dbEvents.map((e) => e.id))
        const merged = [...dbEvents, ...STATIC_EVENTS.filter((e) => !dbIds.has(e.id))]
        setEvents(merged)
        setLoading(false)
      })
  }, [])

  return { events, loading }
}

export function useEventById(id: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setEvent(data)
        setLoading(false)
      })
  }, [id])

  return { event, loading }
}
