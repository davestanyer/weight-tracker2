export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          height: number | null
          current_weight: number | null
          target_weight: number | null
          target_date: string | null
          calorie_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          height?: number | null
          current_weight?: number | null
          target_weight?: number | null
          target_date?: string | null
          calorie_goal?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string | null
          height?: number | null
          current_weight?: number | null
          target_weight?: number | null
          target_date?: string | null
          calorie_goal?: number
          updated_at?: string
        }
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          weight: number
          date: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          date: string
          note?: string
          created_at?: string
        }
        Update: {
          weight?: number
          date?: string
          note?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          type: string
          duration: number
          calories_burned: number | null
          date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          duration: number
          calories_burned?: number | null
          date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          type?: string
          duration?: number
          calories_burned?: number | null
          date?: string
          note?: string | null
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          description: string
          calories: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          description: string
          calories: number
          date: string
          created_at?: string
        }
        Update: {
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          description?: string
          calories?: number
          date?: string
        }
      }
      food_library: {
        Row: {
          id: string
          user_id: string
          name: string
          calories: number
          portion: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          calories: number
          portion: string
          created_at?: string
        }
        Update: {
          name?: string
          calories?: number
          portion?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}