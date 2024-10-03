import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY } from "./env";

const supabase = createClient(SUPABASE_URL,SUPABASE_KEY);

const connect = async () => {
  try {
    const { error } = await supabase.auth.getSession();

    if (error) throw error;

    console.log("Supabase connection successful");
  } catch (error) {
    console.error("Error connecting to Supabase", error);
  }
};
export default connect;