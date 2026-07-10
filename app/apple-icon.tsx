import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: 16,
            height: 108,
            background: "linear-gradient(to bottom, #d4a843, #9a7030)",
            borderRadius: 10,
            marginRight: 16,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            color: "#ffffff",
            display: "flex",
          }}
        >
          SK
        </div>
      </div>
    ),
    { ...size }
  );
}
