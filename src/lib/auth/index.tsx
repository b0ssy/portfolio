import { createContext, useState, useEffect, useContext } from "react";
import axios, { AxiosInstance } from "axios";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { z } from "zod";

import { Configuration, AuthenticationApi, AdminApi } from "./api";
import { sleepFn } from "./utils";

export type StorageKey = "lastEnteredUsername" | "session";

export const zSession = z.object({
  userId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type Session = z.infer<typeof zSession>;

export interface AuthProps {
  storageKey?: string;
  baseUrl?: string;
  children: React.ReactNode;
}

// Holds the core auth context
export function Auth(props: AuthProps) {
  const [lastEnteredUsername, setLastEnteredUsername] = useState(() => {
    return localStorage.getItem(getKey("lastEnteredUsername")) ?? "";
  });
  const [session, setSession] = useState<Session | null>(() => {
    const item = localStorage.getItem(getKey("session"));
    const data = zSession.safeParse(JSON.parse(item ?? "{}"));
    return data.success ? data.data : null;
  });

  // Refresh token in background
  useEffect(() => {
    if (!session) {
      return;
    }
    const expiryThresholdMins = 30;
    const timer = setInterval(async () => {
      const decoded: any = jwtDecode(session.accessToken);
      if (decoded && typeof decoded.exp === "number") {
        const expiry = moment(decoded.exp * 1000);
        const isExpiring =
          expiry.diff(moment(), "minutes") <= expiryThresholdMins;
        if (isExpiring) {
          console.log("Renewing tokens...");
          const res = await new AuthenticationApi(
            createApiConfiguration(),
            undefined,
            createAxiosInstance()
          )
            .v1TokenPost({
              v1TokenPostRequestBody: {
                refreshToken: session.refreshToken,
              },
            })
            .catch(() => null);
          if (!res?.data.data) {
            console.error(`Failed to renew tokens: ${res?.data.code ?? "?"}`);
            return;
          }
          saveSession({
            userId: session.userId,
            ...res.data.data,
          });
          console.log("Renewed tokens");
        }
      }
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [session]);

  // Get storage key
  function getKey(key: StorageKey) {
    return `${props?.storageKey || "free-auth"}.${key}`;
  }

  // Save session
  function saveSession(session: Session | null) {
    setSession(session);
    if (session) {
      localStorage.setItem(getKey("session"), JSON.stringify(session));
    } else {
      localStorage.removeItem(getKey("session"));
    }
  }

  // Create axios instance
  function createAxiosInstance() {
    const axiosInstance = axios.create();
    const accessToken = session?.accessToken;
    if (accessToken) {
      axiosInstance.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      });
    }
    return axiosInstance;
  }

  // Create API configuration
  function createApiConfiguration() {
    const config: Configuration = {
      isJsonMime,
      basePath: props.baseUrl || undefined,
      accessToken: session?.accessToken || undefined,
    };
    return config;
  }

  return (
    <AuthContext.Provider
      value={{
        baseUrl: props.baseUrl,
        lastEnteredUsername,
        setLastEnteredUsername: (username) => {
          setLastEnteredUsername(username);
          if (username) {
            localStorage.setItem(getKey("lastEnteredUsername"), username);
          } else {
            localStorage.removeItem(getKey("lastEnteredUsername"));
          }
        },
        session: session ?? undefined,
        saveSession,
        createAxiosInstance,
        createApiConfiguration,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export interface LoggedInProps {
  children: React.ReactNode;
}

export function LoggedIn(props: LoggedInProps) {
  const { session } = useContext(AuthContext);

  return <>{!!session ? props.children : null}</>;
}

export interface LoggedOutProps {
  children: React.ReactNode;
}

export function LoggedOut(props: LoggedOutProps) {
  const { session } = useContext(AuthContext);

  return <>{!session ? props.children : null}</>;
}

// Hook to access auth related data
export function useAuth() {
  const {
    lastEnteredUsername,
    setLastEnteredUsername,
    session,
    saveSession,
    createAxiosInstance,
    createApiConfiguration,
  } = useContext(AuthContext);

  // Create admin api client
  function createAdminApi() {
    const api = new AdminApi(
      createApiConfiguration(),
      undefined,
      createAxiosInstance()
    );
    return api;
  }

  // Create auth api client
  function createAuthApi() {
    const api = new AuthenticationApi(
      createApiConfiguration(),
      undefined,
      createAxiosInstance()
    );
    return api;
  }

  // Signup new account by email and password
  async function signupByEmailPw(email: string, pw: string) {
    const res = await createAuthApi()
      .v1SignupEmailpwPost({
        v1SignupEmailpwPostRequestBody: {
          email,
          pw,
        },
      })
      .catch(() => null);
    return res?.data.code === "success";
  }

  // Verify new signup by email
  async function verifySignupByEmail(email: string, code: string) {
    const res = await createAuthApi()
      .v1SignupVerifyEmailPost({
        v1SignupVerifyEmailPostRequestBody: {
          email,
          code,
        },
      })
      .catch(() => null);
    return !!res;
  }

  // Reset account by email
  async function resetpwByEmail(email: string) {
    const res = await createAuthApi()
      .v1ResetpwEmailPost({
        v1ResetpwEmailPostRequestBody: {
          email,
        },
      })
      .catch(() => null);
    return res?.data.code === "success";
  }

  // Verify resetpw account by email
  async function verifyResetpwByEmail(email: string, code: string) {
    const res = await createAuthApi()
      .v1ResetpwVerifyEmailPost({
        v1ResetpwVerifyEmailPostRequestBody: {
          email,
          code,
        },
      })
      .catch(() => null);
    return res?.data.code === "success";
  }

  // Login by email and password
  async function loginByEmailPw(
    email: string,
    pw: string,
    options?: {
      hasRoleNames?: string[];
      sleepMs?: number;
    }
  ) {
    const sleepMs = options?.sleepMs ?? 1000;

    const res = await sleepFn(
      createAuthApi().v1LoginPost({
        v1LoginPostRequestBody: {
          email,
          pw,
          hasRoleNames: options?.hasRoleNames,
        },
      }),
      sleepMs
    ).catch(() => null);
    if (res?.data.code !== "success") {
      return null;
    }

    const session: Session = {
      userId: res.data.data.userId,
      accessToken: res.data.data.accessToken,
      refreshToken: res.data.data.refreshToken,
    };
    saveSession(session);

    return session;
  }

  // Login by username and password
  async function loginByUsername(
    username: string,
    pw: string,
    options?: {
      hasRoleNames?: string[];
      sleepMs?: number;
    }
  ) {
    const sleepMs = options?.sleepMs ?? 1000;

    const res = await sleepFn(
      createAuthApi().v1LoginPost({
        v1LoginPostRequestBody: {
          username,
          pw,
          hasRoleNames: options?.hasRoleNames,
        },
      }),
      sleepMs
    ).catch(() => null);
    if (res?.data.code !== "success") {
      return null;
    }

    const session: Session = {
      userId: res.data.data.userId,
      accessToken: res.data.data.accessToken,
      refreshToken: res.data.data.refreshToken,
    };
    saveSession(session);

    return session;
  }

  // Logout current session
  async function logout() {
    if (session) {
      createAuthApi()
        .v1LogoutPost({
          v1LogoutPostRequestBody: {
            refreshToken: session.refreshToken,
          },
        })
        .catch(() => null);
    }
    saveSession(null);
  }

  // Change password
  async function changepw(
    oldPw: string,
    newPw: string,
    options?: { sleepMs?: number }
  ) {
    const sleepMs = options?.sleepMs ?? 1000;

    const res = await sleepFn(
      createAuthApi().v1ChangepwPost({
        v1ChangepwPostRequestBody: {
          oldPw,
          newPw,
        },
      }),
      sleepMs
    ).catch(() => null);
    return res?.data.code === "success";
  }

  return {
    lastEnteredUsername,
    setLastEnteredUsername,
    session,
    signupByEmailPw,
    verifySignupByEmail,
    resetpwByEmail,
    verifyResetpwByEmail,
    loginByEmailPw,
    loginByUsername,
    logout,
    changepw,
    createAdminApi,
  };
}

// Helper function for axios config
const isJsonMime = (mime: string) => {
  const jsonMime: RegExp = new RegExp(
    // eslint-disable-next-line
    "^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$",
    "i"
  );
  return (
    mime !== null &&
    (jsonMime.test(mime) ||
      mime.toLowerCase() === "application/json-patch+json")
  );
};

const AuthContext = createContext<{
  baseUrl?: string;
  lastEnteredUsername: string;
  setLastEnteredUsername: (lastEnteredUsername: string) => void;
  session?: Session;
  saveSession: (session: Session | null) => void;
  createAxiosInstance: () => AxiosInstance;
  createApiConfiguration: () => Configuration;
}>({
  lastEnteredUsername: "",
  setLastEnteredUsername: () => {},
  saveSession: () => {},
  createAxiosInstance: () => {
    return axios;
  },
  createApiConfiguration: () => ({ isJsonMime }),
});
