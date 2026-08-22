import { redirect } from "next/navigation";

// Redirects /get-started to /citizen/register
export default function GetStartedPage() {
  redirect("/citizen/register");
}
