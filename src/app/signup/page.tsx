import { redirect } from "next/navigation";

/** Signup is not used — Google auth creates an account on first sign-in. */
export default function SignupPage() {
    redirect("/login");
}
