import supabase from "../supabase-client";
import { useEffect, useState } from "react";
import { Chart } from "react-charts";
import Form from "../components/Form";

export default function Dashboard() {
  // Stores aggregated sales metrics from the database
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    // Load data when the dashboard first mounts
    fetchMetrics();

    // Subscribe to realtime changes on the sales_deals table
    const channel = supabase
      .channel("deal-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales_deals",
        },
        (payload) => {
          // Refresh metrics whenever data changes
          fetchMetrics();
        }
      )
      .subscribe();

    // Remove realtime subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetches aggregated sales data from Supabase
  async function fetchMetrics() {
    try {
      const { data, error } = await supabase.from("sales_deals").select(
        `
                value.sum(),
                ...user_profiles!inner(
                name
                )
                `
      );
      if (error) {
        throw error;
      }
      // Save fetched data to state
      setMetrics(data);
    } catch (error) {
      console.error(`Error fetching metrics: `, error);
    }
  }

  // Transforms metrics into the format required by react-charts
  const chartData = [
    {
      data: metrics.map((m) => ({
        primary: m.name,
        secondary: m.sum,
      })),
    },
  ];

  // X-axis configuration
  const primaryAxis = {
    getValue: (d) => d.primary,
    scaleType: "band",
    padding: 0.2,
    position: "bottom",
  };

  // Y-axis configuration
  const secondaryAxes = [
    {
      getValue: (d) => d.secondary,
      scaleType: "linear",
      min: 0,
      max: y_max(),
      padding: {
        top: 20,
        bottom: 40,
      },
    },
  ];

  // Calculates a dynamic max value for the Y-axis
  function y_max() {
    if (metrics.length > 0) {
      const maxSum = Math.max(...metrics.map((m) => m.sum));
      return maxSum + 2000;
    }
    return 5000;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="chart-container">
        <h2>Total Sales This Quarter ($)</h2>
        <div style={{ flex: 1 }}>
          <Chart
            options={{
              data: chartData,
              primaryAxis,
              secondaryAxes,
              type: "bar",
              defaultColors: ["#58d675"],
              tooltip: {
                show: false,
              },
            }}
          />
        </div>
      </div>
      <Form metrics={metrics} />
    </div>
  );
}
