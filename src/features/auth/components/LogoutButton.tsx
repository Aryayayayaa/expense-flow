"use client";

import { logoutAction } from "../actions/logout-action";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
      >
        Logout
      </button>
    </form>
  );
}
