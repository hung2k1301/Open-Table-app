"use client";

import Link from "next/link";
import AuthModal from "./AuthModal";
import { useContext } from "react";
import { AuthenticationContext } from "../context/AuthContext";
import useAuth from "../../hooks/useAuth";

export default function NavBar() {
  const { loading, data } = useContext(AuthenticationContext);
  const { signout } = useAuth();

  const handleClick = () => {
    signout();
  };

  return (
    <nav className="bg-white p-2 flex justify-between">
      <Link href="/" className="font-bold text-gray-700 text-2xl">
        OpenTable
      </Link>
      {loading ? (
        <div className="invisible flex">
          <AuthModal isSignIn={true} />
          <AuthModal isSignIn={false} />
        </div>
      ) : (
        <div className="flex">
          {data ? (
            <button
              className="border p-1 px-4 rounded bg-blue-400 text-white mr-3"
              onClick={handleClick}
            >
              Sign out
            </button>
          ) : (
            <>
              <AuthModal isSignIn={true} />
              <AuthModal isSignIn={false} />
            </>
          )}
        </div>
      )}
    </nav>
  );
}
