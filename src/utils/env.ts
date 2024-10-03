import dotenv from "dotenv";
dotenv.config();

export const SUPABASE_URL:string = process.env.SUPABASE_URL || "";
export const SUPABASE_KEY:string = process.env.SUPABASE_KEY || "";
export const SECRET: string = process.env.SECRET || "";
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Supabase URL or Key is missing. Please check your environment variables."
  );
}
