export interface Video {
  id: number
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration?: number // in seconds
  class_id: number
  lesson_order?: number
  lesson_name?: string
  teacher_id: number
  created_at: string
  updated_at?: string
}

export interface CreateVideoDto {
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  class_id: number
  lesson_order?: number
  lesson_name?: string
}

export interface UpdateVideoDto {
  title?: string
  description?: string
  thumbnail_url?: string
  lesson_order?: number
  lesson_name?: string
}

// Format duration helper
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
