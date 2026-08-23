type AuthUser = {
  role: string;
  masterProfile?: { setupCompleted?: boolean } | null;
};

/** Куда отправить пользователя после входа / регистрации / с главной */
export function getPostAuthRedirect(user: AuthUser): string {
  if (user.role === "admin") return "/admin";
  if (user.role === "master") {
    if (!user.masterProfile?.setupCompleted) return "/profile/setup";
    return "/dashboard/master/orders";
  }
  return "/masters";
}

/** Редirect с главной, когда в JWT нет masterProfile */
export function getHomeRedirect(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "master") return "/dashboard";
  return "/masters";
}
