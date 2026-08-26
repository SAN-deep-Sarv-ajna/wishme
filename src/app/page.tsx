import { redirect } from "next/navigation";

export default function Home() {
  // For the MVP, automatically redirect the root URL to the dashboard
  redirect("/dashboard");
}
