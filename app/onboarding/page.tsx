import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">🎨</div>
          <h1 className="text-3xl font-bold text-zinc-900">Make your avatar</h1>
          <p className="mt-1 text-zinc-500">
            Your person will see this when you connect. Take your time!
          </p>
        </div>
        <AvatarBuilder />
      </div>
    </div>
  );
}
