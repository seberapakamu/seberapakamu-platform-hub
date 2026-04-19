import type { Metadata } from "next";
import SharedUsernameInput from "@/components/quiz/SharedUsernameInput";

export const metadata: Metadata = {
  title: "Mulai Kuis Bucin",
  alternates: {
    canonical: "https://seberapakamu.id/bucin/username",
  },
};

export default function BucinUsernamePage() {
  return (
    <SharedUsernameInput
      navTitle="💖 BucinQuiz"
      navHref="/bucin"
      headerEmoji="💌"
      headerTitle="Siapa Namamu?"
      headerSubtitle="Masukkan nama panggilanmu biar hasil kuis kebucinan ini makin personal dan seru!"
      submitText="Mulai Kuis! 💕"
      storageKey="bucin_username"
      redirectUrl="/bucin/quiz"
    />
  );
}
