import { redirect } from "next/navigation"

export default function AppsRootRedirect() {
  redirect("/apps/dashboard")
}
