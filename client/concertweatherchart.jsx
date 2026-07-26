import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function ConcertWeatherChart({ weatherData }) {
  // Handle cases where the forecast is unavailable (> 15 days out or invalid date)
  if (!weatherData || !weatherData.available) {
    return (
      <div style={containerStyle}>
        <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.9rem' }}>
            {weatherData?.message || 'Concert weather forecast is not available yet.'}
        </p>
      </div>
    );
  }

  // 1. Temperature Bar Chart Data
  const tempChartData = [
    { label: 'Low Temp', temp: Math.round(weatherData.low), fill: '#3b82f6' },  // Blue
    { label: 'High Temp', temp: Math.round(weatherData.high), fill: '#ef4444' }  // Red
  ];

  // 2. Rain Probability Pie Chart Data
  const rainChance = weatherData.precipitationChance ?? 0;
  const rainData = [
    { name: 'Rain Chance', value: rainChance, fill: '#3b82f6' },
    { name: 'Clear', value: Math.max(100 - rainChance, 0), fill: '#282828' }
  ];

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#1DB954', fontSize: '1.1rem' }}>
            Concert Night Weather Forecast
        </h3>
        <p style={{ margin: '4px 0 0 0', color: '#b3b3b3', fontSize: '0.85rem' }}>
          {weatherData.location.city}, {weatherData.location.state} • {weatherData.date}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Temperature Comparison Chart */}
        <div style={cardStyle}>
          <p style={labelStyle}>Temperature Range (°F)</p>
          <div style={{ width: '100%', height: 130 }}>
            <ResponsiveContainer>
              <BarChart data={tempChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: '#b3b3b3', fontSize: 11 }} tickLine={false} />
                <YAxis unit="°" tick={{ fill: '#b3b3b3', fontSize: 11 }} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  formatter={(val) => [`${val}°F`, 'Temperature']}
                  contentStyle={{ backgroundColor: '#282828', borderColor: '#333', color: '#fff' }}
                />
                <Bar dataKey="temp" radius={[6, 6, 0, 0]} barSize={28}>
                  {tempChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precipitation Risk Donut Chart */}
        <div style={cardStyle}>
          <p style={labelStyle}>Precipitation Risk ({rainChance}%)</p>
          <div style={{ width: '100%', height: 130 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={rainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {rainData.map((entry, index) => (
                    <Cell key={`rain-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [name === 'Rain Chance' ? `${val}%` : `${val}%`, name]}
                  contentStyle={{ backgroundColor: '#282828', borderColor: '#333', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple Inline Component Styles
const containerStyle = {
  background: '#121212',
  color: '#ffffff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #282828',
  marginTop: '20px',
  fontFamily: 'sans-serif'
};

const cardStyle = {
  background: '#181818',
  padding: '12px',
  borderRadius: '8px'
};

const labelStyle = {
  margin: '0 0 8px 0',
  fontSize: '0.85rem',
  color: '#b3b3b3'
};