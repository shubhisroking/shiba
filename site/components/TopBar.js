export default function TopBar({ title, image, onBack }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 64,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        borderBottom: "1px solid #000",
        paddingLeft: 16,
        paddingRight: 16,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        zIndex: 9999,
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={onBack}
        style={{
          width: 32,
          borderRadius: 4,
          border: "1px solid #000",
          height: 32,
          padding: 0,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src="back.svg" alt="Back" width={20} height={20} />
      </button>
      <p style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: 0 }}>{title}</p>
      <div
        style={{
          width: 48,
          height: 48,
          backgroundImage: `url(./${image})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </div>
  );
}


