
import React from "react";

type Props = {
  parcelName?: string;
  soilType?: string;
  ph?: number;
  organicMatter?: number;
  soilMoisture?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  dataSource?: string;
  isSample?: boolean;
  [key: string]: any;
};

export default function SoilMicroclimateCard({
  parcelName = "Selected parcel",
  soilType = "Loamy soil",
  ph = 6.5,
  organicMatter = 3.2,
  soilMoisture = 28,
  nitrogen = 45,
  phosphorus = 22,
  potassium = 160,
  dataSource = "Sample data",
  isSample = true,
}: Props) {
  const metrics = [
    { label: "Soil pH", value: ph, unit: "" },
    { label: "Organic matter", value: organicMatter, unit: "%" },
    { label: "Soil moisture", value: soilMoisture, unit: "%" },
    { label: "Nitrogen", value: nitrogen, unit: "mg/kg" },
    { label: "Phosphorus", value: phosphorus, unit: "mg/kg" },
    { label: "Potassium", value: potassium, unit: "mg/kg" },
  ];

  return (
    <section style={{
      background: "#ffffff",
      border: "1px solid #e2e9e3",
      borderRadius: "16px",
      padding: "20px",
      color: "#263b30",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>
            Soil & Microclimate
          </h3>
          <p style={{ color: "#718078", fontSize: "12px" }}>
            {parcelName} · {soilType}
          </p>
        </div>

        <span style={{
          background: isSample ? "#fff3dc" : "#e5f5e9",
          color: isSample ? "#94651a" : "#287b55",
          padding: "6px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700
        }}>
          {isSample ? "SAMPLE DATA" : "MEASURED DATA"}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        marginTop: "18px"
      }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{
            background: "#f5f8f5",
            padding: "13px",
            borderRadius: "11px"
          }}>
            <div style={{
              color: "#718078",
              fontSize: "11px"
            }}>
              {metric.label}
            </div>
            <strong style={{
              display: "block",
              fontSize: "19px",
              marginTop: "5px"
            }}>
              {metric.value}{metric.unit}
            </strong>
          </div>
        ))}
      </div>

      <p style={{
        color: "#718078",
        fontSize: "11px",
        marginTop: "16px",
        lineHeight: 1.5
      }}>
        Source: {dataSource}. Soil properties require laboratory
        analysis or validated soil datasets. NASA climate data
        does not directly measure soil fertility.
      </p>
    </section>
  );
}
