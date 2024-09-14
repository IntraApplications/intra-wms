// app/api/process-repository/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const { repoDir } = await request.json();
  const supabase = createClient();

  try {
    // Authenticate the user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run repopack and output the result to a file
    const outputFilePath = path.join(repoDir, "repopack-output.txt");
    await execAsync(`npx repopack > ${outputFilePath}`, {
      cwd: repoDir,
    });

    // Return the file path and other data to be processed
    return NextResponse.json({ outputFilePath, repoDir });
  } catch (error) {
    console.error("Error processing repository:", error);
    return NextResponse.json(
      {
        error: "Failed to process repository",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
