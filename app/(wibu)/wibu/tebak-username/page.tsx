"use client";

import SharedUsernameInput from "@/components/quiz/SharedUsernameInput";

export default function TebakUsernamePage() {
  return (
    <SharedUsernameInput
      navTitle="🎭 Tebak Karakter"
      navHref="/wibu"
      headerEmoji="🎌"
      headerTitle="Siapa namamu?"
      headerSubtitle="Masukkan username sebelum mulai tebak karakter anime! ✨"
      submitText="Mulai Tebak Karakter 🚀"
      storageKey="tebak_username"
      redirectUrl="/wibu/tebak-quiz"
    />
  );
}
