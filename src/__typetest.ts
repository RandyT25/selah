import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

// Check what Schema resolves to
type SchemaType = Database["public"] extends { Tables: any; Views: any; Functions: any } ? "passes" : "fails";
type SchemaResult = SchemaType; // should be "passes" or "fails"

// Check createServerClient's Schema resolution  
type ServerSchema<D = Database> = D["public" & keyof D] extends { Tables: any; Views: any; Functions: any } ? D["public" & keyof D] : any;

// Test directly
type TestResult = ServerSchema extends { Tables: { devotionals: { Row: { title: any } } } } ? "has title" : "no title";
