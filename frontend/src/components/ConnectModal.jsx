"use client";

import React, { useEffect } from "react";
import { useConnect } from "@starknet-react/core";
import { Button } from "./ui/Button";
import Dialog from "./ui/Dialog";

export default function ConnectModal() {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    console.log(connectors);
  }, [connectors]);

  return (
    <Dialog title="Connect Wallet">
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={async () =>
              connector.available() ? connect({ connector }) : null
            }
            disabled={!connector.available()}
            className="flex flex-row items-center justify-start gap-4 w-96"
          >
            {connector.icon && (
              <img src={connector.icon} alt={`${connector.name} icon`} className="w-10 h-10" />
            )}
            <p>Connect {connector.name}</p>
          </Button>
        ))}
      </div>
    </Dialog>
  );
}
