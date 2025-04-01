import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  ReclaimProofRequest,
  transformForOnchain,
} from "@reclaimprotocol/js-sdk";
import ConnectModal from "./components/ConnectModal";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { RpcProvider, Contract, Account, ec, json } from "starknet";
import transformProof from "./utils/helpers";

function ReclaimDemo() {
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState([]);
  const [username, setUsername] = useState("");

  const { address, account } = useAccount();
  const { disconnect } = useDisconnect();

  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  const handleVerifyProof = async () => {
    try {
      setVerified(false);
      setError(null);
      setTransactionHash(null);
      const transformedProofs = proofs.map((proof) => transformProof(proof));

      console.log(transformedProofs[0]);

      //   const transformedProofs = [{
      //     "proof": {
      //         "id": 0,
      //         "claim_info": {
      //             "provider": "http",
      //             "parameters": "{\"additionalClientOptions\":{},\"body\":\"\",\"geoLocation\":\"\",\"headers\":{\"Sec-Fetch-Mode\":\"same-origin\",\"Sec-Fetch-Site\":\"same-origin\",\"User-Agent\":\"Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.69 Mobile Safari/537.36\"},\"method\":\"GET\",\"paramValues\":{\"username\":\"AvinashNayak27\"},\"responseMatches\":[{\"invert\":false,\"type\":\"contains\",\"value\":\"<span class=\\\"color-fg-muted\\\">({{username}})</span>\"}],\"responseRedactions\":[{\"jsonPath\":\"\",\"regex\":\"<span class=\\\"color-fg-muted\\\">\\\\((.*)\\\\)</span>\",\"xPath\":\"\"}],\"url\":\"https://github.com/settings/profile\"}",
      //             "context": "{\"contextAddress\":\"0x0\",\"contextMessage\":\"\",\"extractedParameters\":{\"username\":\"AvinashNayak28\"},\"providerHash\":\"0xcb4a6b54d59f97b5891cced83e9e909c938bc06149a22f9e76309f2d20300609\"}"
      //         },
      //         "signed_claim": {
      //             "claim": {
      //                 "identifier": "0x341963dc7f4c29cf98824ba181a40042ec0876937414db4fac7390bb0896d163",
      //                 "byte_identifier": "0x341963dc7f4c29cf98824ba181a40042ec0876937414db4fac7390bb0896d163",
      //                 "owner": "0x6133b1b0cfa72dfd6d8600c499e9213c030fe0f5",
      //                 "epoch": "1",
      //                 "timestamp_s": "1743421238"
      //             },
      //             "signatures": [
      //                 {
      //                     "r": "0x54ac8514640f953e8de59e0e1be382d624c177d00721b7250c27c8517f781d79",
      //                     "s": "0x67d5551138f59e80a73d88d7cb793f71a08069c8601998d30ebb8e3ffe989fa8",
      //                     "v": 28
      //                 }
      //             ]
      //         }
      //     }
      // }]

      setLoading(true);
      const provider = new RpcProvider({
        nodeUrl: "https://starknet-sepolia.public.blastapi.io",
      });
      const contractAddress =
        "0x06ff309154d316c0f368e775907c975dfec4dea20b8050e7b257868bb686be53";
      const reclaimVerifierAddress =
        "0x0765f3f940f7c59288b522a44ac0eeba82f8bf71dd03e265d2c9ba3521466b4e"; // Replace with your contract address


      const { abi: contractAbi } = await provider.getClassAt(contractAddress);
      if (contractAbi === undefined) {
        throw new Error("no abi.");
      }
      const ReclaimContract = new Contract(
        contractAbi,
        contractAddress,
        provider
      );

      console.log("ReclaimContract", ReclaimContract);
      // @ts-ignore
      ReclaimContract.connect(account);
      const myCall = ReclaimContract.populate(
        "mint",
        [reclaimVerifierAddress, transformedProofs[0].proof]
      );
      console.log("myCall", myCall);
      const res = await ReclaimContract.mint(myCall.calldata);

      let hash = await provider.waitForTransaction(res.transaction_hash);
      setLoading(false);
      // @ts-ignore
      setTransactionHash(hash.transaction_hash);
      setVerified(true);
      console.log("hash", hash);
    } catch (error) {
      console.error("Verification failed:", error);
      setLoading(false);
      setError("Verification failed. Please try again.");
      setVerified(false);
    }
  };

  const getVerificationReq = async () => {
    const APP_ID = "0x992AF8b58254DF804D4E5DE452997CA2b7446F59";
    const APP_SECRET =
      "0x6b0ea4d48846eadcd58267ef1f577ff78a9c04ea4feaa58ea9e83a7b76a0540a";
    const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5";

    let isMobileDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent.toLocaleLowerCase()
      ) || window.orientation > -1;
    navigator.userAgent.toLocaleLowerCase().includes("android");
    let isAppleDevice =
      /mac|iphone|ipad|ipod/i.test(navigator.userAgent.toLocaleLowerCase()) ||
      void 0;
    let deviceType = isMobileDevice
      ? isAppleDevice
        ? "ios"
        : "android"
      : "desktop";

    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID,
      {
        device: deviceType,
        useAppClip: "desktop" !== deviceType,
      }
    );
    if (deviceType !== "desktop") {
      reclaimProofRequest.setRedirectUrl(
        "https://reclaim-onchain-starterkit-evm.vercel.app/"
      );
    }
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    const statusUrl = await reclaimProofRequest.getStatusUrl();
    localStorage.setItem("statusUrl", statusUrl);

    setRequestUrl(requestUrl);

    await reclaimProofRequest.startSession({
      onSuccess: (proofs) => {
        if (typeof proofs === "string") return proofs;
        let proofsArray = [];
        if (proofs) {
          proofsArray = Array.isArray(proofs) ? proofs : [proofs];
        }

        console.log("Verification success", proofs);
        const transformedProofs = proofsArray.map((proof) =>
          transformForOnchain(proof)
        );
        console.log("Transformed proofs:", transformedProofs);
        setProofs(proofsArray);
        setRequestUrl("");

        if (proofsArray.length > 0 && proofsArray[0]?.claimData?.context) {
          try {
            const extractedUsername = JSON.parse(
              proofsArray[0].claimData.context
            )?.extractedParameters?.username;
            setUsername(extractedUsername);
          } catch (error) {
            console.error("Error parsing claimData context:", error);
          }
        }
      },
      onError: (error) => {
        console.error("Verification failed", error);
      },
    });
  };

  useEffect(() => {
    const statusUrl = localStorage.getItem("statusUrl");
    if (statusUrl) {
      console.log("Status URL:", statusUrl);
      fetch(statusUrl)
        .then((response) => response.json())
        .then((res) => {
          if (res.session?.proofs) {
            setProofs(res.session.proofs);
            const transformedProofs = res.session.proofs.map((proof) =>
              transformForOnchain(proof)
            );
            console.log("Transformed proofs:", transformedProofs);
            setUsername(
              JSON.parse(res.session.proofs[0].claimData.context)
                ?.extractedParameters?.username
            );
          } else {
            getVerificationReq();
          }
        })
        .catch(() => {
          getVerificationReq();
        });
    } else {
      getVerificationReq();
    }
  }, []);

  const handleVerifyAnother = () => {
    localStorage.removeItem("statusUrl");
    setProofs([]);
    setUsername("");
    getVerificationReq();
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold text-center">
        Claim Faucet on Starknet
      </h1>

      {!address && <ConnectModal />}
      {address && (
        <div className="flex flex-row items-center justify-center gap-4">
          <p>
            Connected Address: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <button
            onClick={() => {
              disconnect();
            }}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Disconnect"
          >
            ❌
          </button>
        </div>
      )}
      {address && (
        <div className="w-full max-w-lg p-6 bg-gray-800 rounded-2xl shadow-lg text-center">
          {requestUrl && !proofs.length && (
            <div className="my-5 flex flex-col items-center">
              <p className="text-lg mb-3">
                Scan or tap (if on mobile) the QR Code to Verify
              </p>
              <div
                className="p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.open(requestUrl, "_blank")}
              >
                <QRCode
                  value={requestUrl}
                  size={180}
                  onClick={() => window.open(requestUrl, "_blank")}
                />
              </div>
            </div>
          )}
          {username && (
            <div className="mt-6 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center justify-center gap-3 mb-5 bg-gray-700 px-4 py-2 rounded-lg">
                <span className="text-lg font-medium">
                  Username: {username}
                </span>
                <button
                  onClick={handleVerifyAnother}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Verify Another"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleVerifyProof}
                disabled={loading}
                className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {loading ? 'Minting...' : 'Mint DevToken'}
              </button>

              {/* New UI elements for transaction status and errors */}
              {loading && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-300 mt-2">Transaction in progress...</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              {transactionHash && (
                <div className="mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                  <p className="text-green-200 mb-2">✅ Transaction Successful!</p>
                  <a
                    href={`https://sepolia.voyager.online/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    View on Voyager Explorer
                  </a>
                </div>
              )}

              {verified && (
                <div className="mt-4 text-green-400">
                  ✨ Minted Successfully!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReclaimDemo;
