export interface CurrentUser {
  id: string;
  name: string;
}

const SIGNED_IN_USER: CurrentUser = { id: 'u_alex', name: 'Alex Rivera' };

/** The signed-in support agent. (Auth is out of scope; this is hard-coded.) */
export function useCurrentUser(): CurrentUser {
  return SIGNED_IN_USER;
}
