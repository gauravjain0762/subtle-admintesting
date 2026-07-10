import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 3,
            height: 20,
            background: "linear-gradient(to bottom, #d4a843, #9a7030)",
            borderRadius: 2,
            marginRight: 3,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 15,
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
