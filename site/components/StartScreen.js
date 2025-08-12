import { useState } from "react";

export default function StartScreen({ setToken, requestOtp, verifyOtp }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onRequest = async () => {
    if (!requestOtp) return;
    setLoading(true);
    setMessage("");
    const result = await requestOtp(email);
    if (result?.ok) {
      setStage("otp");
      setMessage("Code sent. Check your email.");
    } else {
      setMessage(result?.message || "Failed to request code.");
    }
    setLoading(false);
  };

  const onVerify = async () => {
    if (!verifyOtp) return;
    setLoading(true);
    setMessage("");
    const result = await verifyOtp(email, otp);
    if (result?.ok && result?.token) {
      setToken?.(result.token);
    } else {
      setMessage(result?.message || "Invalid code.");
    }
    setLoading(false);
  };

  return (
    <div>
      <p> Starting Screen</p>
      {stage === "email" ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <button onClick={onRequest} disabled={loading}>Continue</button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            maxLength={6}
          />
          <button onClick={onVerify} disabled={loading}>Verify</button>
        </>
      )}
      {message ? <p>{message}</p> : null}
    </div>
  );
}


