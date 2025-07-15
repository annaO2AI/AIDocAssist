// import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

// const instance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Generic request helper with strong typing
// export const apiRequest = async <TResponse = any, TBody = any>(
//   method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
//   url: string,
//   data?: TBody,
//   config?: AxiosRequestConfig
// ): Promise<TResponse> => {
//   const response: AxiosResponse<TResponse> = await instance.request({
//     url,
//     method,
//     data,
//     ...config,
//   })

//   return response.data
// }

// // export async function fetchWithAuth(
// //   input: RequestInfo,
// //   init: RequestInit = {}
// // ): Promise<Response> {
// //   const token = document.cookie
// //     .split("; ")
// //     .find((row) => row.startsWith("access_token="))
// //     ?.split("=")[1]

// //   const headers: HeadersInit = {
// //     ...(init.headers || {}),
// //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //   }

// //   if (
// //     !(init.body instanceof FormData) &&
// //     !(headers as Record<string, string>)["Content-Type"]
// //   ) {
// //     ;(headers as Record<string, string>)["Content-Type"] = "application/json"
// //   }

// //   return fetch(input, {
// //     ...init,
// //     headers,
// //   })
// // }


// export async function fetchWithAuth(
//   input: RequestInfo,
//   init: RequestInit = {}
// ): Promise<Response> {
//   // Initialize token variable
//   let token = null;
  
//   // First try to get token from cookies (fallback method)
//   const cookieToken = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("access_token="))
//     ?.split("=")[1];
    
//   // Then try to get token from localStorage (preferred method)
//   if (typeof window !== 'undefined') {
//     const localToken = localStorage.getItem('access_token');
//     // If localStorage has a token, use it
//     if (localToken) {
//       token = localToken;
//       console.log("Original token from localStorage:", token);
//     } else if (cookieToken) {
//       // Otherwise fall back to cookie token if it exists
//       token = cookieToken;
//       console.log("Original token from cookie:", token);
//     }
//   }

//   const headers: HeadersInit = {
//     ...(init.headers || {}),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   }
  
//   console.log("a: tokan", headers);

//   if (
//     !(init.body instanceof FormData) &&
//     !(headers as Record<string, string>)["Content-Type"]
//   ) {
//     ;(headers as Record<string, string>)["Content-Type"] = "application/json"
//   }

//   return fetch(input, {
//     ...init,
//     headers,
//   });
// }


import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiRequest = async <TResponse = any, TBody = any>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> => {
  const response: AxiosResponse<TResponse> = await instance.request({
    url,
    method,
    data,
    ...config,
  });

  return response.data;
};

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  let token = null;

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1];

  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("access_token");
    if (localToken) {
      token = localToken;
      console.log("Using token from localStorage:", token);
    } else if (cookieToken) {
      token = cookieToken;
      console.log("Using token from cookie:", token);
    } else {
      console.warn("No access token found in localStorage or cookies");
    }
  }

  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log("Request headers:", headers);

  if (
    !(init.body instanceof FormData) &&
    !(headers as Record<string, string>)["Content-Type"]
  ) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  return fetch(input, {
    ...init,
    headers,
  });
}