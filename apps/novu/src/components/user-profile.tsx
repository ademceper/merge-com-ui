import { useUser } from '@merge/auth';

export function UserProfile() {
  const { user } = useUser();

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-600">
      {user.firstName?.[0] ?? user.fullName?.[0] ?? '?'}
    </div>
  );
}
