import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://xhspnqtmgqrvrqyfbmjy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc3BucXRtZ3FydnJxeWZibWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjc5NzUsImV4cCI6MjA4MDUwMzk3NX0.EWlifrDDPzfvOzebCSqDw3yYHaHesjvm1DlkaTewKhM'

export const supabase = createClient(supabaseUrl, supabaseKey)
