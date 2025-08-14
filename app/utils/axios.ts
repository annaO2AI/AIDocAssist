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


// import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// const instance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

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
//   });

//   return response.data;
// };

// export async function fetchWithAuth(
//   input: RequestInfo,
//   init: RequestInit = {}
// ): Promise<Response> {
//   let token = null;

//   const cookieToken = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("access_token="))
//     ?.split("=")[1];

//   if (typeof window !== "undefined") {
//     const localToken = localStorage.getItem("access_token");
//     if (localToken) {
//       token = localToken;
//     } else if (cookieToken) {
//       token = cookieToken;
//     } else {
//       console.warn("No access token found in localStorage or cookies");
//     }
//   }

//   const headers: HeadersInit = {
//     ...(init.headers || {}),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };


//   if (
//     !(init.body instanceof FormData) &&
//     !(headers as Record<string, string>)["Content-Type"]
//   ) {
//     (headers as Record<string, string>)["Content-Type"] = "application/json";
//   }

//   return fetch(input, {
//     ...init,
//     headers,
//   });
// }

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
instance.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage first, then cookies
    let token = null;
    
    if (typeof window !== "undefined") {
      // Try localStorage first
      token = localStorage.getItem("access_token");
      
      // If no token in localStorage, try cookies
      if (!token) {
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];
        token = cookieToken;
      }
      
      // Add token to headers if found
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens on 401
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        // Clear cookie by setting it to expire
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        // Redirect to login or refresh the page to trigger middleware
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

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

  if (typeof window !== "undefined") {
    // Try localStorage first
    token = localStorage.getItem("access_token");
    
    // If no token in localStorage, try cookies
    if (!token) {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      token = cookieToken;
    }
  }

  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (
    !(init.body instanceof FormData) &&
    !(headers as Record<string, string>)["Content-Type"]
  ) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include', // Include cookies in the request
  });

  // Handle 401 responses
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    window.location.href = "/";
  }

  return response;
}