"use client";

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "../../constants/api";
import { fetchWithAuth } from "../../utils/axios";
import { decodeJWT } from "@/app/utils/decodeJWT";

function getInitials(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return "";
  if (!lastName) return firstName[0].toUpperCase();
  return (firstName[0] + lastName[0]).toUpperCase();
}

const ProfileCard: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [useremail, setUseremail] = useState<string | null>(null);
  const [useAccess, setUseAccess] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const initials = firstName ? getInitials(firstName, lastName || "") : "";

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) {
      console.log("No access token found in cookies");
      setLoading(false);
      return;
    }

    console.log("Access token:", token);

    const decoded = decodeJWT(token);
    if (!decoded) {
      console.log("Failed to decode JWT");
      setLoading(false);
      return;
    }

    console.log('Decoded JWT:', decoded);

    if (decoded?.name) {
      const fullName = decoded.name.trim();
      const nameParts = fullName.split(" ");
      if (nameParts.length > 1) {
        setFirstName(nameParts[0]);
        setLastName(nameParts[nameParts.length - 1]);
      } else {
        setFirstName(fullName);
        setLastName(null);
      }
      console.log("First name set:", nameParts[0]);
      console.log("Last name set:", nameParts[nameParts.length - 1] || "N/A");
    }

    if (decoded?.email || decoded?.Email || decoded?.user_email) {
      setUseremail(decoded.email || decoded.Email || decoded.user_email);
      console.log("Useremail set:", decoded.email || decoded.Email || decoded.user_email);
    } else {
      console.log("No email found in decoded JWT");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchUseaccess = async () => {
      if (!useremail) {
        console.log("Skipping API call: useremail is not yet set");
        setLoading(false);
        return;
      }

      const url = `${API_ROUTES.useaccess}?email=${useremail}`;
      console.log("Fetching user role from:", url);

      try {
        const res = await fetchWithAuth(url);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log("User role response:", data);
        setUseAccess(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Failed to fetch user role:", err.message);
        } else {
          console.error("Failed to fetch user role:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUseaccess();
  }, [useremail]);

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      // Clear the access token cookie
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
      // Redirect to the root path, middleware will handle the redirect to login
      router.replace("https://aisummary-api-usc-geemebfqfmead8f4.centralus-01.azurewebsites.net");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
      <p className="text-gray-500 mb-6">Manage your account information.</p>

      <div className="flex items-left gap-8 pt-6">
        <div className="flex items-center mb-6 flex-col w-[20%] gap-2">
          {initials && (
            <div className="w-32 h-32 text-4xl rounded-full bg-blue-500 text-white flex items-center justify-center">
              {initials}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-800">{firstName}</p>
          </div>
        </div>
        <div className="w-[75%]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-500">First name</p>
              <p className="text-gray-800 font-medium">{firstName || "Loading..."}</p>
            </div>
            <div>
              <p className="text-gray-500">Last name</p>
              <p className="text-gray-800 font-medium">{lastName || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-blue-600 font-medium">{useremail || "Loading..."}</p>
            </div>
            <div>
              <p className="text-gray-500">Role</p>
              <p className="text-gray-800 font-medium">
                {useAccess.role ? `${useAccess.role}` : loading ? "(...)" : ""}
              </p>
            </div>
          </div>
          <hr />
          <div className="w-full pt-4">
            <h3 className="text-xl font-semibold text-gray-800 ">Login-Methods</h3>
            <p className="text-gray-500 mb-4">Login into O2.ai</p>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4 border-o2">
              <div className="flex items-center">
                <div className="w-15 h-15 mr-3">
                  <Image
                    src="/Otow-log.svg"
                    alt="Otow Logo"
                    width={80}
                    height={49}
                  />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Login to O2.ai</p>
                  <p className="text-gray-500">Enable login with O2.ai</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg">
              <div>
                <p className="text-gray-800 font-medium">Log out on O2.ai</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 11V7a4 4 0 118 0v4m-8 0h8m-8 0H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
                  ></path>
                </svg>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;