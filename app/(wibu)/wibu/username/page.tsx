"use client";

import SharedUsernameInput from "@/components/quiz/SharedUsernameInput";

export default function UsernamePage() {
  return (
    <SharedUsernameInput
      navTitle="🌸 WibuQuiz"
      navHref="/wibu"
      headerEmoji="✏️"
      headerTitle="Siapa namamu?"
      headerSubtitle="Masukkan username biar kartu hasilmu makin personal! 🌸"
      submitText="Lanjut ke Kuis 🚀"
      storageKey="wibu_username"
      redirectUrl="/wibu/quiz"
    />
  );
}
