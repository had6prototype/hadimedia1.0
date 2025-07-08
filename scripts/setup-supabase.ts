import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

async function setupSupabase() {
  // Read environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log("Reading SQL script...")
    const sqlScript = fs.readFileSync(path.join(process.cwd(), "scripts", "setup-database.sql"), "utf8")

    console.log("Executing SQL script...")
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlScript })

    if (error) {
      throw error
    }

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupSupabase().catch(console.error)
