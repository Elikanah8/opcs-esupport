import { redirect } from "next/navigation";

// Redirect root URL to the login page
export default function Home() {
  redirect("/login");
}
