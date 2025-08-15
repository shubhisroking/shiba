import React from "react";

export default function ShopItemRenderer({ image, itemName, price }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "16px",
      border: "1px solid #ddd",
      backgroundColor: "#fff"
    }}>
      <img
        src={image}
        alt={itemName}
        style={{
          width: "100%",
          height: "240px",
          objectFit: "cover",
          marginBottom: "12px"
        }}
      />
      <p style={{
        margin: "0 0 8px 0",
        fontSize: "16px",
        fontWeight: "600",
        textAlign: "left"
      }}>
        {itemName}
      </p>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <p style={{
          margin: "0",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#2d5a27"
        }}>
          {price}
        </p>
        <img
          src="/SSS.png"
          alt="SSS Currency"
          style={{
            width: "20px",
            height: "20px",
            objectFit: "contain"
          }}
        />
      </div>
    </div>
  );
}
