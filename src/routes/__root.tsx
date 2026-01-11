import axios from "axios";

import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

interface MyRouterContext {
  queryClient: QueryClient;
}

const axiosBase = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
  withCredentials: true,
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  loader: async ({ context }) => {
    const userId = "eialj7dd0altxg41lkgz8izz"; //hardcoded my userId
    const run = createIsomorphicFn()
      .client(async ({ userId }) => {
        const res = await context.queryClient.ensureQueryData(
          queryOptions({
            queryKey: ["config"],
            queryFn: async () =>
              await axiosBase.get(`/v1/user/${userId}/setting`),
            staleTime: Infinity,
          })
        );
        return res.data;
      })
      .server(async ({ userId }) => {
        const headers = getRequestHeaders();
        const res = await context.queryClient.ensureQueryData(
          queryOptions({
            queryKey: ["config"],
            queryFn: async () =>
              await axiosBase.get(`/v1/user/${userId}/setting`, {
                headers,
              }),
            staleTime: Infinity,
          })
        );
        return res.data;
      });
    const config = await run({ userId });
    console.log(config);
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
